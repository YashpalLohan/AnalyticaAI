"""
AnalyticaAI — Profiling Service
Core data profiling logic: health score, column stats, cleaning suggestions.
All pure functions that operate on a pandas DataFrame — no DB calls here.
"""
from __future__ import annotations

import io
import json
import logging
from typing import Any

import numpy as np
import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.storage import get_storage
from app.models.dataset import Dataset
from app.models.dataset_column import DatasetColumn
from app.models.dataset_profile import DatasetProfile
from app.services.dataset_service import get_dataset

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# JSON-safe serialization helpers
# ---------------------------------------------------------------------------

class _NumpySafe(json.JSONEncoder):
    """Encode numpy scalars and NaN/Inf as JSON-safe Python types."""
    def default(self, obj: Any) -> Any:
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            v = float(obj)
            return None if (np.isnan(v) or np.isinf(v)) else v
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


def _safe(val: Any) -> Any:
    """Convert a single value to a JSON-safe Python primitive."""
    if val is None:
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        v = float(val)
        return None if (np.isnan(v) or np.isinf(v)) else v
    if isinstance(val, float) and (np.isnan(val) or np.isinf(val)):
        return None
    if hasattr(val, "item"):           # other numpy scalars
        return val.item()
    return val


def _sanitize_dict(d: dict) -> dict:
    """Recursively convert all numpy scalars in a dict to JSON-safe types."""
    return {k: _safe(v) for k, v in d.items()}


# ---------------------------------------------------------------------------
# DataFrame helpers
# ---------------------------------------------------------------------------

def _load_df(content: bytes, ext: str) -> pd.DataFrame:
    """Parse raw file bytes into a DataFrame."""
    try:
        if ext in ("csv", "txt"):
            return pd.read_csv(io.BytesIO(content))
        elif ext in ("xlsx", "xls"):
            return pd.read_excel(io.BytesIO(content))
        elif ext == "json":
            return pd.read_json(io.BytesIO(content))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "DATASET_FORMAT_UNSUPPORTED", "message": f"Unsupported file type: {ext}"},
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "DATASET_CORRUPTED", "message": f"Could not parse file: {exc}"},
        )


def _classify_column(series: pd.Series) -> str:
    """Return a simplified column type label."""
    if pd.api.types.is_bool_dtype(series):
        return "boolean"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if series.dtype == object:
        sample = series.dropna().head(20)
        try:
            pd.to_datetime(sample, infer_datetime_format=True)
            return "datetime"
        except Exception:
            pass
        return "categorical"
    return "mixed"


def _profile_column(df: pd.DataFrame, col: str) -> dict:
    """Return a JSON-safe dict of statistics for a single column."""
    series = df[col]
    col_type = _classify_column(series)

    null_count = int(series.isnull().sum())
    null_pct   = round(float(series.isnull().mean() * 100), 2)
    unique_count = int(series.nunique())

    # Sample values — convert everything to safe primitives
    sample_values: list[Any] = []
    for v in series.dropna().head(5).tolist():
        sv = _safe(v)
        if sv is None and not pd.isna(v):
            sv = str(v)
        sample_values.append(sv)

    stats: dict = {}
    if col_type == "numeric":
        desc = series.describe()
        stats = _sanitize_dict(desc.to_dict())

    return {
        "name":           col,
        "dtype":          str(series.dtype),
        "col_type":       col_type,
        "null_count":     null_count,
        "null_percentage": null_pct,
        "unique_count":   unique_count,
        "sample_values":  sample_values,
        "statistics":     stats,
    }


def _score_completeness(df: pd.DataFrame) -> float:
    """
    COMPLETENESS — weight 35%
    Based on DAMA DMBOK / ISO 8000.

    Two-tier penalty so per-column severity matters:
      - Global missing rate: penalised linearly
      - Per-column: each column >20% null adds an extra critical-column penalty
        because a column that is 30% empty is practically unusable for joins/groupbys
        (not just "a bit worse" than a 5%-empty column)

    Thresholds used by Talend DQS and Monte Carlo:
        0–5%   → acceptable   (no extra penalty)
        5–20%  → warning      (moderate penalty)
        20%+   → critical     (heavy per-column penalty)
    """
    rows, cols = df.shape
    total_cells = rows * cols

    # Global completeness rate
    global_missing_pct = float(df.isnull().sum().sum()) / max(total_cells, 1) * 100
    # Non-linear: square-root gives more credit to small improvements at high missing rates
    global_penalty = global_missing_pct ** 0.7 * 1.8   # ~0 at 0%, ~18 at 10%, ~40 at 30%

    # Per-column critical penalty: each column >20% null loses 5 extra pts (max 25)
    col_missing_pcts = df.isnull().mean() * 100
    critical_cols = (col_missing_pcts > 20).sum()
    critical_penalty = min(critical_cols * 5.0, 25.0)

    score = 100.0 - global_penalty - critical_penalty
    return round(max(score, 0.0), 1)


