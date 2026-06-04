"""
AnalyticaAI — Main API Router (v1)
Uncomment routers as each phase is completed.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, datasets

api_router = APIRouter()

# ── Phase 0 ──
api_router.include_router(auth.router,     prefix="/auth",     tags=["Authentication"])
api_router.include_router(users.router,    prefix="/users",    tags=["Users"])

# ── Phase 1 ──
api_router.include_router(datasets.router, prefix="/datasets", tags=["Datasets"])

# ── Phase 2 ──
from app.api.v1.endpoints import profile
api_router.include_router(profile.router, prefix="/datasets", tags=["Profiling"])

# Uncomment as each phase is completed:
# from app.api.v1.endpoints import eda
# api_router.include_router(eda.router, prefix="/datasets", tags=["EDA"])
# from app.api.v1.endpoints import dashboards
# api_router.include_router(dashboards.router, prefix="/dashboards", tags=["Dashboards"])
# from app.api.v1.endpoints import chat
# api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
# from app.api.v1.endpoints import insights
# api_router.include_router(insights.router, prefix="/datasets", tags=["Insights"])
# from app.api.v1.endpoints import reports
# api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
# from app.api.v1.endpoints import jobs
# api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
