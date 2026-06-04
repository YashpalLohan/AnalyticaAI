"""
AnalyticaAI — EDA Endpoints

POST /api/v1/datasets/{id}/eda   → trigger EDA generation
GET  /api/v1/datasets/{id}/eda   → get cached EDA results
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.eda_service import get_eda, run_eda

router = APIRouter()


@router.post(
    "/{dataset_id}/eda",
    status_code=status.HTTP_200_OK,
    summary="Trigger EDA generation",
)
async def trigger_eda(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Run (or re-run) Exploratory Data Analysis on the dataset.
    Returns charts + summary statistics. Results are cached in the profile.
    """
    return await run_eda(dataset_id, current_user.id, db)


@router.get(
    "/{dataset_id}/eda",
    status_code=status.HTTP_200_OK,
    summary="Get cached EDA results",
)
async def get_dataset_eda(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return previously generated EDA results."""
    return await get_eda(dataset_id, current_user.id, db)
