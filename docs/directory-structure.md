# MORA 디렉토리 구조 & 네이밍 기준

## 전체 아키텍처

```
                    ┌──────────────┐
                    │   Browser    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Next.js    │ :3000
                    │  (frontend/) │
                    └──────┬───────┘
                           │ HTTP
                    ┌──────▼───────┐
                    │ Spring Boot  │ :8080
                    │  (spring/)   │ ← 메인 API
                    └──┬───┬───┬───┘
                       │   │   │
              ┌────────┘   │   └────────┐
              ▼            ▼            ▼
    ┌─────────────┐ ┌───────────┐ ┌──────────┐
    │ Python OCR  │ │PostgreSQL │ │ OpenAI   │
    │ (backend/)  │ │+ pgvector │ │ API      │
    │    :8000    │ │   :5433   │ │ (cloud)  │
    └─────────────┘ └───────────┘ └──────────┘
```

---

## 디렉토리 트리

```
claude_mvp/
│
├── frontend/                    ← 🎨 Next.js 프론트엔드
│   ├── app/                     ← App Router (페이지/레이아웃)
│   │   ├── page.tsx             ← 랜딩 페이지 (/)
│   │   ├── layout.tsx           ← 루트 레이아웃 (폰트, 메타)
│   │   ├── globals.css          ← 전역 CSS + 디자인 토큰
│   │   ├── login/
│   │   │   └── page.tsx         ← 로그인/회원가입 (/login)
│   │   └── dashboard/
│   │       ├── layout.tsx       ← 대시보드 레이아웃 (사이드바)
│   │       ├── page.tsx         ← 리다이렉트 → /dashboard/upload
│   │       ├── upload/
│   │       │   └── page.tsx     ← 명함 스캔 + 수정 + 저장
│   │       ├── cards/
│   │       │   └── page.tsx     ← 내 명함 목록 + 팝업 + 수정/삭제
│   │       └── search/
│   │           └── page.tsx     ← 벡터 검색 + 결과 카드
│   │
│   ├── components/              ← 재사용 컴포넌트
│   │   ├── common/
│   │   │   └── Nav.tsx          ← 랜딩 페이지 네비게이션
│   │   └── landing/
│   │       ├── HeroSection.tsx  ← 히어로 (3D 명함 카드)
│   │       ├── ProblemSection.tsx ← 공감 섹션
│   │       ├── HowToSection.tsx ← 3단계 사용법
│   │       ├── FeatureSection.tsx ← 주요 기능 4개
│   │       ├── CTASection.tsx   ← 콜투액션
│   │       └── FooterSection.tsx ← 푸터
│   │
│   ├── lib/
│   │   └── api.ts               ← API 호출 함수 (Spring 연결)
│   │
│   ├── types/
│   │   └── index.ts             ← 공유 TypeScript 타입
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── postcss.config.mjs
│   └── eslint.config.mjs
│
├── spring/                      ← ☕ Java Spring Boot 메인 API
│   ├── pom.xml                  ← Maven 빌드 설정
│   ├── src/main/
│   │   ├── resources/
│   │   │   └── application.yml  ← DB, JWT, OpenAI 설정
│   │   └── java/com/mora/
│   │       ├── MoraApplication.java ← Spring Boot 진입점
│   │       │
│   │       ├── config/          ← 설정 클래스
│   │       │   ├── CorsConfig.java
│   │       │   ├── SecurityConfig.java
│   │       │   └── RestTemplateConfig.java
│   │       │
│   │       ├── security/        ← JWT 인증
│   │       │   ├── JwtUtil.java
│   │       │   └── JwtFilter.java
│   │       │
│   │       ├── entity/          ← JPA 엔티티 (DB 테이블)
│   │       │   ├── User.java
│   │       │   └── BusinessCard.java
│   │       │
│   │       ├── repository/      ← JPA 리포지토리 (DB 쿼리)
│   │       │   ├── UserRepository.java
│   │       │   └── BusinessCardRepository.java
│   │       │
│   │       ├── service/         ← 비즈니스 로직
│   │       │   ├── AuthService.java       ← 회원가입/로그인
│   │       │   ├── CardService.java       ← 명함 CRUD + 검색
│   │       │   ├── OcrService.java        ← Python OCR 호출
│   │       │   └── EmbeddingService.java  ← OpenAI 임베딩
│   │       │
│   │       ├── controller/      ← REST API 엔드포인트
│   │       │   ├── AuthController.java    ← /auth/*
│   │       │   └── CardController.java    ← /api/*
│   │       │
│   │       └── dto/             ← 요청/응답 객체
│   │           ├── ApiResponse.java
│   │           ├── SignupRequest.java
│   │           ├── LoginRequest.java
│   │           ├── AuthResponse.java
│   │           ├── UserResponse.java
│   │           ├── CardSaveRequest.java
│   │           └── CardResponse.java
│   │
│   └── target/                  ← (빌드 산출물, git 제외)
│
├── backend/                     ← 🐍 Python OCR 마이크로서비스
│   ├── app.py                   ← FastAPI 진입점
│   ├── services.py              ← OCR 파이프라인 싱글톤
│   ├── requirements.txt
│   ├── routers/
│   │   └── ocr.py               ← POST /api/scan (유일한 엔드포인트)
│   └── src/
│       ├── ocr/
│       │   └── paddle_ocr_engine.py  ← PaddleOCR 래퍼
│       ├── classifier/
│       │   └── rule_based.py    ← 정규식 기반 필드 분류
│       └── pipeline/
│           └── extract_pipeline.py ← OCR → 분류 파이프라인
│
├── docs/                        ← 📄 프로젝트 문서
│   ├── conventions.md           ← 코딩/네이밍/브랜치 컨벤션
│   └── directory-structure.md   ← 본 문서
│
├── uploads/                     ← 📁 업로드된 명함 이미지 (git 제외)
│
├── .env                         ← 환경변수 (git 제외)
├── .env.example                 ← 환경변수 템플릿
├── .gitignore
├── start.bat                    ← 원클릭 전체 실행 스크립트
└── README.md
```

