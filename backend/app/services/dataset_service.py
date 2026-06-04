"""
AnalyticaAI — Dataset Service
Handles upload, storage, metadata extraction, list, delete.
"""
import uuid
import io
from pathlib import Path
from typing import Optional

import pandas as pd
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.dataset import Dataset
from app.core.storage import get_storage
from app.core.config import settings

# Allowed file extensions and MIME types
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json"}
ALLOWED_CONTENT_TYPES = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/json",
    "text/plain",          # some browsers send CSV as text/plain
    "application/octet-stream",  # fallback
}


def _get_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def _validate_file(file: UploadFile, content: bytes) -> str:
    """Validate file type and size. Returns the extension."""
    ext = _get_extension(file.filename or "")

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "DATASET_FORMAT_UNSUPPORTED",
                "message": f"File type '{ext}' is not supported. Upload CSV, XLSX, or JSON.",
            },
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "DATASET_TOO_LARGE",
                "message": f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit.",
            },
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "DATASET_EMPTY", "message": "Uploaded file is empty."},
        )

    return ext


def _read_dataframe(content: bytes, ext: str) -> pd.DataFrame:
    """Parse file bytes into a DataFrame. Raises on corrupt files."""
    try:
        if ext == ".csv":
            return pd.read_csv(io.BytesIO(content))
        elif ext in (".xlsx", ".xls"):
            return pd.read_excel(io.BytesIO(content))
        elif ext == ".json":
            return pd.read_json(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "DATASET_CORRUPTED",
                "message": f"Could not read file: {str(e)}",
            },
        )


async def upload_dataset(
    file: UploadFile,
    user_id: str,
    db: AsyncSession,
) -> Dataset:
    """
    Full upload pipeline:
    1. Read & validate bytes
    2. Parse with pandas → get row/column counts
    3. Save to storage
    4. Create DB record
    """
    content = await file.read()
    ext = _validate_file(file, content)

    # Parse to get metadata
    df = _read_dataframe(content, ext)
    total_rows = len(df)
    total_columns = len(df.columns)

    # Build storage path: datasets/{user_id}/{uuid}{ext}
    file_id = str(uuid.uuid4())
    storage_path = f"datasets/{user_id}/{file_id}{ext}"

    # Determine content type
    content_type_map = {
        ".csv":  "text/csv",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls":  "application/vnd.ms-excel",
        ".json": "application/json",
    }
    content_type = content_type_map.get(ext, "application/octet-stream")

    # Save file
    storage = get_storage()
    file_url = await storage.upload(storage_path, content, content_type)

    # Derive a clean display name from the original filename
    original_filename = file.filename or f"dataset{ext}"
    display_name = Path(original_filename).stem  # filename without extension

    # Create DB record
    dataset = Dataset(
        user_id=user_id,
        name=display_name,
        original_filename=original_filename,
        file_extension=ext.lstrip("."),
        file_url=file_url,
        storage_path=storage_path,
        file_size=len(content),
        total_rows=total_rows,
        total_columns=total_columns,
        status="ready",
    )
    db.add(dataset)
    await db.flush()
    return dataset


async def list_datasets(user_id: str, db: AsyncSession) -> list[Dataset]:
    result = await db.execute(
        select(Dataset)
        .where(Dataset.user_id == user_id)
        .order_by(Dataset.created_at.desc())
    )
    return list(result.scalars().all())


async def get_dataset(dataset_id: str, user_id: str, db: AsyncSession) -> Dataset:
    result = await db.execute(
        select(Dataset).where(Dataset.id == dataset_id, Dataset.user_id == user_id)
    )
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "DATASET_NOT_FOUND", "message": "Dataset not found."},
        )
    return dataset


async def rename_dataset(
    dataset_id: str, user_id: str, new_name: str, db: AsyncSession
) -> Dataset:
    dataset = await get_dataset(dataset_id, user_id, db)
    dataset.name = new_name.strip()
    await db.flush()
    return dataset


async def delete_dataset(dataset_id: str, user_id: str, db: AsyncSession) -> None:
    dataset = await get_dataset(dataset_id, user_id, db)

    # Delete from storage
    if dataset.storage_path:
        storage = get_storage()
        await storage.delete(dataset.storage_path)

    await db.delete(dataset)
    await db.flush()
