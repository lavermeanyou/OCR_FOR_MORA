# OCR_FOR_MORA

MORA를 위한 명함 OCR 파이프라인 — 명함 이미지에서 연락처 정보를 자동으로 추출하고 구조화합니다.

## 주요 기능

- **OCR 엔진**: PaddleOCR 기반 한국어/영어 텍스트 인식
- **규칙 기반 분류기**: 정규식 + 휴리스틱으로 텍스트 블록을 필드별로 분류
- **엔드투엔드 파이프라인**: 이미지 입력 → OCR → 분류 → 구조화된 JSON 출력

## 추출 필드

| 필드 | 설명 |
|------|------|
| `company_name` | 회사이름 |
| `person_name` | 이름 |
| `job_title` | 직책 |
| `phone_number` | 전화번호 |
| `fax_number` | 팩스번호 |
| `email` | 이메일 |

## 프로젝트 구조

```
├── configs/
│   └── schema.py              # 필드 스키마 정의 (내부명 ↔ 한국어 레이블)
├── src/
│   ├── ocr/
│   │   └── paddle_ocr_engine.py   # PaddleOCR 래퍼
│   ├── classifier/
│   │   └── rule_based.py          # 규칙 기반 텍스트 분류기
│   ├── pipeline/
│   │   └── extract_pipeline.py    # 엔드투엔드 파이프라인
│   └── utils/
├── tests/
│   └── test_classifier.py        # 분류기 단위 테스트
├── data/
│   ├── ocr_outputs/              # OCR 결과 JSON
│   └── labeled/                  # 레이블링된 데이터
├── models/
└── requirements.txt
```

## 설치

```bash
pip install -r requirements.txt
```

### 의존성

- `paddlepaddle` — PaddleOCR 실행 엔진
- `paddleocr` — OCR 모델
- `opencv-python` — 이미지 처리
- `Pillow` — 이미지 전처리 (리사이즈)
- `numpy`

## 사용법

### CLI 실행

```bash
python -m src.pipeline.extract_pipeline <이미지 경로>
```

### Python 코드에서 사용

```python
from src.pipeline.extract_pipeline import BusinessCardPipeline

pipeline = BusinessCardPipeline(lang="korean")
result = pipeline.run("path/to/business_card.jpg")

# 한국어 결과 출력
pipeline.print_result(result)

# JSON 파일로 저장
result = pipeline.run_and_save("card.jpg", "data/ocr_outputs")
```

### 출력 예시

```
========================================
  명함 인식 결과
========================================
  회사이름: ABC Corporation
  이름: 김민우
  직책: Senior Engineer
  전화번호: 010-1234-5678
  팩스번호: 02-123-4567
  이메일: minwoo@abc.com
========================================
```

## 테스트

```bash
python -m pytest tests/
```

## 향후 계획

- 규칙 기반 분류기 → ML 모델 교체
- 주소 필드 추출 추가
- 다국어 명함 지원 확대