def _score_uniqueness(df: pd.DataFrame) -> float:
    """
    UNIQUENESS — weight 20%
    Exact duplicate rows corrupt every aggregation silently.
    3× penalty rate vs missing values (industry standard: duplicates are
    harder to detect downstream and cause compounding errors in joins).
    """
    dup_pct = float(df.duplicated().sum()) / max(len(df), 1) * 100
    penalty = min(dup_pct * 3.0, 60.0)   # 3× rate, max 60 pts off
    return round(max(100.0 - penalty, 0.0), 1)


def _score_validity(df: pd.DataFrame) -> float:
    """
    VALIDITY — weight 25%
    Checks for:
      - Non-parseable strings in columns whose majority values are numeric
        (e.g. 'abc' in a sales column — Great Expectations rule: expect_column_values_to_be_of_type)
      - Negative values in financial columns (business-rule violation)
      - Impossible values (age > 120 or age < 0)
      - Inconsistent date formats in date columns (3 formats = 2 extra issues)
    """
    import re
    rows = max(len(df), 1)
    validity_issues = 0

    # Non-parseable strings in predominantly-numeric columns
    for col in df.columns:
        if df[col].dtype == object:
            non_null = df[col].dropna()
            if len(non_null) == 0:
                continue
            numeric_attempt = pd.to_numeric(non_null, errors='coerce')
            coerce_failures = numeric_attempt.isna().sum()
            success_rate = 1 - coerce_failures / len(non_null)
            # Only flag if >50% of values ARE numeric (genuinely mixed column)
            if success_rate > 0.5:
                validity_issues += coerce_failures

    # Negative values in financial/revenue columns
    money_keywords = ('sales', 'price', 'revenue', 'profit', 'spend', 'amount',
                      'cost', 'income', 'total_spent', 'value')
    for col in df.select_dtypes(include='number').columns:
        if any(k in col.lower() for k in money_keywords):
            validity_issues += int((df[col] < 0).sum())

    # Impossible age values
    if 'age' in [c.lower() for c in df.columns]:
        age_col = next(c for c in df.columns if c.lower() == 'age')
        if pd.api.types.is_numeric_dtype(df[age_col]):
            validity_issues += int(((df[age_col] < 0) | (df[age_col] > 120)).sum())

    # Mixed date formats in date columns
    for col in df.columns:
        if 'date' in col.lower() and df[col].dtype == object:
            sample = df[col].dropna().astype(str)
            sample = sample[sample.str.strip() != ''].head(100).tolist()
            fmts = set()
            for v in sample:
                v = v.strip()
                if re.match(r'^\d{4}-\d{2}-\d{2}$', v):    fmts.add('iso')
                elif re.match(r'^\d{4}/\d{2}/\d{2}$', v):  fmts.add('slash')
                elif re.match(r'^\d{2}-\d{2}-\d{4}$', v):  fmts.add('dmy')
            if len(fmts) > 1:
                validity_issues += (len(fmts) - 1) * 2   # each extra format = 2 issues

    issue_rate = validity_issues / rows * 100
    # Non-linear: first few issues hurt a lot, then diminishing (log-like)
    penalty = min(issue_rate ** 0.6 * 12, 60.0)
    return round(max(100.0 - penalty, 0.0), 1)


def _score_consistency(df: pd.DataFrame) -> float:
    """
    CONSISTENCY — weight 20%
    Categorical columns with case/whitespace variants silently break
    every GROUP BY and filter downstream.
    e.g. 'Electronics', 'electronics', 'Electronics ' → 3 groups instead of 1.
    Each extra variant beyond the normalised count = 1 inconsistency.
    4 pts penalty per inconsistency (cap at 60).
    """
    inconsistencies = 0
    for col in df.select_dtypes(include='object').columns:
        vals = df[col].dropna().astype(str)
        if len(vals) == 0:
            continue
        raw_unique  = vals.nunique()
        norm_unique = vals.str.strip().str.lower().nunique()
        inconsistencies += max(raw_unique - norm_unique, 0)

    penalty = min(inconsistencies * 4.0, 60.0)
    return round(max(100.0 - penalty, 0.0), 1)


