"""
OAuth2 설정 — 환경 변수 또는 .env 파일에서 읽어옴
"""
import os
from pathlib import Path

# .env 파일이 있으면 로드
ENV_PATH = Path(__file__).resolve().parent.parent.parent.parent / ".env"
if ENV_PATH.exists():
    with open(ENV_PATH) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip())


# ── Google OAuth2 ──
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")

# ── Kakao OAuth2 ──
KAKAO_CLIENT_ID = os.getenv("KAKAO_CLIENT_ID", "")  # REST API 키
KAKAO_CLIENT_SECRET = os.getenv("KAKAO_CLIENT_SECRET", "")
KAKAO_REDIRECT_URI = os.getenv("KAKAO_REDIRECT_URI", "http://localhost:8000/auth/kakao/callback")

# ── JWT ──
JWT_SECRET = os.getenv("JWT_SECRET", "mora-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24
