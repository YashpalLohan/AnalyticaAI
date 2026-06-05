"""
AnalyticaAI — Dashboard Endpoints

POST /api/v1/datasets/{id}/dashboard  → generate dashboard (LLM-powered)
GET  /api/v1/datasets/{id}/dashboard  → get cached dashboard
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.dashboard_service import generate_dashboard, get_dashboard

router = APIRouter()


@router.post(
    "/{dataset_id}/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Generate AI-powered dashboard",
)
async def trigger_dashboard(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Use the LLM to design a dashboard layout, enrich each widget with
    real data from the dataset, and return the result.
    Results are cached in the dataset profile.
    """
    return await generate_dashboard(dataset_id, current_user.id, db)


@router.get(
    "/{dataset_id}/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Get cached dashboard",
)
async def get_dataset_dashboard(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return previously generated dashboard widgets."""
    return await get_dashboard(dataset_id, current_user.id, db)
