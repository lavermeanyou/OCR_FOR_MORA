"""
Kakao OAuth2 흐름
"""
import httpx
from urllib.parse import urlencode
from src.auth.config import KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI

KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize"
KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_USERINFO_URL = "https://kapi.kakao.com/v2/user/me"


def get_login_url(state: str = "") -> str:
    """Kakao 로그인 페이지 URL 생성."""
    params = {
        "client_id": KAKAO_CLIENT_ID,
        "redirect_uri": KAKAO_REDIRECT_URI,
        "response_type": "code",
        "state": state,
    }
    return f"{KAKAO_AUTH_URL}?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    """Authorization code → access_token 교환."""
    async with httpx.AsyncClient() as client:
        res = await client.post(KAKAO_TOKEN_URL, data={
            "grant_type": "authorization_code",
            "client_id": KAKAO_CLIENT_ID,
            "client_secret": KAKAO_CLIENT_SECRET,
            "redirect_uri": KAKAO_REDIRECT_URI,
            "code": code,
        })
        res.raise_for_status()
        return res.json()


async def get_user_info(access_token: str) -> dict:
    """access_token으로 사용자 정보 조회."""
    async with httpx.AsyncClient() as client:
        res = await client.get(KAKAO_USERINFO_URL, headers={
            "Authorization": f"Bearer {access_token}",
        })
        res.raise_for_status()
        data = res.json()

        # Kakao API 응답 구조 정규화
        kakao_account = data.get("kakao_account", {})
        profile = kakao_account.get("profile", {})

        return {
            "id": str(data.get("id", "")),
            "email": kakao_account.get("email", ""),
            "name": profile.get("nickname", ""),
            "picture": profile.get("profile_image_url", ""),
        }
