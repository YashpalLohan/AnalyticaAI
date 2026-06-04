"""
AnalyticaAI — EDA Service
Generates chart-ready data and summary statistics from a pandas DataFrame.
All output is plain JSON-serializable Python — no Plotly, no binary blobs.
Recharts on the frontend consumes these data arrays directly.
"""
from __future__ import annotations

import io
import json
import logging
from typing import Any

import numpy as np
import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.storage import get_storage
from app.models.dataset import Dataset
from app.models.dataset_profile import DatasetProfile
from app.services.dataset_service import get_dataset

logger = logging.getLogger(__name__)

# ── Max limits (keep response size manageable) ────────────────────────────
MAX_HISTOGRAM_COLS   = 6
MAX_BAR_COLS         = 4
MAX_BAR_CATEGORIES   = 12   # top-N categories per bar chart
MAX_HISTOGRAM_BINS   = 20
MAX_ROWS_FOR_CHARTS  = 50_000  # sample only for chart data if dataset is huge


# ---------------------------------------------------------------------------
# Numpy / JSON safety
# ---------------------------------------------------------------------------

class _Safe(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, (np.integer,)):  return int(obj)
        if isinstance(obj, (np.floating,)):
            v = float(obj)
            return None if (np.isnan(v) or np.isinf(v)) else v
        if isinstance(obj, np.ndarray):     return obj.tolist()
        return super().default(obj)


def _clean(obj: Any) -> Any:
    return json.loads(json.dumps(obj, cls=_Safe))


def _s(v: Any) -> Any:
    """Single value safe cast."""
    if v is None: return None
    if isinstance(v, (np.integer,)): return int(v)
    if isinstance(v, (np.floating,)):
        fv = float(v)
        return None if (np.isnan(fv) or np.isinf(fv)) else fv
    if hasattr(v, "item"): return v.item()
    return v


# ---------------------------------------------------------------------------
# Chart generators
# ---------------------------------------------------------------------------

def _histogram(df: pd.DataFrame, col: str) -> dict:
    """
    Build histogram bin data for a numeric column.
    Returns: { type, column, title, data: [{bin, count}], stats }
    """
    series = df[col].dropna()
    if len(series) == 0:
        return None

    counts, bin_edges = np.histogram(series, bins=MAX_HISTOGRAM_BINS)
    data = [
        {
            "bin": f"{_s(bin_edges[i]):.2f}–{_s(bin_edges[i+1]):.2f}",
            "count": int(counts[i]),
            "bin_start": _s(bin_edges[i]),
            "bin_end":   _s(bin_edges[i + 1]),
        }
        for i in range(len(counts))
        if counts[i] > 0   # skip empty bins
    ]

    desc = series.describe()
    return {
        "type":   "histogram",
        "column": col,
        "title":  f"Distribution of {col}",
        "data":   data,
        "stats": {
            "mean":   _s(desc.get("mean")),
            "median": _s(series.median()),
            "std":    _s(desc.get("std")),
            "min":    _s(desc.get("min")),
            "max":    _s(desc.get("max")),
        },
    }


def _bar_chart(df: pd.DataFrame, col: str) -> dict:
    """
    Top-N value counts for a categorical column.
    Returns: { type, column, title, data: [{category, count}] }
    """
    counts = df[col].dropna().value_counts().head(MAX_BAR_CATEGORIES)
    if len(counts) == 0:
        return None

    data = [
        {"category": str(k), "count": int(v)}
        for k, v in counts.items()
    ]
    return {
        "type":   "bar",
        "column": col,
        "title":  f"{col} — Top {len(data)} Values",
        "data":   data,
    }


def _correlation_heatmap(df: pd.DataFrame, numeric_cols: list[str]) -> dict | None:
    """
    Pearson correlation matrix for all numeric columns.
    Returns: { type, title, columns, matrix: [[float]] }
    """
    if len(numeric_cols) < 2:
        return None

    corr = df[numeric_cols].corr(numeric_only=True)
    matrix = [
        [_s(corr.loc[r, c]) for c in numeric_cols]
        for r in numeric_cols
    ]
    return {
        "type":    "heatmap",
        "title":   "Correlation Heatmap",
        "columns": list(numeric_cols),
        "matrix":  matrix,
    }


