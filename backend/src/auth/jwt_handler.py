"""
JWT 토큰 생성 및 검증
"""
import jwt
from datetime import datetime, timedelta, timezone
from src.auth.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS


def create_token(user_data: dict) -> str:
    """사용자 정보로 JWT 토큰 생성."""
    payload = {
        **user_data,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> dict | None:
    """JWT 토큰 검증. 유효하면 payload 반환, 아니면 None."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
