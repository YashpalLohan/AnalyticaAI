"""
AnalyticaAI — Insights Endpoints

POST /api/v1/datasets/{id}/insights  → generate AI insights
GET  /api/v1/datasets/{id}/insights  → get cached insights
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.insight_service import generate_insights, get_insights

router = APIRouter()


@router.post(
    "/{dataset_id}/insights",
    status_code=status.HTTP_200_OK,
    summary="Generate AI-powered insights",
)
async def trigger_insights(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Use the LLM to analyze the dataset and generate 4-6 business insights
    with type (trend/risk/opportunity/recommendation) and severity.
    Results are cached in the dataset profile.
    """
    return await generate_insights(dataset_id, current_user.id, db)


@router.get(
    "/{dataset_id}/insights",
    status_code=status.HTTP_200_OK,
    summary="Get cached insights",
)
async def get_dataset_insights(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return previously generated insights."""
    return await get_insights(dataset_id, current_user.id, db)
