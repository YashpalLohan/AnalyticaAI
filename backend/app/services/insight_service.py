"""
AnalyticaAI — Insight Service
LLM-powered insight generation: detects trends, risks, opportunities and
recommendations from the dataset statistics and profile.
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

# ── Insight prompt ─────────────────────────────────────────────────────────

INSIGHT_PROMPT = """You are a senior business analyst. Analyze this dataset and generate business insights.

Dataset name: {dataset_name}
Rows: {row_count}
Columns: {columns}
Numeric summary:
{numeric_summary}
Top categorical values:
{categorical_summary}
Data quality health score: {health_score}/100

Generate exactly 5 business insights. Each insight MUST:
- Be backed by specific numbers from the data above
- Be written in plain English (no technical jargon)
- Be categorized as: trend | risk | opportunity | recommendation
- Have severity: high | medium | low

Also write a 2-3 sentence executive summary of the dataset.

Return ONLY valid JSON — no explanation, no markdown, no code blocks:
{{
  "executive_summary": "2-3 sentences summarizing the dataset and its key findings.",
  "insights": [
    {{
      "type": "trend",
      "title": "Short title under 8 words",
      "description": "One sentence with specific numbers from the data.",
      "severity": "high"
    }}
  ]
}}"""

# ── Data summary builders ──────────────────────────────────────────────────

def _numeric_summary(df: pd.DataFrame) -> str:
    numeric_cols = df.select_dtypes(include="number").columns
    lines = []
    for col in list(numeric_cols)[:8]:
        series = pd.to_numeric(df[col], errors="coerce").dropna()
        if len(series) == 0:
            continue
        lines.append(
            f"  {col}: sum={_s(series.sum()):,}, mean={_s(series.mean()):.2f}, "
            f"min={_s(series.min()):.2f}, max={_s(series.max()):.2f}, "
            f"std={_s(series.std()):.2f}"
        )
    return "\n".join(lines) if lines else "  No numeric columns."


def _categorical_summary(df: pd.DataFrame) -> str:
    cat_cols = [c for c in df.select_dtypes(include="object").columns if df[c].nunique() <= 50]
    lines = []
    for col in list(cat_cols)[:5]:
        top = df[col].value_counts().head(3)
        top_str = ", ".join([f"'{k}': {v}" for k, v in top.items()])
        lines.append(f"  {col} ({df[col].nunique()} unique): {top_str}")
    return "\n".join(lines) if lines else "  No categorical columns."

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

# ── Fallback insights (no LLM) ─────────────────────────────────────────────

def _fallback_insights(df: pd.DataFrame, dataset_name: str) -> dict:
    numeric_cols = list(df.select_dtypes(include="number").columns)
    cat_cols = [c for c in df.select_dtypes(include="object").columns if df[c].nunique() <= 50]
    insights = []

    if numeric_cols:
        col = numeric_cols[0]
        series = pd.to_numeric(df[col], errors="coerce").dropna()
        insights.append({
            "type": "trend",
            "title": f"{col.replace('_',' ').title()} Overview",
            "description": (
                f"The {col} column has {len(series):,} values with a total of "
                f"{_s(series.sum()):,.2f} and an average of {_s(series.mean()):,.2f}."
            ),
            "severity": "medium",
        })

    if len(numeric_cols) >= 2:
        top_col = max(numeric_cols[:4], key=lambda c: pd.to_numeric(df[c], errors="coerce").sum())
        insights.append({
            "type": "opportunity",
            "title": f"Top Metric: {top_col.replace('_',' ').title()}",
            "description": f"{top_col} has the highest total value at {_s(pd.to_numeric(df[top_col], errors='coerce').sum()):,.2f}.",
            "severity": "high",
        })

    if cat_cols:
        col = cat_cols[0]
        top_val = df[col].value_counts().index[0]
        top_pct = round(df[col].value_counts().iloc[0] / len(df) * 100, 1)
        insights.append({
            "type": "recommendation",
            "title": f"Focus on {str(top_val)[:20]}",
            "description": f"'{top_val}' is the most common {col}, accounting for {top_pct}% of all records.",
            "severity": "medium",
        })

    missing_pct = round(df.isnull().mean().mean() * 100, 1)
    if missing_pct > 5:
        insights.append({
            "type": "risk",
            "title": "Data Quality Issue Detected",
            "description": f"The dataset has {missing_pct}% missing values on average, which may affect analysis accuracy.",
            "severity": "high" if missing_pct > 20 else "medium",
        })

    insights.append({
        "type": "trend",
        "title": "Dataset Size",
        "description": f"The dataset contains {len(df):,} rows and {len(df.columns)} columns, providing a substantial base for analysis.",
        "severity": "low",
    })

    return {
        "executive_summary": (
            f"{dataset_name} contains {len(df):,} records across {len(df.columns)} dimensions. "
            f"The dataset has {len(numeric_cols)} numeric and {len(cat_cols)} categorical columns. "
            f"Key metrics and patterns have been identified for business decision-making."
        ),
        "insights": insights[:5],
    }

# ── Public service functions ───────────────────────────────────────────────

async def generate_insights(
    dataset_id: str,
    user_id: str,
    db: AsyncSession,
) -> dict:
    """Use the LLM to generate business insights from the dataset."""
    dataset: Dataset = await get_dataset(dataset_id, user_id, db)

    storage = get_storage()
    content = await storage.download(dataset.storage_path)
    df = _load_df(content, dataset.file_extension)

    # Get health score from profile if available
    health_score = 100
    profile_result = await db.execute(
        select(DatasetProfile).where(DatasetProfile.dataset_id == dataset_id)
    )
    profile_orm = profile_result.scalar_one_or_none()
    if profile_orm and profile_orm.health_score:
        health_score = profile_orm.health_score

    prompt = INSIGHT_PROMPT.format(
        dataset_name=dataset.name,
        row_count=f"{len(df):,}",
        columns=", ".join(df.columns.tolist()),
        numeric_summary=_numeric_summary(df),
        categorical_summary=_categorical_summary(df),
        health_score=health_score,
    )

    try:
        llm = get_llm()
        response = await llm.ainvoke(prompt)
        raw = response.content.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        result = json.loads(raw)

        # Validate structure
        if "insights" not in result or not isinstance(result["insights"], list):
            raise ValueError("Invalid response structure")

    except Exception as exc:
        logger.warning(f"LLM insight generation failed, using fallback: {exc}")
        result = _fallback_insights(df, dataset.name)

    result = _clean(result)

    # Cache in profile_json
    if profile_orm and profile_orm.profile_json is not None:
        updated = dict(profile_orm.profile_json)
        updated["insights"] = result
        profile_orm.profile_json = updated
        await db.flush()

    logger.info(f"Insights generated for {dataset_id}: {len(result.get('insights', []))} insights")
    return result


async def get_insights(
    dataset_id: str,
    user_id: str,
    db: AsyncSession,
) -> dict:
    """Return cached insights from profile_json, or 404."""
    await get_dataset(dataset_id, user_id, db)

    result = await db.execute(
        select(DatasetProfile).where(DatasetProfile.dataset_id == dataset_id)
    )
    profile = result.scalar_one_or_none()

    if not profile or not profile.profile_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "INSIGHTS_NOT_FOUND", "message": "Insights have not been generated yet."},
        )

    insights = profile.profile_json.get("insights")
    if not insights:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "INSIGHTS_NOT_FOUND", "message": "Insights have not been generated yet."},
        )

    return insights
