"""
Phase 0 Auth Tests
Run: pytest tests/test_auth.py -v
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_register(client):
    response = await client.post("/api/v1/auth/register", json={
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "testpass123"
    })
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert "user_id" in response.json()


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {"full_name": "User", "email": "dup@example.com", "password": "testpass123"}
    await client.post("/api/v1/auth/register", json=payload)
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post("/api/v1/auth/register", json={
        "full_name": "Login User", "email": "login@example.com", "password": "testpass123"
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "login@example.com", "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/api/v1/auth/register", json={
        "full_name": "User", "email": "wrong@example.com", "password": "testpass123"
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com", "password": "wrongpassword"
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client):
    await client.post("/api/v1/auth/register", json={
        "full_name": "Me User", "email": "me@example.com", "password": "testpass123"
    })
    login = await client.post("/api/v1/auth/login", json={
        "email": "me@example.com", "password": "testpass123"
    })
    token = login.json()["access_token"]
    response = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_get_me_no_token(client):
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 403
