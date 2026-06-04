"""
AnalyticaAI — Dataset Pydantic Schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DatasetResponse(BaseModel):
    id: str
    name: str
    original_filename: str
    file_extension: str
    file_size: Optional[int] = None
    total_rows: Optional[int] = None
    total_columns: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DatasetListResponse(BaseModel):
    datasets: list[DatasetResponse]
    total: int


class DatasetRenameRequest(BaseModel):
    name: str
