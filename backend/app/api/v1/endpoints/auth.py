"""
AnalyticaAI — Auth Endpoints
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RegisterResponse, RefreshRequest
from app.services.auth_service import register_user, login_user, refresh_access_token

router = APIRouter()


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    user = await register_user(data, db)
    return RegisterResponse(user_id=user.id)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password, receive JWT tokens."""
    return await login_user(data, db)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a refresh token for a new access token."""
    return await refresh_access_token(data.refresh_token, db)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    """
    Logout endpoint. Client should discard their tokens.
    Stateless JWT — no server-side invalidation in Phase 0.
    """
    return {"success": True, "message": "Logged out successfully"}
