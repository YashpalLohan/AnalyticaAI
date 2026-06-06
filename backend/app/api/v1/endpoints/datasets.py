"""
AnalyticaAI — Dataset Endpoints

POST /datasets/upload         → upload file
GET  /datasets                → list user's datasets
GET  /datasets/{id}           → get single dataset
GET  /datasets/{id}/download  → download dataset file as CSV
PATCH /datasets/{id}          → rename dataset
DELETE /datasets/{id}         → delete dataset + file
"""
from fastapi import APIRouter, Depends, UploadFile, File, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.storage import get_storage
from app.models.user import User
from app.schemas.dataset import DatasetResponse, DatasetListResponse, DatasetRenameRequest
from app.services.dataset_service import (
    upload_dataset,
    list_datasets,
    get_dataset,
    rename_dataset,
    delete_dataset,
)

router = APIRouter()


@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a CSV, XLSX, or JSON dataset."""
    dataset = await upload_dataset(file, current_user.id, db)
    return dataset


@router.get("", response_model=DatasetListResponse)
async def list_all(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all datasets belonging to the current user."""
    datasets = await list_datasets(current_user.id, db)
    return DatasetListResponse(datasets=datasets, total=len(datasets))


@router.get("/{dataset_id}/download")
async def download(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download the dataset file (returns the current version including any cleaning applied)."""
    dataset = await get_dataset(dataset_id, current_user.id, db)
    storage = get_storage()
    content = await storage.download(dataset.storage_path)
    safe_name = dataset.name.replace(" ", "_")[:60]
    # Always serve as CSV since cleaning converts files to CSV
    ext = dataset.file_extension if dataset.file_extension in ("csv", "txt") else "csv"
    filename = f"{safe_name}.{ext}"
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_one(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single dataset by ID."""
    return await get_dataset(dataset_id, current_user.id, db)


@router.patch("/{dataset_id}", response_model=DatasetResponse)
async def rename(
    dataset_id: str,
    body: DatasetRenameRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Rename a dataset."""
    return await rename_dataset(dataset_id, current_user.id, body.name, db)


@router.delete("/{dataset_id}", status_code=status.HTTP_200_OK)
async def delete(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a dataset and its stored file."""
    await delete_dataset(dataset_id, current_user.id, db)
    return {"success": True, "message": "Dataset deleted."}
