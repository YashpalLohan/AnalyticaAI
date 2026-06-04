"""
AnalyticaAI — Profile & Cleaning Pydantic Schemas
"""
from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Column
# ---------------------------------------------------------------------------

class ColumnProfileResponse(BaseModel):
    name: str
    dtype: str
    col_type: str                      # numeric | categorical | datetime | boolean | mixed
    null_count: int
    null_percentage: float
    unique_count: int
    sample_values: list[Any]
    statistics: dict[str, Any]

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Dimension scores (industry-standard DAMA DMBOK breakdown)
# ---------------------------------------------------------------------------

class DimensionScores(BaseModel):
    completeness: float   # 35% weight — missing values, per-column criticality
    validity:     float   # 25% weight — type errors, range violations, format issues
    uniqueness:   float   # 20% weight — duplicate rows
    consistency:  float   # 20% weight — categorical case/spacing variants


# ---------------------------------------------------------------------------
# Cleaning Suggestion
# ---------------------------------------------------------------------------

class CleaningSuggestion(BaseModel):
    issue: str
    dimension: Optional[str] = None    # completeness | validity | uniqueness | consistency
    title: str
    description: str
    severity: str                      # high | medium | low
    fix: str                           # drop_duplicates | fill_median | fill_mode | drop_column
                                       # | standardize_categories | standardize_dates | manual_review
    affected_column: Optional[str] = None


# ---------------------------------------------------------------------------
# Profile response
# ---------------------------------------------------------------------------

class DatasetProfileResponse(BaseModel):
    id: str
    dataset_id: str
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    missing_values: Optional[int] = None
    duplicate_rows: Optional[int] = None
    outlier_count: Optional[int] = None
    memory_usage_mb: Optional[float] = None
    health_score: Optional[float] = None
    dimension_scores: Optional[DimensionScores] = None
    columns: list[ColumnProfileResponse] = []
    cleaning_suggestions: list[CleaningSuggestion] = []

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_json(cls, profile: Any) -> "DatasetProfileResponse":
        """Build response from the ORM DatasetProfile."""
        profile_json = profile.profile_json or {}
        columns = [ColumnProfileResponse(**c) for c in profile_json.get("columns", [])]
        suggestions = [CleaningSuggestion(**s) for s in profile_json.get("cleaning_suggestions", [])]

        dim_raw = profile_json.get("dimension_scores")
        dimension_scores = DimensionScores(**dim_raw) if dim_raw else None

        return cls(
            id=profile.id,
            dataset_id=profile.dataset_id,
            row_count=profile.row_count,
            column_count=profile.column_count,
            missing_values=profile.missing_values,
            duplicate_rows=profile.duplicate_rows,
            outlier_count=profile.outlier_count,
            memory_usage_mb=profile.memory_usage_mb,
            health_score=profile.health_score,
            dimension_scores=dimension_scores,
            columns=columns,
            cleaning_suggestions=suggestions,
        )


# ---------------------------------------------------------------------------
# Cleaning request/response
# ---------------------------------------------------------------------------

class CleaningFix(BaseModel):
    fix: str
    affected_column: Optional[str] = None


class ApplyCleaningRequest(BaseModel):
    fixes: list[CleaningFix]
