"""
AnalyticaAI — DatasetProfile ORM Model
Stores the result of profiling a dataset: health score, missing values,
duplicates, and a full JSON snapshot of all computed stats.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class DatasetProfile(Base):
    __tablename__ = "dataset_profiles"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    dataset_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,   # one profile per dataset (overwritten on re-profile)
        index=True,
    )

    # High-level metrics
    row_count: Mapped[int] = mapped_column(Integer, nullable=True)
    column_count: Mapped[int] = mapped_column(Integer, nullable=True)
    missing_values: Mapped[int] = mapped_column(Integer, nullable=True)
    duplicate_rows: Mapped[int] = mapped_column(Integer, nullable=True)
    outlier_count: Mapped[int] = mapped_column(Integer, nullable=True)
    memory_usage_mb: Mapped[float] = mapped_column(Float, nullable=True)

    # Health score 0–100
    health_score: Mapped[float] = mapped_column(Float, nullable=True)

    # Full profiling JSON (per-column breakdown + summary)
    profile_json: Mapped[dict] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
