"""
AnalyticaAI — DatasetColumn ORM Model
Stores per-column statistics produced during profiling.
"""
import uuid
from sqlalchemy import String, Integer, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class DatasetColumn(Base):
    __tablename__ = "dataset_columns"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    dataset_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    column_name: Mapped[str] = mapped_column(String(255), nullable=False)
    data_type: Mapped[str] = mapped_column(String(50), nullable=True)   # numeric | categorical | datetime | boolean | mixed

    null_count: Mapped[int] = mapped_column(Integer, nullable=True)
    null_percentage: Mapped[float] = mapped_column(Float, nullable=True)
    unique_count: Mapped[int] = mapped_column(Integer, nullable=True)

    # Sample values serialised as JSON array
    sample_values: Mapped[list] = mapped_column(JSONB, nullable=True)

    # Descriptive stats for numeric columns (mean, std, min, 25%, 50%, 75%, max)
    statistics: Mapped[dict] = mapped_column(JSONB, nullable=True)
