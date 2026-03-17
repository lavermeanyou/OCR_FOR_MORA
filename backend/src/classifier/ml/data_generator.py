"""
합성 학습 데이터 생성기
각 필드 타입에 대해 수만 개의 현실적인 예제를 자동 생성
"""
import random
import string

# ── 한국 이름 데이터 ──
SURNAMES_1 = list("김이박최정강조윤장임한오서신권황안송유류홍전고문손양배백허노심하주구곽성차우진민나지엄채원천방공현함변염여추도소석선설마길연위표명기반라왕금옥육인맹")
SURNAMES_2 = ["남궁", "독고", "황보", "제갈", "선우", "동방", "사공", "서문"]
GIVEN_NAMES_1 = list("민서준예지윤도하현수연우진영은아정호성재원혁상경태희승")
GIVEN_NAMES_2 = ["민수", "지은", "준호", "서연", "현우", "예진", "도윤", "하린",
                 "수빈", "연서", "우진", "영은", "아름", "정호", "성민", "재원",
                 "원혁", "상현", "경태", "희재", "승우", "나래", "가은", "다인",
                 "라윤", "마린", "바름", "사랑", "자영", "차민", "카이", "태양",
                 "파랑", "하늘", "가람", "나루", "다솜", "바다", "새롬", "온유"]

# ── 영문 이름 데이터 ──
EN_FIRST = ["James", "John", "Robert", "Michael", "David", "William", "Richard",
            "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda",
            "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
            "Daniel", "Matthew", "Anthony", "Mark", "Steven", "Andrew", "Kevin",
            "Brian", "Edward", "Ronald", "Emily", "Emma", "Olivia", "Sophia", "Ava"]
EN_LAST = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
           "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas", "Moore",
           "Jackson", "Martin", "Lee", "Kim", "Park", "Choi", "Jung", "Kang",
           "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Young", "Allen"]

# ── 이메일 도메인 ──
DOMAINS = ["gmail.com", "naver.com", "daum.net", "hanmail.net", "kakao.com",
           "yahoo.com", "outlook.com", "hotmail.com", "nate.com", "icloud.com",
           "company.co.kr", "tech.kr", "corp.com", "work.net", "office.kr",
           "samsung.com", "lg.com", "sk.com", "hyundai.com", "lotte.com"]

# ── 직책 ──
JOB_TITLES_KO = [
    "대표이사", "사장", "부사장", "전무이사", "상무이사", "이사",
    "부장", "차장", "과장", "대리", "사원", "주임",
    "팀장", "실장", "본부장", "센터장", "그룹장",
    "수석연구원", "책임연구원", "선임연구원", "연구원",
    "수석 엔지니어", "선임 엔지니어", "엔지니어",
    "수석 디자이너", "선임 디자이너", "디자이너",
    "개발팀장", "기획팀장", "영업팀장", "마케팅팀장",
    "프로젝트 매니저", "프로덕트 매니저", "기술이사",
]
JOB_TITLES_EN = [
    "CEO", "CTO", "CFO", "COO", "CMO", "CPO",
    "VP of Engineering", "VP of Sales", "VP of Marketing",
    "Director", "Senior Director", "Managing Director",
    "Senior Manager", "Manager", "Assistant Manager",
    "Senior Engineer", "Staff Engineer", "Software Engineer",
    "Principal Engineer", "Lead Engineer", "Junior Engineer",
    "Senior Designer", "UX Designer", "UI Designer",
    "Product Manager", "Project Manager", "Scrum Master",
    "Data Scientist", "ML Engineer", "DevOps Engineer",
    "QA Engineer", "Technical Lead", "Architect",
    "Consultant", "Analyst", "Specialist", "Coordinator",
    "Intern", "Trainee", "Associate",
]

# ── 회사명 ──
COMPANY_PREFIXES_KO = ["삼성", "LG", "현대", "SK", "롯데", "포스코", "한화", "두산",
                       "CJ", "GS", "KT", "넥슨", "카카오", "네이버", "쿠팡", "배달의민족",
                       "토스", "당근", "야놀자", "마켓컬리", "리디", "왓챠", "뱅크샐러드"]
COMPANY_SUFFIXES_KO = ["주식회사", "(주)", "㈜", ""]
COMPANY_TYPES_KO = ["테크", "솔루션", "시스템즈", "네트워크", "미디어", "엔터테인먼트",
                    "파트너스", "글로벌", "코리아", "인터내셔널", "랩", "스튜디오"]
COMPANY_EN = ["Technologies", "Tech", "Solutions", "Systems", "Networks", "Media",
              "Labs", "Studio", "Group", "Corp", "Inc", "LLC", "Co.", "Partners",
              "Digital", "Software", "Cloud", "AI", "Data", "Analytics"]

# ── 전화번호 패턴 ──
AREA_CODES = ["02", "031", "032", "033", "041", "042", "043", "044",
              "051", "052", "053", "054", "055", "061", "062", "063", "064"]


def _random_korean_name():
    if random.random() < 0.02:
        surname = random.choice(SURNAMES_2)
    else:
        surname = random.choice(SURNAMES_1)
    given = random.choice(GIVEN_NAMES_2)
    return surname + given


def _random_english_name():
    return f"{random.choice(EN_FIRST)} {random.choice(EN_LAST)}"


def _random_email():
    user_styles = [
        lambda: ''.join(random.choices(string.ascii_lowercase, k=random.randint(4, 10))),
        lambda: ''.join(random.choices(string.ascii_lowercase, k=random.randint(3, 6))) + str(random.randint(1, 999)),
        lambda: random.choice(EN_FIRST).lower() + "." + random.choice(EN_LAST).lower(),
        lambda: random.choice(EN_FIRST).lower() + random.choice(EN_LAST).lower()[:3],
        lambda: random.choice(EN_FIRST).lower() + str(random.randint(10, 99)),
        lambda: ''.join(random.choices(string.ascii_lowercase, k=3)) + "_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=4)),
    ]
    user = random.choice(user_styles)()
    domain = random.choice(DOMAINS)
    return f"{user}@{domain}"


