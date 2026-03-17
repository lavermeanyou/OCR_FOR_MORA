"""
특성 추출기: 텍스트에서 ML 모델 학습용 특성 벡터 생성
LLM 없이 문자 패턴 기반으로 동작
"""
import re
import numpy as np


# ── 사전 컴파일된 패턴 ──
PAT_EMAIL = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}")
PAT_MOBILE = re.compile(r"01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}")
PAT_LANDLINE = re.compile(r"0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}")
PAT_KOREAN = re.compile(r"[가-힣]")
PAT_ENGLISH = re.compile(r"[a-zA-Z]")
PAT_DIGIT = re.compile(r"\d")
PAT_SPECIAL = re.compile(r"[^a-zA-Z0-9가-힣\s]")
PAT_AT = re.compile(r"@")
PAT_DOT = re.compile(r"\.")
PAT_HYPHEN = re.compile(r"[-]")
PAT_PAREN = re.compile(r"[()㈜]")
PAT_FAX_KW = re.compile(r"(?i)(fax|팩스|f\s*[:.)])")
PAT_PHONE_KW = re.compile(r"(?i)(tel|phone|전화|핸드폰|휴대폰|mobile|h\.?p\.?)")
PAT_UPPER_START = re.compile(r"^[A-Z]")
PAT_ALL_KOREAN = re.compile(r"^[가-힣]+$")

# 직책/회사 키워드 (있으면 1, 없으면 0)
JOB_KEYWORDS = {"대표", "사장", "부사장", "전무", "상무", "이사", "부장", "차장",
                "과장", "대리", "사원", "주임", "팀장", "실장", "본부장", "센터장",
                "매니저", "엔지니어", "디자이너", "개발자", "연구원", "교수",
                "ceo", "cto", "cfo", "vp", "director", "manager", "engineer",
                "designer", "developer", "analyst", "senior", "junior", "lead",
                "head", "chief", "intern", "architect", "scientist"}

COMPANY_KEYWORDS = {"주식회사", "(주)", "㈜", "회사", "그룹", "법인", "협회", "재단",
                    "테크", "랩", "솔루션", "시스템", "네트워크", "미디어",
                    "inc", "corp", "ltd", "llc", "co.", "company", "group",
                    "technologies", "tech", "labs", "solutions", "partners"}


