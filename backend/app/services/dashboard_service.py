"""
AnalyticaAI — Dashboard Service
LLM-powered dashboard generation: picks KPI cards and charts automatically
from the dataset profile, then enriches each widget with real data.
"""
from __future__ import annotations

import io
import json
import logging
import uuid
from typing import Any

import numpy as np
import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.llm import get_llm
from app.core.storage import get_storage
from app.models.dataset import Dataset
from app.models.dataset_profile import DatasetProfile
from app.services.dataset_service import get_dataset

logger = logging.getLogger(__name__)

# ── JSON safety ────────────────────────────────────────────────────────────

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
    if v is None: return None
    if isinstance(v, (np.integer,)): return int(v)
    if isinstance(v, (np.floating,)):
        fv = float(v)
        return None if (np.isnan(fv) or np.isinf(fv)) else fv
    if hasattr(v, "item"): return v.item()
    return v

# ── Dashboard generation prompt ────────────────────────────────────────────

DASHBOARD_PROMPT = """You are a BI dashboard designer. Analyze this dataset profile and design a dashboard.

Dataset name: {dataset_name}
Columns: {columns}
Row count: {row_count}
Numeric columns: {numeric_cols}
Categorical columns: {categorical_cols}

Return ONLY valid JSON — no explanation, no markdown, no code blocks.
Design exactly 3 KPI cards, then 2-3 charts.

Rules:
- kpi_card: pick the most important numeric columns (sum or count makes sense)
- bar_chart: pick a categorical column and a numeric column to aggregate
- line_chart: only if there is a date/time column — pick date + best numeric column
- pie_chart: pick a categorical column with 3-8 unique values

JSON format:
{{
  "widgets": [
    {{
      "id": "w1",
      "type": "kpi_card",
      "title": "Total Revenue",
      "column": "revenue",
      "aggregation": "sum",
      "format": "currency"
    }},
    {{
      "id": "w2",
      "type": "kpi_card",
      "title": "Total Orders",
      "column": "order_id",
      "aggregation": "count",
      "format": "number"
    }},
    {{
      "id": "w3",
      "type": "kpi_card",
      "title": "Avg Order Value",
      "column": "order_value",
      "aggregation": "mean",
      "format": "currency"
    }},
    {{
      "id": "w4",
      "type": "bar_chart",
      "title": "Revenue by Region",
      "x_column": "region",
      "y_column": "revenue",
      "aggregation": "sum"
    }},
    {{
      "id": "w5",
      "type": "pie_chart",
      "title": "Orders by Category",
      "column": "category"
    }}
  ]
}}

Only use columns that actually exist in the dataset. If no date column, skip line_chart."""


# ── Data enrichment helpers ────────────────────────────────────────────────

def _format_value(val: float | int, fmt: str) -> str:
    """Format a numeric value for display."""
    if val is None:
        return "N/A"
    if fmt == "currency":
        if abs(val) >= 1_000_000:
            return f"${val / 1_000_000:.1f}M"
        if abs(val) >= 1_000:
            return f"${val / 1_000:.1f}K"
        return f"${val:,.2f}"
    if fmt == "percent":
        return f"{val:.1f}%"
    # number
    if isinstance(val, float):
        if abs(val) >= 1_000_000:
            return f"{val / 1_000_000:.1f}M"
        if abs(val) >= 1_000:
            return f"{val / 1_000:.1f}K"
        return f"{val:,.1f}"
    return f"{int(val):,}"


def _enrich_kpi(widget: dict, df: pd.DataFrame) -> dict:
    """Compute the KPI value from the DataFrame."""
    col = widget.get("column")
    agg = widget.get("aggregation", "sum")
    fmt = widget.get("format", "number")

    if col not in df.columns:
        # fallback: row count
        return {**widget, "value": _format_value(len(df), "number"), "raw_value": len(df)}

    series = pd.to_numeric(df[col], errors="coerce").dropna()

    if agg == "sum":
        raw = float(series.sum())
    elif agg == "mean":
        raw = float(series.mean()) if len(series) > 0 else 0.0
    elif agg == "count":
        raw = float(len(df))
    elif agg == "max":
        raw = float(series.max()) if len(series) > 0 else 0.0
    elif agg == "min":
        raw = float(series.min()) if len(series) > 0 else 0.0
    else:
        raw = float(series.sum())

    return {**widget, "value": _format_value(raw, fmt), "raw_value": _s(raw)}


