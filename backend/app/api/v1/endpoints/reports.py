"""
AnalyticaAI — Reports Endpoints

POST /api/v1/datasets/{id}/reports/pdf   → generate + download PDF report
POST /api/v1/datasets/{id}/reports/docx  → generate + download DOCX report
"""
from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.report_service import generate_report

router = APIRouter()


@router.post(
    "/{dataset_id}/reports/pdf",
    status_code=status.HTTP_200_OK,
    summary="Generate and download PDF report",
)
async def download_pdf(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a professional PDF analytics report and return it as a file download."""
    content, filename = await generate_report(dataset_id, current_user.id, "pdf", db)
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post(
    "/{dataset_id}/reports/docx",
    status_code=status.HTTP_200_OK,
    summary="Generate and download DOCX report",
)
async def download_docx(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a professional Word document analytics report and return it as a file download."""
    content, filename = await generate_report(dataset_id, current_user.id, "docx", db)
    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