def extract_features(text: str) -> np.ndarray:
    """
    텍스트에서 53차원 특성 벡터 추출.

    Features:
        [0-4]   길이 관련 (총길이, 단어수, 평균단어길이, 공백비율, 줄바꿈수)
        [5-12]  문자 비율 (한글, 영어, 숫자, 특수문자, @, ., -, 괄호)
        [13-17] 패턴 매칭 (이메일, 모바일, 유선전화, 팩스키워드, 전화키워드)
        [18-22] 구조 (첫글자대문자, 전체한글, 숫자시작, 영어시작, 한글시작)
        [23-24] 키워드 (직책키워드, 회사키워드)
        [25-34] 문자 n-gram 빈도 (상위 10개 bigram 패턴)
        [35-44] 위치 기반 (첫3글자 숫자비율, 마지막3글자 숫자비율 등)
        [45-52] 추가 통계
    """
    text_stripped = text.strip()
    length = len(text_stripped)
    if length == 0:
        return np.zeros(53, dtype=np.float32)

    words = text_stripped.split()
    word_count = len(words)

    # ── [0-4] 길이 관련 ──
    avg_word_len = np.mean([len(w) for w in words]) if words else 0
    space_ratio = text_stripped.count(' ') / length
    newline_count = text_stripped.count('\n')

    # ── [5-12] 문자 비율 ──
    n_korean = len(PAT_KOREAN.findall(text_stripped))
    n_english = len(PAT_ENGLISH.findall(text_stripped))
    n_digit = len(PAT_DIGIT.findall(text_stripped))
    n_special = len(PAT_SPECIAL.findall(text_stripped))
    n_at = len(PAT_AT.findall(text_stripped))
    n_dot = len(PAT_DOT.findall(text_stripped))
    n_hyphen = len(PAT_HYPHEN.findall(text_stripped))
    n_paren = len(PAT_PAREN.findall(text_stripped))

    korean_ratio = n_korean / length
    english_ratio = n_english / length
    digit_ratio = n_digit / length
    special_ratio = n_special / length
    at_ratio = n_at / length
    dot_ratio = n_dot / length
    hyphen_ratio = n_hyphen / length
    paren_ratio = n_paren / length

    # ── [13-17] 패턴 매칭 ──
    has_email = 1.0 if PAT_EMAIL.search(text_stripped) else 0.0
    has_mobile = 1.0 if PAT_MOBILE.search(text_stripped) else 0.0
    has_landline = 1.0 if PAT_LANDLINE.search(text_stripped) else 0.0
    has_fax_kw = 1.0 if PAT_FAX_KW.search(text_stripped) else 0.0
    has_phone_kw = 1.0 if PAT_PHONE_KW.search(text_stripped) else 0.0

    # ── [18-22] 구조 ──
    starts_upper = 1.0 if PAT_UPPER_START.match(text_stripped) else 0.0
    all_korean = 1.0 if PAT_ALL_KOREAN.match(text_stripped) else 0.0
    starts_digit = 1.0 if text_stripped[0].isdigit() else 0.0
    starts_english = 1.0 if text_stripped[0].isascii() and text_stripped[0].isalpha() else 0.0
    starts_korean = 1.0 if '\uac00' <= text_stripped[0] <= '\ud7a3' else 0.0

    # ── [23-24] 키워드 ──
    text_lower = text_stripped.lower()
    has_job_kw = 1.0 if any(kw in text_lower for kw in JOB_KEYWORDS) else 0.0
    has_company_kw = 1.0 if any(kw in text_lower for kw in COMPANY_KEYWORDS) else 0.0

    # ── [25-34] Character bigram 빈도 (상위 패턴) ──
    # 이메일/전화/이름 구분에 유용한 bigram 패턴
    target_bigrams = ["@g", "@n", ".c", ".k", "01", "02", "03", "0-", "--",
                      "(주"]
    bigram_features = []
    for bg in target_bigrams:
        count = text_lower.count(bg.lower()) if len(bg) == 2 else 0
        bigram_features.append(min(count / max(length, 1), 1.0))

    # ── [35-44] 위치 기반 ──
    first3 = text_stripped[:3]
    last3 = text_stripped[-3:] if length >= 3 else text_stripped
    first3_digit_ratio = sum(c.isdigit() for c in first3) / len(first3)
    last3_digit_ratio = sum(c.isdigit() for c in last3) / len(last3)
    first3_alpha_ratio = sum(c.isalpha() for c in first3) / len(first3)
    last3_alpha_ratio = sum(c.isalpha() for c in last3) / len(last3)

    # 중간 부분 특성
    mid = text_stripped[length // 4: 3 * length // 4] if length > 4 else text_stripped
    mid_digit_ratio = sum(c.isdigit() for c in mid) / max(len(mid), 1)
    mid_special_ratio = len(PAT_SPECIAL.findall(mid)) / max(len(mid), 1)

    # 연속 숫자 최대 길이
    max_digit_seq = max((len(m) for m in re.findall(r'\d+', text_stripped)), default=0)
    # 연속 한글 최대 길이
    max_korean_seq = max((len(m) for m in re.findall(r'[가-힣]+', text_stripped)), default=0)
    # 연속 영어 최대 길이
    max_english_seq = max((len(m) for m in re.findall(r'[a-zA-Z]+', text_stripped)), default=0)
    # 전체 대비 최대 연속 숫자 비율
    max_digit_seq_ratio = max_digit_seq / length

    # ── [45-52] 추가 통계 ──
    # 대문자 비율
    upper_ratio = sum(1 for c in text_stripped if c.isupper()) / max(n_english, 1) if n_english > 0 else 0
    # 단어 중 대문자 시작 비율
    cap_word_ratio = sum(1 for w in words if w[0].isupper()) / max(word_count, 1) if words else 0
    # 하이픈으로 분리된 세그먼트 수
    hyphen_segments = len(text_stripped.split('-'))
    # 점으로 분리된 세그먼트 수
    dot_segments = len(text_stripped.split('.'))
    # 유니크 문자 수 / 전체 길이
    unique_char_ratio = len(set(text_stripped)) / length
    # 숫자 그룹 수
    digit_groups = len(re.findall(r'\d+', text_stripped))
    # 한글 2~4글자 단독인지
    is_short_korean = 1.0 if all_korean and 2 <= length <= 4 else 0.0
    # 영어 2~3단어, 모두 대문자시작인지
    is_english_name_like = 1.0 if (2 <= word_count <= 3 and
                                    all(w[0].isupper() and w.isalpha() for w in words)) else 0.0

    features = np.array([
        # [0-4] 길이
        min(length / 50, 1.0), min(word_count / 10, 1.0), min(avg_word_len / 15, 1.0),
        space_ratio, min(newline_count / 3, 1.0),
        # [5-12] 문자 비율
        korean_ratio, english_ratio, digit_ratio, special_ratio,
        at_ratio, dot_ratio, hyphen_ratio, paren_ratio,
        # [13-17] 패턴
        has_email, has_mobile, has_landline, has_fax_kw, has_phone_kw,
        # [18-22] 구조
        starts_upper, all_korean, starts_digit, starts_english, starts_korean,
        # [23-24] 키워드
        has_job_kw, has_company_kw,
        # [25-34] bigram
        *bigram_features,
        # [35-44] 위치 기반
        first3_digit_ratio, last3_digit_ratio, first3_alpha_ratio, last3_alpha_ratio,
        mid_digit_ratio, mid_special_ratio,
        min(max_digit_seq / 15, 1.0), min(max_korean_seq / 10, 1.0),
        min(max_english_seq / 20, 1.0), max_digit_seq_ratio,
        # [45-52] 추가
        upper_ratio, cap_word_ratio, min(hyphen_segments / 5, 1.0),
        min(dot_segments / 5, 1.0), unique_char_ratio, min(digit_groups / 5, 1.0),
        is_short_korean, is_english_name_like,
    ], dtype=np.float32)

    return features


def extract_batch(texts: list[str]) -> np.ndarray:
    """배치 특성 추출."""
    return np.array([extract_features(t) for t in texts], dtype=np.float32)
