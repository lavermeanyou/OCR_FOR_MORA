# MORA Frontend

Vanilla HTML/CSS/JS 프론트엔드 - 빌드 도구 불필요

## 구조

```
frontend/
├── index.html          ← SPA 진입점 (4개 페이지)
├── css/
│   ├── landing.css      ← 랜딩 페이지 + 디자인 시스템
│   └── app.css          ← 업로드/결과/검색 페이지
├── js/
│   ├── landing.js       ← 스크롤 애니메이션
│   └── app.js           ← 업로드, API 호출, 결과 표시
└── assets/              ← 이미지 등 정적 파일
```

## 실행

백엔드 서버가 프론트엔드를 자동 서빙합니다:

```bash
cd backend
python run.py
# → http://localhost:8000 에서 확인
```

## 디자인 시스템

| Token       | Value     |
|-------------|-----------|
| Primary     | `#15293D` |
| Background  | `#DDE2E6` |
| Text        | `#84888D` |
| Accent      | `#FF8A3D` |
| Font (기본)  | Post No Bills Jaffna |
| Font (로고)  | Patua One |
| Font (숫자)  | Konkhmer Sleokchher |
| Button 반경  | 10px      |