def _line_chart(df: pd.DataFrame, date_col: str, value_cols: list[str]) -> dict | None:
    """
    Time-series line chart: date on x-axis, one or more numeric series.
    Returns: { type, title, data: [{date, col1, col2, ...}] }
    """
    if not date_col or not value_cols:
        return None

    try:
        tmp = df[[date_col] + value_cols].copy()
        tmp[date_col] = pd.to_datetime(tmp[date_col], errors='coerce')
        tmp = tmp.dropna(subset=[date_col]).sort_values(date_col)
        tmp[date_col] = tmp[date_col].dt.strftime('%Y-%m-%d')

        data = []
        for _, row in tmp.iterrows():
            point: dict = {"date": str(row[date_col])}
            for vc in value_cols:
                point[vc] = _s(row[vc])
            data.append(point)

        if len(data) == 0:
            return None

        return {
            "type":       "line",
            "title":      f"{', '.join(value_cols)} over {date_col}",
            "date_col":   date_col,
            "value_cols": value_cols,
            "data":       data,
        }
    except Exception:
        return None


def _scatter_chart(df: pd.DataFrame, x_col: str, y_col: str) -> dict | None:
    """
    Scatter plot for two numeric columns.
    Returns: { type, title, data: [{x, y}] }
    """
    try:
        tmp = df[[x_col, y_col]].dropna()
        if len(tmp) < 5:
            return None
        # Sample max 100 points for performance (scatter plots lag with too many points)
        if len(tmp) > 100:
            tmp = tmp.sample(100, random_state=42)

        data = [{"x": _s(row[x_col]), "y": _s(row[y_col])} for _, row in tmp.iterrows()]
        return {
            "type":  "scatter",
            "title": f"{x_col} vs {y_col}",
            "x_col": x_col,
            "y_col": y_col,
            "data":  data,
        }
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Summary statistics table
# ---------------------------------------------------------------------------

def _summary_statistics(df: pd.DataFrame, numeric_cols: list[str]) -> list[dict]:
    """
    Per-column descriptive statistics for all numeric columns.
    Returns list of row dicts compatible with a statistics table.
    """
    rows = []
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) == 0:
            continue
        desc = series.describe()
        rows.append({
            "column":   col,
            "count":    int(desc.get("count", 0)),
            "mean":     _s(desc.get("mean")),
            "std":      _s(desc.get("std")),
            "min":      _s(desc.get("min")),
            "p25":      _s(desc.get("25%")),
            "median":   _s(desc.get("50%")),
            "p75":      _s(desc.get("75%")),
            "max":      _s(desc.get("max")),
            "null_pct": round(float(df[col].isnull().mean() * 100), 1),
        })
    return rows


# ---------------------------------------------------------------------------
# Main EDA generator
# ---------------------------------------------------------------------------

