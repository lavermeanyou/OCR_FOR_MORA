"""
인증 시스템 테스트: JWT + OAuth 엔드포인트
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from fastapi.testclient import TestClient
from src.auth.jwt_handler import create_token, verify_token


@pytest.fixture
def client():
    from app import app
    return TestClient(app)


# ── JWT Tests ──
def test_jwt_create_and_verify():
    """JWT 토큰 생성 및 검증."""
    user_data = {"user_id": "google_123", "email": "test@test.com", "name": "Test User"}
    token = create_token(user_data)

    assert isinstance(token, str)
    assert len(token) > 0

    payload = verify_token(token)
    assert payload is not None
    assert payload["user_id"] == "google_123"
    assert payload["email"] == "test@test.com"


def test_jwt_invalid_token():
    """잘못된 토큰 검증."""
    result = verify_token("invalid.token.here")
    assert result is None


def test_jwt_empty_token():
    """빈 토큰 검증."""
    result = verify_token("")
    assert result is None


# ── API Auth Endpoint Tests ──
def test_auth_config(client):
    """OAuth 설정 조회."""
    res = client.get("/auth/config")
    assert res.status_code == 200
    data = res.json()
    assert "google_enabled" in data
    assert "kakao_enabled" in data


def test_auth_me_no_token(client):
    """토큰 없이 /auth/me 요청."""
    res = client.get("/auth/me")
    assert res.status_code == 401


def test_auth_me_invalid_token(client):
    """잘못된 토큰으로 /auth/me 요청."""
    res = client.get("/auth/me", headers={"Authorization": "Bearer invalid"})
    assert res.status_code == 401


def test_auth_me_valid_token(client):
    """유효한 토큰으로 /auth/me 요청."""
    token = create_token({
        "user_id": "google_456",
        "email": "user@test.com",
        "name": "Test",
        "picture": "",
        "provider": "google",
    })
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["user_id"] == "google_456"
    assert data["provider"] == "google"


def test_google_login_redirect(client):
    """Google 로그인 리다이렉트."""
    res = client.get("/auth/google/login", follow_redirects=False)
    # client_id가 없으면 빈 URL이지만 리다이렉트는 발생
    assert res.status_code in (302, 307)


def test_kakao_login_redirect(client):
    """Kakao 로그인 리다이렉트."""
    res = client.get("/auth/kakao/login", follow_redirects=False)
    assert res.status_code in (302, 307)