def _calculate_health_score(df: pd.DataFrame) -> tuple[float, dict]:
    """
    Industry-standard weighted data quality score.

    Dimensions and weights (DAMA DMBOK / Gartner):
        Completeness  35% — most impactful for analytics pipelines
        Validity      25% — wrong data is worse than missing data
        Uniqueness    20% — duplicates silently corrupt aggregations
        Consistency   20% — categorical chaos breaks groupbys and joins

    Returns:
        (overall_score, dimension_breakdown_dict)
    """
    completeness = _score_completeness(df)
    validity     = _score_validity(df)
    uniqueness   = _score_uniqueness(df)
    consistency  = _score_consistency(df)

    overall = (
        completeness * 0.35 +
        validity     * 0.25 +
        uniqueness   * 0.20 +
        consistency  * 0.20
    )

    breakdown = {
        "completeness": round(completeness, 1),
        "validity":     round(validity, 1),
        "uniqueness":   round(uniqueness, 1),
        "consistency":  round(consistency, 1),
    }

    return round(overall, 1), breakdown


def _build_cleaning_suggestions(df: pd.DataFrame, columns: list[dict]) -> list[dict]:
    """
    Build actionable cleaning suggestions covering all 4 quality dimensions:
    completeness, uniqueness, validity, and consistency.
    """
    import re
    suggestions: list[dict] = []
    rows = max(len(df), 1)

    # ── UNIQUENESS: duplicate rows ────────────────────────────────────────
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        dup_pct = round(dup_count / rows * 100, 1)
        suggestions.append({
            "issue":           "duplicate_rows",
            "dimension":       "uniqueness",
            "title":           f"{dup_count} duplicate row{'s' if dup_count != 1 else ''} ({dup_pct}%)",
            "description":     f"The dataset contains {dup_count} exact duplicate records "
                               f"({dup_pct}% of rows). These will double-count values in any aggregation.",
            "severity":        "high" if dup_pct > 5 else "medium",
            "fix":             "drop_duplicates",
            "affected_column": None,
        })

    # ── COMPLETENESS: missing values per column ───────────────────────────
    for col_info in columns:
        null_count = col_info["null_count"]
        null_pct   = col_info["null_percentage"]
        col_type   = col_info["col_type"]
        col_name   = col_info["name"]

        if null_count == 0:
            continue

        if null_pct > 50:
            suggestions.append({
                "issue":           "high_missing_values",
                "dimension":       "completeness",
                "title":           f"'{col_name}': {null_pct}% missing — column unusable",
                "description":     f"Over half of '{col_name}' is empty. "
                                   f"Imputation would introduce too much noise; dropping is recommended.",
                "severity":        "high",
                "fix":             "drop_column",
                "affected_column": col_name,
            })
        elif null_pct > 20:
            fix = "fill_median" if col_type == "numeric" else "fill_mode"
            suggestions.append({
                "issue":           "critical_missing_values",
                "dimension":       "completeness",
                "title":           f"'{col_name}': {null_pct}% missing — critical",
                "description":     f"'{col_name}' has {null_count} missing values ({null_pct}%). "
                                   f"Columns above 20% null degrade model and join quality significantly.",
                "severity":        "high",
                "fix":             fix,
                "affected_column": col_name,
            })
        elif null_pct > 0:
            fix = "fill_median" if col_type == "numeric" else "fill_mode"
            suggestions.append({
                "issue":           "missing_values",
                "dimension":       "completeness",
                "title":           f"'{col_name}': {null_pct}% missing ({null_count} rows)",
                "description":     f"Fill with {'median' if col_type == 'numeric' else 'most frequent value'}.",
                "severity":        "medium" if null_pct > 10 else "low",
                "fix":             fix,
                "affected_column": col_name,
            })

    # ── VALIDITY: mixed date formats ──────────────────────────────────────
    for col in df.columns:
        if 'date' in col.lower() and df[col].dtype == object:
            # Only check non-null, non-empty values
            sample = df[col].dropna().astype(str)
            sample = sample[sample.str.strip() != ''].head(200).tolist()
            if not sample:
                continue
            fmts: set[str] = set()
            for v in sample:
                v = v.strip()
                if re.match(r'^\d{4}-\d{2}-\d{2}$', v):    fmts.add('YYYY-MM-DD')
                elif re.match(r'^\d{4}/\d{2}/\d{2}$', v):  fmts.add('YYYY/MM/DD')
                elif re.match(r'^\d{2}-\d{2}-\d{4}$', v):  fmts.add('DD-MM-YYYY')
            # Only flag if there are genuinely 2+ different formats present
            if len(fmts) > 1:
                suggestions.append({
                    "issue":           "mixed_date_formats",
                    "dimension":       "validity",
                    "title":           f"'{col}': {len(fmts)} different date formats",
                    "description":     f"Found formats: {', '.join(sorted(fmts))}. "
                                       f"Mixed formats will cause parse errors in any date-based analysis.",
                    "severity":        "high",
                    "fix":             "standardize_dates",
                    "affected_column": col,
                })

    # ── VALIDITY: non-numeric values in numeric columns ───────────────────
    for col in df.columns:
        if df[col].dtype == object:
            non_null = df[col].dropna()
            if len(non_null) == 0:
                continue
            numeric_attempt = pd.to_numeric(non_null, errors='coerce')
            coerce_failures = int(numeric_attempt.isna().sum())
            success_rate = 1 - coerce_failures / len(non_null)
            if success_rate > 0.5 and coerce_failures > 0:
                suggestions.append({
                    "issue":           "invalid_type_values",
                    "dimension":       "validity",
                    "title":           f"'{col}': {coerce_failures} non-numeric value(s)",
                    "description":     f"Values like 'abc', 'xyz', 'test' found in a predominantly "
                                       f"numeric column. These will be treated as NaN in any calculation.",
                    "severity":        "high",
                    "fix":             "fill_median",
                    "affected_column": col,
                })

    # ── VALIDITY: negative values in financial columns ────────────────────
    money_kw = ('sales', 'price', 'revenue', 'profit', 'spend', 'amount',
                'cost', 'income', 'total_spent', 'value')
    for col in df.columns:
        if not any(k in col.lower() for k in money_kw):
            continue
        # Coerce to numeric to handle mixed-type columns (e.g. 'abc' mixed with numbers)
        numeric_series = pd.to_numeric(df[col], errors='coerce')
        if numeric_series.isna().all():
            continue   # fully non-numeric — skip
        neg_count = int((numeric_series < 0).sum())
        if neg_count > 0:
            suggestions.append({
                "issue":           "negative_financial_values",
                "dimension":       "validity",
                "title":           f"'{col}': {neg_count} negative value(s)",
                "description":     f"{neg_count} row(s) in '{col}' have negative values. "
                                   f"Most likely a sign entry error — converting to absolute value "
                                   f"is the standard correction.",
                "severity":        "high",
                "fix":             "abs_value",
                "affected_column": col,
            })

    # ── CONSISTENCY: case/whitespace variants in categoricals ─────────────
    for col in df.select_dtypes(include='object').columns:
        vals = df[col].dropna().astype(str)
        if len(vals) == 0:
            continue
        raw_unique  = vals.nunique()
        norm_unique = vals.str.strip().str.lower().nunique()
        diff = raw_unique - norm_unique
        if diff > 0:
            # Find example variants
            raw_vals  = set(vals.unique())
            norm_map: dict[str, list[str]] = {}
            for v in raw_vals:
                key = v.strip().lower()
                norm_map.setdefault(key, []).append(v)
            examples = [variants for variants in norm_map.values() if len(variants) > 1]
            example_str = ", ".join([f"'{v[0]}'/'{v[1]}'" for v in examples[:2]])
            suggestions.append({
                "issue":           "inconsistent_categories",
                "dimension":       "consistency",
                "title":           f"'{col}': {diff} inconsistent variant(s)",
                "description":     f"Same values exist in different cases or with extra spaces "
                                   f"(e.g. {example_str}). These create phantom groups in every GROUP BY.",
                "severity":        "medium",
                "fix":             "standardize_categories",
                "affected_column": col,
            })

    return suggestions