def generate_eda(df: pd.DataFrame) -> dict:
    """
    Run full EDA on a DataFrame.
    - Statistics always use the full dataset
    - Charts use sampled data only if dataset > 50k rows (for performance)
    """
    original_rows = len(df)

    # Sample only for charts if dataset is very large (>50k rows)
    # This prevents frontend lag while keeping statistics accurate
    if original_rows > MAX_ROWS_FOR_CHARTS:
        df_charts = df.sample(MAX_ROWS_FOR_CHARTS, random_state=42)
    else:
        df_charts = df
    
    charts: list[dict] = []

    # Detect column types from the chart sample
    numeric_cols    = list(df_charts.select_dtypes(include="number").columns)
    categorical_cols = [
        c for c in df_charts.select_dtypes(include="object").columns
        if df_charts[c].nunique() <= 50
    ]
    date_cols = [
        c for c in df_charts.columns
        if 'date' in c.lower() or 'time' in c.lower()
    ]

    # ── Histograms (numeric) ──────────────────────────────────────────────
    for col in numeric_cols[:MAX_HISTOGRAM_COLS]:
        chart = _histogram(df_charts, col)
        if chart:
            charts.append(chart)

    # ── Bar charts (categorical — skip date-like columns) ────────────────
    bar_cols = [
        c for c in categorical_cols
        if 'date' not in c.lower() and 'time' not in c.lower()
    ]
    for col in bar_cols[:MAX_BAR_COLS]:
        chart = _bar_chart(df_charts, col)
        if chart:
            charts.append(chart)

    # ── Time-series line chart ────────────────────────────────────────────
    if date_cols and numeric_cols:
        date_col = date_cols[0]
        stds = {c: float(df_charts[c].std()) for c in numeric_cols if not np.isnan(float(df_charts[c].std() or 0))}
        top_numeric = sorted(stds, key=lambda c: stds[c], reverse=True)[:2]
        chart = _line_chart(df_charts, date_col, top_numeric)
        if chart:
            charts.append(chart)

    # ── Scatter (top 2 correlated numeric cols) ───────────────────────────
    if len(numeric_cols) >= 2:
        try:
            corr = df_charts[numeric_cols].corr(numeric_only=True).abs()
            np.fill_diagonal(corr.values, 0)
            max_pair = corr.stack().idxmax()
            chart = _scatter_chart(df_charts, max_pair[0], max_pair[1])
            if chart:
                charts.append(chart)
        except Exception:
            pass

    # ── Correlation heatmap ───────────────────────────────────────────────
    heatmap = _correlation_heatmap(df_charts, numeric_cols)
    if heatmap:
        charts.append(heatmap)

    # ── Summary statistics (use full df for accuracy) ─────────────────────
    statistics = _summary_statistics(df, numeric_cols)

    return _clean({
        "charts":     charts,
        "statistics": statistics,
        "shape": {
            "rows":                original_rows,
            "columns":             len(df.columns),
            "numeric_columns":     len(numeric_cols),
            "categorical_columns": len(categorical_cols),
        },
    })


# ---------------------------------------------------------------------------
# Public async service functions
# ---------------------------------------------------------------------------

async def run_eda(
    dataset_id: str,
    user_id: str,
    db: AsyncSession,
) -> dict:
    """
    Download the dataset file, run EDA, and return the result dict.
    Does NOT persist to DB — EDA results are stored in DatasetProfile.profile_json.
    """
    dataset: Dataset = await get_dataset(dataset_id, user_id, db)

    storage = get_storage()
    content = await storage.download(dataset.storage_path)

    # Parse
    ext = dataset.file_extension
    try:
        if ext in ("csv", "txt"):
            df = pd.read_csv(io.BytesIO(content))
        elif ext in ("xlsx", "xls"):
            df = pd.read_excel(io.BytesIO(content))
        elif ext == "json":
            df = pd.read_json(io.BytesIO(content))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "DATASET_FORMAT_UNSUPPORTED", "message": f"Unsupported type: {ext}"},
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "DATASET_CORRUPTED", "message": str(exc)},
        )

    try:
        eda_result = generate_eda(df)
    except Exception as exc:
        logger.error(f"EDA failed for {dataset_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "EDA_FAILED", "message": f"EDA error: {exc}"},
        )

    # Persist EDA result inside the existing DatasetProfile's profile_json
    # This avoids a separate DB table while still caching the result.
    result = await db.execute(
        select(DatasetProfile).where(DatasetProfile.dataset_id == dataset_id)
    )
    profile = result.scalar_one_or_none()
    if profile and profile.profile_json is not None:
        updated_json = dict(profile.profile_json)
        updated_json["eda"] = eda_result
        profile.profile_json = updated_json
        await db.flush()

    logger.info(
        f"EDA complete for {dataset_id}: "
        f"{len(eda_result['charts'])} charts, "
        f"{len(eda_result['statistics'])} stat rows"
    )
    return eda_result


async def get_eda(
    dataset_id: str,
    user_id: str,
    db: AsyncSession,
) -> dict:
    """Return cached EDA results from the profile_json, or 404."""
    await get_dataset(dataset_id, user_id, db)

    result = await db.execute(
        select(DatasetProfile).where(DatasetProfile.dataset_id == dataset_id)
    )
    profile = result.scalar_one_or_none()

    if not profile or not profile.profile_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EDA_NOT_FOUND", "message": "EDA has not been run yet. Profile the dataset first."},
        )

    eda = profile.profile_json.get("eda")
    if not eda:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EDA_NOT_FOUND", "message": "EDA has not been run yet."},
        )

    return eda