def _random_mobile():
    prefix = random.choice(["010", "011", "016", "017", "018", "019"])
    mid = str(random.randint(1000, 9999))
    last = str(random.randint(1000, 9999))
    sep = random.choice(["-", ".", " ", ""])
    return f"{prefix}{sep}{mid}{sep}{last}"


def _random_landline():
    area = random.choice(AREA_CODES)
    if area == "02":
        mid = str(random.randint(100, 9999))
    else:
        mid = str(random.randint(100, 999))
    last = str(random.randint(1000, 9999))
    sep = random.choice(["-", ".", " ", ""])
    return f"{area}{sep}{mid}{sep}{last}"


def _random_phone():
    """전화번호: 모바일 또는 일반 전화."""
    if random.random() < 0.6:
        num = _random_mobile()
    else:
        num = _random_landline()
    # 가끔 접두사 추가
    prefix = random.choice(["", "", "", "Tel ", "TEL: ", "전화 ", "T. ", "H.P ", "Mobile "])
    return prefix + num


def _random_fax():
    num = _random_landline()
    prefix = random.choice(["Fax ", "FAX: ", "팩스 ", "F. ", "FAX ", "fax: "])
    return prefix + num


def _random_job_title():
    if random.random() < 0.5:
        return random.choice(JOB_TITLES_KO)
    else:
        return random.choice(JOB_TITLES_EN)


def _random_company():
    if random.random() < 0.6:
        # 한국 회사
        prefix = random.choice(COMPANY_PREFIXES_KO)
        ctype = random.choice(COMPANY_TYPES_KO + [""])
        suffix = random.choice(COMPANY_SUFFIXES_KO)
        name = f"{suffix}{prefix}{ctype}" if suffix in ["(주)", "㈜"] else f"{prefix}{ctype} {suffix}"
        return name.strip()
    else:
        # 영문 회사
        word1 = random.choice(EN_LAST + ["Alpha", "Beta", "Nova", "Apex", "Core", "Nexus", "Pulse", "Swift", "Forge", "Quantum"])
        word2 = random.choice(COMPANY_EN)
        return f"{word1} {word2}"


def _random_unknown():
    """분류 불가 텍스트: 주소, 웹사이트, 기타."""
    types = [
        lambda: f"서울특별시 {random.choice(['강남구', '서초구', '송파구', '마포구', '영등포구'])} {random.choice(['테헤란로', '강남대로', '올림픽로'])} {random.randint(1,500)}",
        lambda: f"www.{''.join(random.choices(string.ascii_lowercase, k=random.randint(4,8)))}.{random.choice(['com', 'co.kr', 'kr', 'net'])}",
        lambda: f"{random.randint(1,50)}층 {random.randint(100,999)}호",
        lambda: ''.join(random.choices(string.ascii_uppercase + string.digits, k=random.randint(5, 15))),
        lambda: random.choice(["사업자등록번호", "법인번호", "계좌번호"]) + f" {random.randint(100,999)}-{random.randint(10,99)}-{random.randint(10000,99999)}",
    ]
    return random.choice(types)()


# ── 필드별 생성기 매핑 ──
GENERATORS = {
    "email": _random_email,
    "phone_number": _random_phone,
    "fax_number": _random_fax,
    "person_name": lambda: _random_korean_name() if random.random() < 0.7 else _random_english_name(),
    "job_title": _random_job_title,
    "company_name": _random_company,
    "unknown": _random_unknown,
}

FIELD_NAMES = list(GENERATORS.keys())


def generate_dataset(samples_per_field: int = 5000, seed: int = 42) -> list[tuple[str, str]]:
    """
    합성 학습 데이터 생성.

    Args:
        samples_per_field: 필드당 생성할 샘플 수
        seed: 랜덤 시드

    Returns:
        [(텍스트, 필드명), ...] 리스트
    """
    random.seed(seed)
    dataset = []

    for field, generator in GENERATORS.items():
        for _ in range(samples_per_field):
            text = generator()
            dataset.append((text, field))

    random.shuffle(dataset)
    return dataset


def generate_hard_examples(samples: int = 2000, seed: int = 123) -> list[tuple[str, str]]:
    """
    경계 케이스 / 어려운 예제 생성 (강화 학습용).
    모델이 혼동하기 쉬운 패턴들.
    """
    random.seed(seed)
    hard = []

    for _ in range(samples // 6):
        # 숫자가 포함된 이름 (전화번호와 혼동)
        hard.append((_random_korean_name(), "person_name"))

        # 회사명에 사람이름 같은 단어
        hard.append((random.choice(["김앤장", "이앤씨", "박컨설팅", "최테크"]), "company_name"))

        # 직책이 포함된 이름 라인
        name = _random_korean_name()
        title = random.choice(["대리", "과장", "팀장"])
        hard.append((f"{name} {title}", "job_title"))

        # @없는 이메일처럼 보이는 텍스트
        hard.append((f"{''.join(random.choices(string.ascii_lowercase, k=6))}.com", "unknown"))

        # 팩스와 전화 구분
        hard.append((_random_landline(), "phone_number"))
        hard.append((f"F.{_random_landline()}", "fax_number"))

    random.shuffle(hard)
    return hard


if __name__ == "__main__":
    # 테스트
    data = generate_dataset(samples_per_field=3)
    for text, label in data[:21]:
        print(f"[{label:15s}] {text}")
    print(f"\nTotal: {len(data)} samples")
