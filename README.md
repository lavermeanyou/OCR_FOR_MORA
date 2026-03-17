# MORA — Business Card OCR + RAG Search

명함 이미지에서 연락처 정보를 자동으로 추출하고, 벡터 검색으로 즉시 찾아주는 시스템

## 프로젝트 구조

```
claude_mvp/
├── backend/                ← Python FastAPI 백엔드
│   ├── app.py              ← API 서버 진입점
│   ├── run.py              ← 개발 서버 실행
│   ├── requirements.txt
│   ├── src/
│   │   ├── ocr/            ← PaddleOCR 엔진
│   │   ├── classifier/     ← 규칙 기반 분류기
│   │   ├── pipeline/       ← OCR → 분류 파이프라인
│   │   ├── skills/         ← 스킬 시스템 (OCR, Parse, Embed, Retrieval)
│   │   └── vectorstore/    ← FAISS 벡터 저장소
│   ├── configs/
│   └── tests/              ← 23개 테스트
│
├── frontend/               ← Vanilla HTML/CSS/JS 프론트엔드
│   ├── index.html          ← SPA (Landing, Upload, Result, Search)
│   ├── css/
│   │   ├── landing.css     ← 디자인 시스템 + 랜딩 애니메이션
│   │   └── app.css         ← 앱 UI 스타일
│   ├── js/
│   │   ├── landing.js      ← 스크롤 카드 애니메이션
│   │   └── app.js          ← 업로드 + 검색 로직
│   └── assets/
│
├── data/                   ← OCR 결과, 벡터 저장소, 변경 이력
└── uploads/                ← 업로드된 이미지
```

## 빠른 시작

```bash
# 1. 의존성 설치
cd backend
pip install -r requirements.txt

# 2. 서버 실행 (프론트엔드 자동 서빙)
python run.py

# 3. 브라우저에서 열기
# → http://localhost:8000
```

## 주요 기능

| 기능 | 설명 |
|------|------|
| OCR | PaddleOCR 기반 한국어/영어 텍스트 인식 |
| 명함 파싱 | 이름, 회사, 직책, 전화번호, 이메일 자동 분류 |
| 벡터 임베딩 | 다국어 Sentence-Transformers 모델 |
| RAG 검색 | FAISS 기반 시맨틱 유사도 검색 |
| 랜딩 페이지 | 스크롤 애니메이션 4개 섹션 |

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/ocr` | 이미지 → OCR 결과 |
| POST | `/parse` | 이미지 → 명함 필드 파싱 |
| POST | `/embed` | 이미지 → 임베딩 → 벡터 저장 |
| POST | `/process` | 전체 파이프라인 (OCR+Parse+Embed) |
| GET | `/search?q=` | 시맨틱 벡터 검색 |

## 테스트

```bash
cd backend
python -m pytest tests/ -v
# → 23 passed
```

## 디자인 시스템

| Token | Value |
|-------|-------|
| Primary | `#15293D` |
| Background | `#DDE2E6` |
| Text | `#84888D` |
| Accent | `#FF8A3D` |
| Font (기본) | Post No Bills Jaffna |
| Font (로고) | Patua One |
| Font (숫자) | Konkhmer Sleokchher |