def _enrich_bar(widget: dict, df: pd.DataFrame) -> dict:
    """Build bar chart data: group x_column, aggregate y_column."""
    x_col = widget.get("x_column")
    y_col = widget.get("y_column")
    agg   = widget.get("aggregation", "sum")

    if not x_col or x_col not in df.columns:
        return None
    if not y_col or y_col not in df.columns:
        # fallback: count
        counts = df[x_col].value_counts().head(10)
        data = [{"category": str(k), "value": int(v)} for k, v in counts.items()]
        return {**widget, "y_column": "count", "data": data}

    numeric = pd.to_numeric(df[y_col], errors="coerce")
    tmp = df[[x_col]].copy()
    tmp["_val"] = numeric

    if agg == "sum":
        grouped = tmp.groupby(x_col)["_val"].sum()
    elif agg == "mean":
        grouped = tmp.groupby(x_col)["_val"].mean()
    elif agg == "count":
        grouped = tmp.groupby(x_col)["_val"].count()
    else:
        grouped = tmp.groupby(x_col)["_val"].sum()

    grouped = grouped.dropna().sort_values(ascending=False).head(10)
    data = [{"category": str(k), "value": _s(v)} for k, v in grouped.items()]
    return {**widget, "data": data}


def _enrich_line(widget: dict, df: pd.DataFrame) -> dict:
    """Build line chart data: group by date, aggregate numeric column."""
    date_col = widget.get("x_column") or widget.get("date_column")
    y_col    = widget.get("y_column")

    if not date_col or date_col not in df.columns:
        return None
    if not y_col or y_col not in df.columns:
        return None

    try:
        tmp = df[[date_col, y_col]].copy()
        tmp[date_col] = pd.to_datetime(tmp[date_col], errors="coerce")
        tmp[y_col]    = pd.to_numeric(tmp[y_col], errors="coerce")
        tmp = tmp.dropna().sort_values(date_col)
        tmp[date_col] = tmp[date_col].dt.strftime("%Y-%m-%d")
        data = [{"date": str(row[date_col]), "value": _s(row[y_col])} for _, row in tmp.iterrows()]
        if len(data) == 0:
            return None
        # If too many points, sample evenly
        if len(data) > 100:
            step = len(data) // 100
            data = data[::step]
        return {**widget, "data": data}
    except Exception:
        return None


def _enrich_pie(widget: dict, df: pd.DataFrame) -> dict:
    """Build pie chart data: value counts of a categorical column."""
    col = widget.get("column")
    if not col or col not in df.columns:
        return None

    counts = df[col].dropna().value_counts().head(8)
    if len(counts) == 0:
        return None
    data = [{"label": str(k), "value": int(v)} for k, v in counts.items()]
    return {**widget, "data": data}


def _enrich_widget(widget: dict, df: pd.DataFrame) -> dict | None:
    """Dispatch to the correct enrichment function."""
    wtype = widget.get("type")
    try:
        if wtype == "kpi_card":  return _enrich_kpi(widget, df)
        if wtype == "bar_chart": return _enrich_bar(widget, df)
        if wtype == "line_chart": return _enrich_line(widget, df)
        if wtype == "pie_chart": return _enrich_pie(widget, df)
    except Exception as exc:
        logger.warning(f"Widget enrichment failed for {widget.get('id')}: {exc}")
    return None


# ── DataFrame loader ───────────────────────────────────────────────────────

def _load_df(content: bytes, ext: str) -> pd.DataFrame:
    try:
        if ext in ("csv", "txt"):    return pd.read_csv(io.BytesIO(content))
        if ext in ("xlsx", "xls"):   return pd.read_excel(io.BytesIO(content))
        if ext == "json":            return pd.read_json(io.BytesIO(content))
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


# ── Profile summary for the LLM ───────────────────────────────────────────

def _build_profile_summary(df: pd.DataFrame, profile_json: dict | None) -> dict:
    numeric_cols    = list(df.select_dtypes(include="number").columns)
    categorical_cols = [
        c for c in df.select_dtypes(include="object").columns
        if df[c].nunique() <= 50
    ]
    return {
        "numeric_cols":     numeric_cols,
        "categorical_cols": categorical_cols,
        "columns":          list(df.columns),
        "row_count":        len(df),
    }


# ── Main service functions ─────────────────────────────────────────────────

