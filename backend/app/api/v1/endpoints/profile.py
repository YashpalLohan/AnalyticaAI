"""
AnalyticaAI — Profiling & Cleaning Endpoints

POST /datasets/{id}/profile          → trigger (or re-trigger) profiling
GET  /datasets/{id}/profile          → fetch profile results
POST /datasets/{id}/cleaning/apply   → apply cleaning fixes + re-profile
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.profile import (
    ApplyCleaningRequest,
    DatasetProfileResponse,
)
from app.services.profiling_service import (
    apply_cleaning,
    get_profile,
    profile_dataset,
)

router = APIRouter()


@router.post(
    "/{dataset_id}/profile",
    response_model=DatasetProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Trigger dataset profiling",
)
async def trigger_profile(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Run (or re-run) full profiling on the dataset.
    Returns the complete profile including per-column stats and cleaning suggestions.
    This runs synchronously for MVP — Celery task approach kept for Phase 7 polish.
    """
    profile = await profile_dataset(dataset_id, current_user.id, db)
    return DatasetProfileResponse.from_orm_with_json(profile)


@router.get(
    "/{dataset_id}/profile",
    response_model=DatasetProfileResponse,
    summary="Get existing dataset profile",
)
async def get_dataset_profile(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the most recent profiling results for a dataset."""
    profile = await get_profile(dataset_id, current_user.id, db)
    return DatasetProfileResponse.from_orm_with_json(profile)


@router.post(
    "/{dataset_id}/cleaning/apply",
    response_model=DatasetProfileResponse,
    summary="Apply cleaning fixes",
)
async def apply_fixes(
    dataset_id: str,
    body: ApplyCleaningRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Apply the selected cleaning operations to the dataset file,
    then re-profile and return the updated profile.
    """
    fixes = [f.model_dump() for f in body.fixes]
    profile = await apply_cleaning(dataset_id, current_user.id, fixes, db)
    return DatasetProfileResponse.from_orm_with_json(profile)
