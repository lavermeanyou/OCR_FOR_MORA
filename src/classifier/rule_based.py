"""
규칙 기반 분류기: 정규식 + 휴리스틱으로 텍스트 블록을 스키마 필드에 매핑.
MVP 초기 버전 — 이후 ML 모델로 교체 가능.
"""
import re

# ---------- 패턴 정의 ----------

# 이메일
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}")

# 전화번호 (한국 형식)
# 휴대폰: 010-xxxx-xxxx, 01x-xxx-xxxx
MOBILE_PATTERN = re.compile(r"01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}")

# 일반 전화 / 팩스: 02-xxx-xxxx, 0xx-xxx-xxxx
LANDLINE_PATTERN = re.compile(r"0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}")

# 팩스 키워드 (OCR 텍스트에 포함될 수 있음)
FAX_KEYWORDS = re.compile(r"(?i)(fax|팩스|f\s*[:.]|FAX\s*[:.)])")

# 전화 키워드
PHONE_KEYWORDS = re.compile(r"(?i)(tel|phone|전화|핸드폰|휴대폰|mobile|h\.?p\.?|t\s*[:.])")

# 한국어 이름 패턴 (2~4글자 한글)
KOREAN_NAME_PATTERN = re.compile(r"^[가-힣]{2,4}$")

# 일반적인 직책 키워드
JOB_TITLE_KEYWORDS = [
    # 한국어
    "대표", "사장", "부사장", "전무", "상무", "이사", "부장", "차장",
    "과장", "대리", "사원", "주임", "팀장", "실장", "본부장", "센터장",
    "매니저", "엔지니어", "디자이너", "개발자", "연구원", "교수", "박사",
    # 영어
    "CEO", "CTO", "CFO", "COO", "VP", "Director", "Manager", "Engineer",
    "Designer", "Developer", "Analyst", "Consultant", "President",
    "Senior", "Junior", "Lead", "Head", "Chief", "Officer", "Intern",
]

# 회사명에 자주 포함되는 키워드
COMPANY_KEYWORDS = [
    # 한국어
    "주식회사", "(주)", "㈜", "회사", "그룹", "코퍼레이션", "테크", "랩",
    "솔루션", "시스템", "네트워크", "미디어", "엔터", "파트너스",
    # 영어
    "Inc", "Corp", "Ltd", "LLC", "Co.", "Company", "Group",
    "Technologies", "Tech", "Labs", "Solutions", "Systems",
    "Networks", "Media", "Entertainment", "Partners", "Global",
]


def classify_text_block(text: str, all_blocks: list[dict] = None, block_index: int = 0) -> str:
    """
    단일 텍스트 블록을 스키마 필드로 분류.

    Args:
        text: OCR에서 추출된 텍스트
        all_blocks: 전체 텍스트 블록 목록 (문맥 참조용)
        block_index: 현재 블록의 인덱스

    Returns:
        필드명 (company_name, person_name, job_title, phone_number, fax_number, email, unknown)
    """
    text_stripped = text.strip()
    if not text_stripped:
        return "unknown"

    # 1) 이메일 확인
    if EMAIL_PATTERN.search(text_stripped):
        return "email"

    # 2) 팩스 확인 (팩스 키워드 + 전화번호 패턴)
    if FAX_KEYWORDS.search(text_stripped) and LANDLINE_PATTERN.search(text_stripped):
        return "fax_number"

    # 3) 휴대폰 번호 확인 (010으로 시작)
    if MOBILE_PATTERN.search(text_stripped):
        # 팩스 키워드가 함께 있으면 팩스로
        if FAX_KEYWORDS.search(text_stripped):
            return "fax_number"
        return "phone_number"

    # 4) 일반 전화번호 / 팩스 판별
    if LANDLINE_PATTERN.search(text_stripped):
        if FAX_KEYWORDS.search(text_stripped):
            return "fax_number"
        if PHONE_KEYWORDS.search(text_stripped):
            return "phone_number"
        # 키워드 없는 유선번호 → 문맥으로 판단
        # 이미 phone_number가 할당된 블록이 있으면 fax로 추정
        if all_blocks:
            phone_already_found = any(
                b.get("_classified") == "phone_number"
                for b in all_blocks
                if b["block_index"] != block_index
            )
            return "fax_number" if phone_already_found else "phone_number"
        return "phone_number"

    # 5) 직책 확인
    for keyword in JOB_TITLE_KEYWORDS:
        if keyword.lower() in text_stripped.lower():
            return "job_title"

    # 6) 회사명 확인
    for keyword in COMPANY_KEYWORDS:
        if keyword.lower() in text_stripped.lower():
            return "company_name"

    # 7) 한국어 이름 확인 (2~4글자 한글 단독)
    if KOREAN_NAME_PATTERN.match(text_stripped):
        return "person_name"

    # 8) 영문 이름 추정 (2~3 단어, 모두 알파벳, 각 단어 첫 글자 대문자)
    words = text_stripped.split()
    if 2 <= len(words) <= 3 and all(w[0].isupper() and w.isalpha() for w in words):
        return "person_name"

    return "unknown"


def classify_all_blocks(text_blocks: list[dict]) -> list[dict]:
    """
    전체 텍스트 블록을 순회하며 분류 결과를 추가.
    2-pass: 먼저 확실한 것부터 분류 → 문맥 참조로 나머지 분류.
    """
    # 1st pass: 확실한 패턴 (이메일, 휴대폰)
    for block in text_blocks:
        text = block["text"].strip()
        if EMAIL_PATTERN.search(text):
            block["_classified"] = "email"
        elif MOBILE_PATTERN.search(text) and not FAX_KEYWORDS.search(text):
            block["_classified"] = "phone_number"

    # 2nd pass: 나머지 블록 분류 (문맥 참조 가능)
    for block in text_blocks:
        if "_classified" not in block:
            block["_classified"] = classify_text_block(
                block["text"], all_blocks=text_blocks, block_index=block["block_index"]
            )

    # 결과 정리
    results = []
    for block in text_blocks:
        results.append({
            "text": block["text"],
            "confidence": block.get("confidence", 0.0),
            "bbox": block.get("bbox"),
            "block_index": block["block_index"],
            "field": block.pop("_classified"),
        })

    return results