# ---------------------------------------------------------------------------
# JSON round-trip sanitizer
# ---------------------------------------------------------------------------

def _json_clean(obj: Any) -> Any:
    """
    Serialize obj through JSON using the numpy-safe encoder,
    then deserialize back. This guarantees the result only
    contains plain Python types that PostgreSQL JSONB will accept.
    """
    return json.loads(json.dumps(obj, cls=_NumpySafe))


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------

async def profile_dataset(
    dataset_id: str,
    user_id: str,
    db: AsyncSession,
) -> DatasetProfile:
    """
    Run full profiling on a dataset and persist results.
    Overwrites any existing profile for this dataset.
    Returns the saved DatasetProfile ORM instance.
    """
    # 1. Fetch dataset record (also validates ownership)
    dataset: Dataset = await get_dataset(dataset_id, user_id, db)

    try:
        # 2. Set status → profiling
        dataset.status = "profiling"
        await db.flush()

        # 3. Download file content from storage
        storage = get_storage()
        content = await storage.download(dataset.storage_path)

        # 4. Parse into DataFrame
        df = _load_df(content, dataset.file_extension)

        # 4b. Sample large datasets for speed — profiling 50k rows is representative
        # Full row count is still recorded from the original df
        MAX_PROFILE_ROWS = 50_000
        original_row_count = len(df)
        if original_row_count > MAX_PROFILE_ROWS:
            logger.info(f"Dataset {dataset_id} has {original_row_count} rows — sampling {MAX_PROFILE_ROWS} for profiling")
            df_profile = df.sample(MAX_PROFILE_ROWS, random_state=42)
        else:
            df_profile = df

        # 5. Profile each column — run CPU-heavy pandas work in a thread
        # so it doesn't block the async event loop
        import asyncio
        loop = asyncio.get_event_loop()

        def _run_profiling():
            cols = [_profile_column(df_profile, col) for col in df_profile.columns]
            score, dims = _calculate_health_score(df_profile)
            suggestions = _build_cleaning_suggestions(df_profile, cols)
            missing = int(df_profile.isnull().sum().sum())
            dups    = int(df_profile.duplicated().sum())
            mem_mb  = round(float(df.memory_usage(deep=True).sum()) / (1024 ** 2), 3)
            return cols, score, dims, suggestions, missing, dups, mem_mb

        (
            column_profiles,
            health_score,
            dimension_scores,
            cleaning_suggestions,
            missing_total,
            dup_count,
            memory_mb,
        ) = await loop.run_in_executor(None, _run_profiling)

        # 6. Top-level metrics
        row_count = int(original_row_count)
        col_count = int(len(df_profile.columns))

        # 7. JSON-sanitize everything before touching the DB
        column_profiles      = _json_clean(column_profiles)
        cleaning_suggestions = _json_clean(cleaning_suggestions)

        # 8. Delete old column records for this dataset
        await db.execute(
            delete(DatasetColumn).where(DatasetColumn.dataset_id == dataset_id)
        )

        # 9. Insert new DatasetColumn rows
        for col_info in column_profiles:
            col_record = DatasetColumn(
                dataset_id=dataset_id,
                column_name=col_info["name"],
                data_type=col_info["col_type"],
                null_count=col_info["null_count"],
                null_percentage=col_info["null_percentage"],
                unique_count=col_info["unique_count"],
                sample_values=col_info["sample_values"],
                statistics=col_info["statistics"],
            )
            db.add(col_record)

        # 10. Upsert DatasetProfile
        existing_result = await db.execute(
            select(DatasetProfile).where(DatasetProfile.dataset_id == dataset_id)
        )
        profile = existing_result.scalar_one_or_none()

        profile_json = _json_clean({
            "columns": column_profiles,
            "cleaning_suggestions": cleaning_suggestions,
            "dimension_scores": dimension_scores,
        })

        if profile is None:
            profile = DatasetProfile(
                dataset_id=dataset_id,
                row_count=row_count,
                column_count=col_count,
                missing_values=missing_total,
                duplicate_rows=dup_count,
                memory_usage_mb=memory_mb,
                health_score=health_score,
                profile_json=profile_json,
            )
            db.add(profile)
        else:
            profile.row_count      = row_count
            profile.column_count   = col_count
            profile.missing_values = missing_total
            profile.duplicate_rows = dup_count
            profile.memory_usage_mb = memory_mb
            profile.health_score   = health_score
            profile.profile_json   = profile_json

        # 11. Mark dataset as ready and commit
        dataset.status = "ready"
        await db.flush()

        logger.info(f"Profiling complete for dataset {dataset_id}: score={health_score}")
        return profile

    except HTTPException:
        # Roll back the aborted transaction then update status in a clean state
        await db.rollback()
        try:
            dataset.status = "failed"
            await db.flush()
        except Exception:
            pass
        raise

    except Exception as exc:
        logger.error(f"Profiling failed for dataset {dataset_id}: {exc}", exc_info=True)
        await db.rollback()
        try:
            dataset.status = "failed"
            await db.flush()
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "PROFILING_FAILED", "message": f"Profiling error: {exc}"},
        )


