"""
규칙 기반 분류기: 정규식 + 휴리스틱으로 텍스트 블록을 스키마 필드에 매핑.
"""
import re

# ---------- 패턴 정의 ----------

# ───────────────────────────────────────────
# [re.compile() / .search() 사용 방식]
#
# re.compile(pattern)
#   정규식 문자열을 패턴 객체(re.Pattern)로 변환함.
#   같은 패턴을 반복 사용할 때 compile()로 미리 만들어두면
#   호출마다 패턴을 새로 파싱하지 않고 객체를 재사용할 수 있음.
#
#   # compile 없이 → 호출마다 패턴 새로 파싱
#   re.search(r"[a-zA-Z0-9_.+-]+@...", text)
#
#   # compile 사용 → 파싱은 모듈 로드 시 딱 한 번
#   EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@...")
#   EMAIL_PATTERN.search(text)
#
# ───────────────────────────────────────────
#
# pattern.search(text)
#   문자열 전체를 훑으며 패턴을 탐색함.
#   패턴이 발견되면 Match 객체, 없으면 None 반환.
#   Match는 if문에서 True, None은 False로 평가되어 바로 분기에 사용 가능.
#
#   EMAIL_PATTERN.search("문의: user@example.com")  → Match (True)
#   EMAIL_PATTERN.search("전화번호 010-1234-5678")   → None  (False)
#
#   match.group() 으로 매칭된 문자열만 꺼낼 수 있음.
#   extract_clean_value()에서 번호·이메일 값 추출 시 사용.
#
# ───────────────────────────────────────────

# 이메일
# 영어와 @ . 으로 이루어져있음 
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+")

# 전화번호 
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
    "주식회사", "(주)", "㈜", "(재)", "재단법인", "(사)", "사단법인",
    "협회", "재단", "기술원", "연구원", "진흥원", "공사", "공단",
    "회사", "그룹", "코퍼레이션", "테크", "랩",
    "솔루션", "시스템", "네트워크", "미디어", "엔터", "파트너스",
    # 영어
    "Inc", "Corp", "Ltd", "LLC", "Co.", "Company", "Group",
    "Technologies", "Tech", "Labs", "Solutions", "Systems",
    "Networks", "Media", "Entertainment", "Partners", "Global",
]

# 한국어 성
KOREAN_SURNAME_SINGLE = re.compile(
    r"^(김|이|박|최|정|강|조|윤|장|임|한|오|서|신|권|황|안|송|유|류|홍|전|고|문|손|"
    r"양|배|백|허|노|심|하|주|구|곽|성|차|우|진|민|나|지|엄|채|원|천|방|공|현|함|"
    r"변|염|여|추|도|소|석|선|설|마|길|연|위|표|명|기|반|라|왕|금|옥|육|인|맹)"
)

# 복성(두 글자 성) — 남궁, 독고, 황보 등
KOREAN_SURNAME_DOUBLE = re.compile(
    r"^(남궁|독고|황보|제갈|선우|동방|사공|서문)"
)


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
        if KOREAN_SURNAME_SINGLE.match(text_stripped):
            return "person_name"
    #     return "person_name"
    
    # 8) 영문 이름 추정 (2~3 단어, 모두 알파벳, 각 단어 첫 글자 대문자)
    words = text_stripped.split()
    if 2 <= len(words) <= 3 and all(w[0].isupper() and w.isalpha() for w in words):
        return "person_name"

    return "unknown"


def extract_clean_value(text: str, field: str) -> str:
    """분류된 필드에서 해당 값만 깨끗하게 추출."""
    if field == "email":
        match = EMAIL_PATTERN.search(text)
        return match.group() if match else text
    if field == "phone_number":
        match = MOBILE_PATTERN.search(text) or LANDLINE_PATTERN.search(text)
        return match.group() if match else text
    if field == "fax_number":
        match = LANDLINE_PATTERN.search(text) or MOBILE_PATTERN.search(text)
        return match.group() if match else text
    return text


def _split_multi_number_blocks(text_blocks: list[dict]) -> list[dict]:
    """
    하나의 블록에 팩스+전화 등 여러 번호가 합쳐진 경우 분리.
    예: "Fax 053-289-4021Mobile 010-5140-3662" → 2개 블록으로 분리
    """
    expanded = []
    for block in text_blocks:
        text = block["text"].strip()
        landline_matches = list(LANDLINE_PATTERN.finditer(text))
        mobile_matches = list(MOBILE_PATTERN.finditer(text))
        all_matches = landline_matches + mobile_matches

        # 번호가 2개 이상이면 분리
        if len(all_matches) >= 2:
            # 각 번호 앞의 키워드를 포함해서 분리
            segments = []
            match_positions = sorted(
                [(m.start(), m.end(), m.group()) for m in all_matches],
                key=lambda x: x[0]
            )
            for i, (start, end, number) in enumerate(match_positions):
                # 번호 앞부분에서 키워드 찾기
                if i == 0:
                    prefix = text[:start]
                else:
                    prefix = text[match_positions[i-1][1]:start]
                segment_text = (prefix + number).strip()
                if segment_text:
                    segments.append(segment_text)

            for seg in segments:
                expanded.append({
                    "text": seg,
                    "confidence": block.get("confidence", 0.0),
                    "bbox": block.get("bbox"),
                    "block_index": block["block_index"],
                })
        else:
            expanded.append(block)
    return expanded


def classify_all_blocks(text_blocks: list[dict]) -> list[dict]:
    """
    전체 텍스트 블록을 순회하며 분류 결과를 추가.
    전처리: 복합 블록 분리 → 2-pass 분류 → 값 추출.
    """
    # 전처리: 번호가 합쳐진 블록 분리
    text_blocks = _split_multi_number_blocks(text_blocks)

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

    # 결과 정리 + 값 추출
    results = []
    for block in text_blocks:
        field = block.pop("_classified")
        clean_text = extract_clean_value(block["text"], field)
        results.append({
            "text": clean_text,
            "confidence": block.get("confidence", 0.0),
            "bbox": block.get("bbox"),
            "block_index": block["block_index"],
            "field": field,
        })

    return results
