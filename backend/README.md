# MORA Backend

Python FastAPI 기반 OCR + RAG 검색 백엔드

## 구조

```
backend/
├── app.py                  ← FastAPI 진입점
├── run.py                  ← 개발 서버 실행
├── requirements.txt
├── src/
│   ├── ocr/                ← PaddleOCR 엔진 (기존)
│   ├── classifier/         ← 규칙 기반 텍스트 분류기 (기존)
│   ├── pipeline/           ← OCR → 분류 파이프라인 (기존)
│   ├── skills/             ← 스킬 시스템
│   │   ├── ocr_skill.py
│   │   ├── parsing_skill.py
│   │   ├── embedding_skill.py
│   │   └── retrieval_skill.py
│   └── vectorstore/        ← FAISS 벡터 저장소
├── configs/                ← 스키마 정의
└── tests/                  ← 테스트 (23개)
```

## 실행

```bash
cd backend
pip install -r requirements.txt
python run.py
# → http://localhost:8000
```

## API 엔드포인트

| Method | Path       | 설명                           |
|--------|------------|-------------------------------|
| GET    | /          | 프론트엔드 서빙                  |
| GET    | /health    | 서버 상태 확인                   |
| POST   | /ocr       | 이미지 → OCR 결과               |
| POST   | /parse     | 이미지 → 명함 필드 파싱           |
| POST   | /embed     | 이미지 → 임베딩 → 벡터 저장       |
| POST   | /process   | 전체 파이프라인 (OCR+Parse+Embed) |
| GET    | /search?q= | 시맨틱 벡터 검색                 |
| GET    | /changelog | 변경 이력 조회                   |
| GET    | /stats     | 시스템 통계                      |

## 테스트

```bash
cd backend
python -m pytest tests/ -v
```
