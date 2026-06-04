"""
AnalyticaAI — Main API Router (v1)
Registers all feature routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    datasets,
    profile,
    cleaning,
    eda,
    dashboards,
    chat,
    insights,
    forecast,
    automl,
    reports,
    jobs,
    notifications,
    search,
)

api_router = APIRouter()

api_router.include_router(auth.router,          prefix="/auth",          tags=["Authentication"])
api_router.include_router(users.router,         prefix="/users",         tags=["Users"])
api_router.include_router(datasets.router,      prefix="/datasets",      tags=["Datasets"])
api_router.include_router(profile.router,       prefix="/datasets",      tags=["Profiling"])
api_router.include_router(cleaning.router,      prefix="/datasets",      tags=["Cleaning"])
api_router.include_router(eda.router,           prefix="/datasets",      tags=["EDA"])
api_router.include_router(dashboards.router,    prefix="/dashboards",    tags=["Dashboards"])
api_router.include_router(chat.router,          prefix="/chat",          tags=["Chat"])
api_router.include_router(insights.router,      prefix="/datasets",      tags=["Insights"])
api_router.include_router(forecast.router,      prefix="/forecast",      tags=["Forecasting"])
api_router.include_router(automl.router,        prefix="/automl",        tags=["AutoML"])
api_router.include_router(reports.router,       prefix="/reports",       tags=["Reports"])
api_router.include_router(jobs.router,          prefix="/jobs",          tags=["Jobs"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(search.router,        prefix="/search",        tags=["Search"])
