"""
간단한 파일 기반 사용자 저장소
"""
import json
from pathlib import Path

USERS_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "users.json"


def _load_users() -> list[dict]:
    USERS_PATH.parent.mkdir(parents=True, exist_ok=True)
    if USERS_PATH.exists():
        with open(USERS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _save_users(users: list[dict]):
    USERS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(USERS_PATH, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)


def find_or_create_user(provider: str, provider_id: str, email: str, name: str, picture: str = "") -> dict:
    """
    소셜 로그인 사용자 조회 또는 생성.
    Returns: {"id": "google_123", "provider": "google", "email": "...", "name": "...", "picture": "..."}
    """
    users = _load_users()
    user_id = f"{provider}_{provider_id}"

    for user in users:
        if user["id"] == user_id:
            # 기존 사용자 — 정보 업데이트
            user["email"] = email
            user["name"] = name
            user["picture"] = picture
            _save_users(users)
            return user

    # 신규 사용자
    new_user = {
        "id": user_id,
        "provider": provider,
        "provider_id": provider_id,
        "email": email,
        "name": name,
        "picture": picture,
    }
    users.append(new_user)
    _save_users(users)
    return new_user
