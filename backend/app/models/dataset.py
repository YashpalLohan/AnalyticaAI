"""
AnalyticaAI — Dataset ORM Model
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, BigInteger, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_extension: Mapped[str] = mapped_column(String(10), nullable=False)  # csv | xlsx | json

    # Storage
    file_url: Mapped[str] = mapped_column(Text, nullable=True)
    storage_path: Mapped[str] = mapped_column(Text, nullable=True)  # path inside storage provider

    # File metadata (populated after upload)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=True)  # bytes
    total_rows: Mapped[int] = mapped_column(Integer, nullable=True)
    total_columns: Mapped[int] = mapped_column(Integer, nullable=True)

    # Processing state
    # uploaded → ready (Phase 1), profiling → profiled (Phase 2)
    status: Mapped[str] = mapped_column(String(50), default="uploaded", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    chat_sessions = relationship("ChatSession", back_populates="dataset", cascade="all, delete-orphan")
