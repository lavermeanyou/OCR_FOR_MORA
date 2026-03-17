"""
Google OAuth2 흐름
"""
import httpx
from urllib.parse import urlencode
from src.auth.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


def get_login_url(state: str = "") -> str:
    """Google 로그인 페이지 URL 생성."""
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": state,
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    """Authorization code → access_token 교환."""
    async with httpx.AsyncClient() as client:
        res = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        res.raise_for_status()
        return res.json()


async def get_user_info(access_token: str) -> dict:
    """access_token으로 사용자 정보 조회."""
    async with httpx.AsyncClient() as client:
        res = await client.get(GOOGLE_USERINFO_URL, headers={
            "Authorization": f"Bearer {access_token}",
        })
        res.raise_for_status()
        return res.json()
