"""
스키마 정의: 내부 필드명 ↔ 사용자 표시용 한국어 레이블
"""

# 내부 코드용 필드 → 사용자 UI용 한국어 레이블
FIELD_LABELS = {
    "company_name": "회사이름",
    "person_name": "이름",
    "job_title": "직책",
    "phone_number": "전화번호",
    "fax_number": "팩스번호",
    "email": "이메일",
}

# 분류 대상 필드 목록
FIELD_NAMES = list(FIELD_LABELS.keys())

# 알 수 없는 텍스트에 대한 레이블
UNKNOWN_LABEL = "unknown"