---

## 디렉토리 네이밍 기준

### 최상위 디렉토리

| 디렉토리 | 역할 | 네이밍 이유 |
|----------|------|------------|
| `frontend/` | Next.js 프론트엔드 | 역할 기반 — 화면(UI)을 담당 |
| `spring/` | Java Spring Boot API | 프레임워크 기반 — Spring 프로젝트임을 명시 |
| `backend/` | Python OCR 서비스 | 역할 기반 — OCR 백엔드 처리 담당 |
| `docs/` | 프로젝트 문서 | 관례 — 대부분 프로젝트에서 docs/ 사용 |
| `uploads/` | 업로드 파일 저장 | 용도 기반 — 업로드된 파일이 저장되는 곳 |

### frontend/ 내부

| 디렉토리 | 네이밍 기준 | 설명 |
|----------|-----------|------|
| `app/` | **Next.js 규칙** | App Router 라우팅 디렉토리 |
| `app/login/` | **URL 경로 = 디렉토리명** | `/login` 페이지 |
| `app/dashboard/` | **URL 경로 = 디렉토리명** | `/dashboard/*` 페이지 그룹 |
| `app/dashboard/upload/` | **기능 단위** | 명함 업로드 기능 |
| `app/dashboard/cards/` | **리소스명 복수형** | 명함 목록 (cards) |
| `app/dashboard/search/` | **기능 단위** | 검색 기능 |
| `components/` | **관례** | 재사용 가능한 React 컴포넌트 |
| `components/common/` | **용도 분류** | 여러 페이지에서 공통 사용 |
| `components/landing/` | **페이지 귀속** | 랜딩 페이지 전용 컴포넌트 |
| `lib/` | **관례** | 유틸리티/API 호출 함수 |
| `types/` | **관례** | TypeScript 타입 정의 |

### spring/ 내부

| 디렉토리 | 네이밍 기준 | 설명 |
|----------|-----------|------|
| `config/` | **Spring 관례** | 설정 클래스 (@Configuration) |
| `security/` | **관심사 분리** | JWT 인증 관련만 |
| `entity/` | **JPA 관례** | DB 테이블과 매핑되는 엔티티 |
| `repository/` | **Spring Data 관례** | JPA 리포지토리 (DB 접근) |
| `service/` | **레이어드 아키텍처** | 비즈니스 로직 계층 |
| `controller/` | **레이어드 아키텍처** | HTTP 요청 처리 계층 |
| `dto/` | **관례** | Data Transfer Object (요청/응답) |

### backend/ 내부

| 디렉토리 | 네이밍 기준 | 설명 |
|----------|-----------|------|
| `routers/` | **FastAPI 관례** | API 라우터 파일 |
| `src/ocr/` | **기능 단위** | OCR 엔진 관련 |
| `src/classifier/` | **기능 단위** | 텍스트 분류 관련 |
| `src/pipeline/` | **기능 단위** | OCR → 분류 파이프라인 |

---

## 파일 네이밍 기준

| 영역 | 규칙 | 예시 |
|------|------|------|
| **Next.js 페이지** | Next.js 규칙 (소문자) | `page.tsx`, `layout.tsx` |
| **React 컴포넌트** | PascalCase | `HeroSection.tsx`, `Nav.tsx` |
| **TypeScript 유틸** | camelCase | `api.ts` |
| **Java 클래스** | PascalCase | `CardService.java`, `JwtUtil.java` |
| **Python 모듈** | snake_case | `paddle_ocr_engine.py`, `rule_based.py` |
| **설정 파일** | kebab-case 또는 프레임워크 규칙 | `application.yml`, `tsconfig.json` |
| **SQL 파일** | 번호_설명 | `001_init.sql` |

---

## API 엔드포인트 구조

### Spring Boot (:8080) — 메인 API

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/auth/signup` | 회원가입 | ✕ |
| POST | `/auth/login` | 로그인 | ✕ |
| GET | `/auth/me` | 내 정보 | ✓ |
| POST | `/api/scan` | 명함 스캔 (→ Python OCR) | ✕ |
| POST | `/api/save` | 명함 저장 + 임베딩 | ✓ |
| GET | `/api/cards` | 내 명함 목록 | ✓ |
| PUT | `/api/cards/{id}` | 명함 수정 | ✓ |
| DELETE | `/api/cards/{id}` | 명함 삭제 | ✓ |
| GET | `/api/search?q=` | 벡터 검색 | ✓ |

### Python OCR (:8000) — 내부 서비스

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/scan` | OCR + 규칙 기반 파싱 |

> Python OCR은 Spring에서만 호출. 프론트엔드가 직접 호출하지 않음.
> (이미지 서빙 `/uploads/*`만 프론트엔드가 직접 접근)