async def get_profile(
    dataset_id: str,
    user_id: str,
    db: AsyncSession,
) -> DatasetProfile:
    """Fetch an existing profile (raises 404 if not yet profiled)."""
    await get_dataset(dataset_id, user_id, db)

    result = await db.execute(
        select(DatasetProfile).where(DatasetProfile.dataset_id == dataset_id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "PROFILE_NOT_FOUND", "message": "Dataset has not been profiled yet."},
        )
    return profile


async def apply_cleaning(
    dataset_id: str,
    user_id: str,
    fixes: list[dict],
    db: AsyncSession,
) -> DatasetProfile:
    """
    Apply a list of cleaning fixes to the dataset file, overwrite the stored
    file, then re-profile and return the updated DatasetProfile.

    Supported fix types:
        drop_duplicates        — remove exact duplicate rows
        fill_median            — fill nulls with median (coerces mixed string cols first)
        fill_mode              — fill nulls with most frequent value
        drop_column            — drop the entire column
        standardize_categories — strip whitespace + title-case all values in a categorical col
        standardize_dates      — parse all dates into ISO 8601 (YYYY-MM-DD), drop unparseable
    """
    dataset: Dataset = await get_dataset(dataset_id, user_id, db)
    storage = get_storage()
    content = await storage.download(dataset.storage_path)
    df = _load_df(content, dataset.file_extension)

    for fix in fixes:
        action = fix.get("fix")
        col    = fix.get("affected_column")

        # ── Uniqueness ────────────────────────────────────────────────────
        if action == "drop_duplicates":
            df = df.drop_duplicates()

        # ── Completeness ──────────────────────────────────────────────────
        elif action == "fill_median" and col and col in df.columns:
            # Handle mixed columns (e.g. 'abc' and numbers) — coerce first
            if df[col].dtype == object:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())

        elif action == "fill_mode" and col and col in df.columns:
            mode_series = df[col].mode()
            if not mode_series.empty:
                df[col] = df[col].fillna(mode_series[0])

        elif action == "drop_column" and col and col in df.columns:
            df = df.drop(columns=[col])

        # ── Validity: absolute value for negative financials ─────────────
        elif action == "abs_value" and col and col in df.columns:
            # Coerce to numeric first (handles mixed string/number columns)
            df[col] = pd.to_numeric(df[col], errors='coerce').abs()

        # ── Validity: standardize dates ───────────────────────────────────
        elif action == "standardize_dates" and col and col in df.columns:
            # Use dayfirst=False to prefer YYYY-MM-DD and MM/DD/YYYY over DD-MM-YYYY
            # format=mixed handles multiple formats in the same column
            parsed = pd.to_datetime(df[col], format='mixed', dayfirst=False, errors='coerce')
            df[col] = parsed.dt.strftime('%Y-%m-%d').where(parsed.notna(), other=None)

        # ── Consistency: standardize categories ───────────────────────────
        elif action == "standardize_categories" and col and col in df.columns:
            if df[col].dtype == object:
                # Strip whitespace then apply title-case
                # Title-case preserves readability: "electronics" → "Electronics"
                df[col] = df[col].str.strip().str.title()

    # Overwrite stored file as CSV
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    cleaned_bytes = buf.getvalue()

    await storage.upload(dataset.storage_path, cleaned_bytes, "text/csv")

    # Update dataset metadata
    dataset.total_rows    = int(len(df))
    dataset.total_columns = int(len(df.columns))
    dataset.file_size     = int(len(cleaned_bytes))
    if dataset.file_extension not in ("csv", "txt"):
        dataset.file_extension = "csv"
    await db.flush()

    return await profile_dataset(dataset_id, user_id, db)