async def generate_dashboard(
    dataset_id: str,
    user_id: str,
    db: AsyncSession,
) -> dict:
    """
    Use the LLM to design a dashboard layout, then enrich each widget with
    real data from the dataset. Returns a dashboard dict ready for the frontend.
    """
    dataset: Dataset = await get_dataset(dataset_id, user_id, db)

    # Load file
    storage = get_storage()
    content = await storage.download(dataset.storage_path)
    df = _load_df(content, dataset.file_extension)

    # Get existing profile JSON for context
    profile_result = await db.execute(
        select(DatasetProfile).where(DatasetProfile.dataset_id == dataset_id)
    )
    profile_orm = profile_result.scalar_one_or_none()
    profile_json = profile_orm.profile_json if profile_orm else None

    summary = _build_profile_summary(df, profile_json)

    # Ask the LLM for a dashboard layout
    llm = get_llm()
    prompt = DASHBOARD_PROMPT.format(
        dataset_name=dataset.name,
        columns=", ".join(summary["columns"]),
        row_count=summary["row_count"],
        numeric_cols=", ".join(summary["numeric_cols"]) or "none",
        categorical_cols=", ".join(summary["categorical_cols"]) or "none",
    )

    try:
        response = await llm.ainvoke(prompt)
        raw_json = response.content.strip()

        # Strip markdown code fences if the LLM wrapped it
        if raw_json.startswith("```"):
            raw_json = raw_json.split("```")[1]
            if raw_json.startswith("json"):
                raw_json = raw_json[4:]
        raw_json = raw_json.strip()

        config = json.loads(raw_json)
    except Exception as exc:
        logger.error(f"LLM dashboard generation failed: {exc}", exc_info=True)
        # Fallback: build a simple dashboard without LLM
        config = _fallback_config(df, dataset.name)

    # Enrich widgets with real data — run in thread to avoid blocking event loop
    import asyncio as _asyncio
    loop = _asyncio.get_event_loop()

    def _enrich_all(widgets_raw):
        result = []
        for w in widgets_raw:
            if not w.get("id"):
                w["id"] = str(uuid.uuid4())
            enriched = _enrich_widget(w, df)
            if enriched is not None:
                result.append(enriched)
        return result

    widgets = await loop.run_in_executor(None, lambda: _enrich_all(config.get("widgets", [])))

    if not widgets:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "DASHBOARD_EMPTY", "message": "No widgets could be generated for this dataset."},
        )

    dashboard = _clean({
        "dataset_id":   dataset_id,
        "dataset_name": dataset.name,
        "widgets":      widgets,
    })

    # Cache dashboard in profile_json
    if profile_orm and profile_orm.profile_json is not None:
        updated = dict(profile_orm.profile_json)
        updated["dashboard"] = dashboard
        profile_orm.profile_json = updated
        await db.flush()

    logger.info(f"Dashboard generated for {dataset_id}: {len(widgets)} widgets")
    return dashboard


async def get_dashboard(
    dataset_id: str,
    user_id: str,
    db: AsyncSession,
) -> dict:
    """Return cached dashboard from profile_json, or 404."""
    await get_dataset(dataset_id, user_id, db)

    result = await db.execute(
        select(DatasetProfile).where(DatasetProfile.dataset_id == dataset_id)
    )
    profile = result.scalar_one_or_none()

    if not profile or not profile.profile_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "DASHBOARD_NOT_FOUND", "message": "Dashboard has not been generated yet."},
        )

    dashboard = profile.profile_json.get("dashboard")
    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "DASHBOARD_NOT_FOUND", "message": "Dashboard has not been generated yet."},
        )

    return dashboard


# ── Fallback dashboard (no LLM) ────────────────────────────────────────────

def _fallback_config(df: pd.DataFrame, name: str) -> dict:
    """Generate a basic dashboard config without calling the LLM."""
    numeric_cols = list(df.select_dtypes(include="number").columns)
    cat_cols = [c for c in df.select_dtypes(include="object").columns if df[c].nunique() <= 20]
    date_cols = [c for c in df.columns if "date" in c.lower() or "time" in c.lower()]

    widgets = []
    wid = 1

    # 3 KPI cards from first 3 numeric columns
    for col in numeric_cols[:3]:
        widgets.append({
            "id": f"w{wid}",
            "type": "kpi_card",
            "title": col.replace("_", " ").title(),
            "column": col,
            "aggregation": "sum",
            "format": "number",
        })
        wid += 1

    # Bar chart
    if cat_cols and numeric_cols:
        widgets.append({
            "id": f"w{wid}",
            "type": "bar_chart",
            "title": f"{numeric_cols[0].replace('_',' ').title()} by {cat_cols[0].replace('_',' ').title()}",
            "x_column": cat_cols[0],
            "y_column": numeric_cols[0],
            "aggregation": "sum",
        })
        wid += 1

    # Pie chart
    if len(cat_cols) > 1:
        widgets.append({
            "id": f"w{wid}",
            "type": "pie_chart",
            "title": f"Distribution by {cat_cols[0].replace('_',' ').title()}",
            "column": cat_cols[0],
        })
        wid += 1

    # Line chart if date column exists
    if date_cols and numeric_cols:
        widgets.append({
            "id": f"w{wid}",
            "type": "line_chart",
            "title": f"{numeric_cols[0].replace('_',' ').title()} Over Time",
            "x_column": date_cols[0],
            "y_column": numeric_cols[0],
        })

    return {"widgets": widgets}
