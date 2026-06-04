"""
AnalyticaAI — Main API Router (v1)
Only endpoints built so far are imported.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users

api_router = APIRouter()

api_router.include_router(auth.router,  prefix="/auth",  tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# Uncomment as each phase is completed:
# from app.api.v1.endpoints import datasets
# api_router.include_router(datasets.router, prefix="/datasets", tags=["Datasets"])
# from app.api.v1.endpoints import profile
# api_router.include_router(profile.router, prefix="/datasets", tags=["Profiling"])
# from app.api.v1.endpoints import cleaning
# api_router.include_router(cleaning.router, prefix="/datasets", tags=["Cleaning"])
# from app.api.v1.endpoints import eda
# api_router.include_router(eda.router, prefix="/datasets", tags=["EDA"])
# from app.api.v1.endpoints import dashboards
# api_router.include_router(dashboards.router, prefix="/dashboards", tags=["Dashboards"])
# from app.api.v1.endpoints import chat
# api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
# from app.api.v1.endpoints import insights
# api_router.include_router(insights.router, prefix="/datasets", tags=["Insights"])
# from app.api.v1.endpoints import forecast
# api_router.include_router(forecast.router, prefix="/forecast", tags=["Forecasting"])
# from app.api.v1.endpoints import automl
# api_router.include_router(automl.router, prefix="/automl", tags=["AutoML"])
# from app.api.v1.endpoints import reports
# api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
# from app.api.v1.endpoints import jobs
# api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
# from app.api.v1.endpoints import notifications
# api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
# from app.api.v1.endpoints import search
# api_router.include_router(search.router, prefix="/search", tags=["Search"])
