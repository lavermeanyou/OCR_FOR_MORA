# MORA 프로젝트 컨벤션

> 본 문서는 MORA(명함 OCR + RAG 검색) 프로젝트의 코딩/네이밍/브랜치/커밋/PR 규칙을 정의합니다.

---

## **컨벤션 요약표**

| 주제 | 핵심 규칙 |
| --- | --- |
| 프론트엔드 | Next.js 16 App Router, `app/`는 라우트, `components/`에 colocation |
| 백엔드 | FastAPI + PaddleOCR, `backend/api/`는 라우트, `backend/src/`는 비즈니스 로직 |
| 네이밍 (FE) | 컴포넌트 `PascalCase`, 유틸 `camelCase`, 상수 `UPPER_SNAKE_CASE` |
| 네이밍 (BE) | 모듈 `snake_case`, 클래스 `PascalCase`, 상수 `UPPER_SNAKE_CASE` |
| 스타일 | Tailwind CSS 기본, 복잡한 로컬 스타일은 `*.module.css` |
| DB | PostgreSQL + pgvector, 테이블/컬럼 `snake_case`, 인덱스 `idx_*` |
| 임베딩 | OpenAI API (`text-embedding-3-small`), pgvector에 저장 |
| 인프라 | Docker Compose로 로컬 환경 통합 관리 |
| API 응답 | `{ success, data?, error? }` 패턴, 상태코드 표준 준수 |
| Git | Conventional Commits, `feat/<topic>` 브랜치, 작은 단위 PR |

---

## **0. 기술 스택**

### Frontend
| 기술 | 버전 | 용도 |
| --- | --- | --- |
| Next.js | 16.1.6 | React 풀스택 프레임워크 (App Router) |
| React | 19.2.0 | UI 라이브러리 |
| TypeScript | 5.9.3 | 정적 타입 |
| Tailwind CSS | latest | 유틸리티 퍼스트 CSS |
| ESLint | 9.39.1 | 린팅 (Flat Config) |

### Backend
| 기술 | 버전 | 용도 |
| --- | --- | --- |
| Python | 3.11.4 | 백엔드 런타임 |
| FastAPI | latest | API 프레임워크 |
| PaddleOCR | 3.4.0 | 명함 OCR 텍스트 추출 |
| PaddlePaddle | 3.2.2 | OCR 엔진 |
| OpenAI | 2.26.0 | 임베딩 생성 (`text-embedding-3-small`) |
| Pillow | 12.1.1 | 이미지 전처리 |
| python-multipart | 0.0.22 | 파일 업로드 처리 |

### Database & Infra
| 기술 | 버전 | 용도 |
| --- | --- | --- |
| PostgreSQL | 16.3 | 메인 데이터베이스 |
| pgvector | 0.8.2 | 벡터 유사도 검색 확장 |
| Docker | 29.1.3 | 컨테이너 기반 환경 관리 |

---

## **1. 기본 원칙**

- **가독성 우선**: 짧고 명확한 함수/변수명. 주석은 "왜"를 설명.
- **일관성**: 파일 구조, 네이밍, import 경로, 코드 스타일 일관 유지.
- **캡슐화**: 컴포넌트와 스타일, 유틸은 가능한 **colocation**.
- **작은 단위 커밋**: 의미 있는 최소 단위로 커밋하고, PR은 작게 유지.
- **기존 OCR 보존**: `backend/src/ocr/`, `backend/src/classifier/rule_based.py`는 검증된 코드이므로 수정 최소화.

---

## **2. 디렉터리 구조**

```
claude_mvp/
├── frontend/                      ← Next.js 16 프로젝트
│   ├── app/                       ← App Router (페이지/레이아웃/API 라우트)
│   │   ├── (marketing)/           ← 라우트 그룹: 랜딩, 소개 페이지
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (app)/                 ← 라우트 그룹: 로그인 후 기능 페이지
│   │   │   ├── upload/page.tsx
│   │   │   ├── result/[id]/page.tsx
│   │   │   ├── search/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                   ← Route Handler (BFF 역할)
│   │   │   ├── auth/
│   │   │   ├── cards/
│   │   │   └── search/
│   │   ├── fonts/                 ← 로컬 폰트 파일
│   │   ├── globals.css            ← 전역 스타일 + Tailwind 지시문
│   │   └── layout.tsx             ← 루트 레이아웃
│   ├── components/                ← 재사용 컴포넌트
│   │   ├── ui/                    ← 범용 UI (Button, Card, Modal, ...)
│   │   ├── cards/                 ← 명함 도메인 컴포넌트
│   │   ├── landing/               ← 랜딩 페이지 섹션 컴포넌트
│   │   └── common/                ← Nav, Footer 등 공통
│   ├── lib/                       ← 유틸리티/클라이언트
│   │   ├── api.ts                 ← 백엔드 API fetch 래퍼
│   │   ├── auth.ts                ← 인증 관련 유틸
│   │   └── constants.ts           ← 공통 상수
│   ├── styles/                    ← CSS 변수/토큰
│   │   └── tokens.css             ← 디자인 토큰 (색상, 간격, 폰트)
│   ├── types/                     ← 공유 TypeScript 타입
│   │   └── index.ts
│   ├── public/                    ← 정적 파일 (이미지, 아이콘)
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── package.json
│   └── Dockerfile
│
├── backend/                       ← Python FastAPI 프로젝트
│   ├── app.py                     ← FastAPI 진입점 (라우터 마운트만)
│   ├── routers/                   ← API 라우터 분리
│   │   ├── ocr.py                 ← POST /ocr, /parse, /process
│   │   ├── search.py              ← GET /search
│   │   ├── auth.py                ← POST /auth/signup, /auth/login, OAuth
│   │   └── ml.py                  ← POST /ml/train, /ml/classify
│   ├── src/                       ← 비즈니스 로직
│   │   ├── ocr/                   ← PaddleOCR 엔진 (기존 코드 보존)
│   │   ├── classifier/            ← 규칙 기반 + ML 분류기
│   │   ├── pipeline/              ← OCR → 분류 파이프라인
│   │   ├── embedding/             ← OpenAI 임베딩 생성
│   │   └── auth/                  ← 인증 로직 (JWT, OAuth)
│   ├── db/                        ← 데이터베이스
│   │   ├── connection.py          ← PostgreSQL 연결 설정
│   │   ├── models.py              ← 테이블 정의 (SQLAlchemy 또는 raw SQL)
│   │   └── migrations/            ← 스키마 마이그레이션
│   ├── configs/
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml             ← 로컬 개발 환경 (DB + Backend + Frontend)
├── .env.example
├── docs/                          ← 프로젝트 문서
│   └── conventions.md             ← 본 파일
└── README.md
```

### 핵심 규칙
- **프론트엔드** (`frontend/`): Next.js App Router 구조. 페이지는 `app/`, 컴포넌트는 `components/`
- **백엔드** (`backend/`): FastAPI. `app.py`는 라우터 마운트만, 비즈니스 로직은 `src/`에 분리
- **DB**: PostgreSQL + pgvector. `backend/db/`에서 관리
- 프론트/백엔드 각각 독립 Dockerfile, `docker-compose.yml`로 통합

---

## **3. 네이밍 컨벤션**

### Frontend (TypeScript/React)
| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 컴포넌트 파일 | `PascalCase.tsx` | `CardResult.tsx`, `UploadZone.tsx` |
| 유틸/훅 파일 | `camelCase.ts` | `useAuth.ts`, `formatDate.ts` |
| 페이지 파일 | Next 규칙 | `page.tsx`, `layout.tsx`, `route.ts` |
| 변수/함수 | `camelCase` | `handleUpload`, `cardData` |
| 타입/인터페이스 | `PascalCase` | `BusinessCard`, `SearchResult` |
| 상수 | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `MAX_FILE_SIZE` |
| CSS 클래스 (Tailwind) | 유틸리티 그대로 | `className="flex items-center gap-2"` |
| CSS Module 클래스 | `camelCase` | `styles.cardHeader`, `styles.isActive` |

### Backend (Python)
| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 모듈/파일 | `snake_case.py` | `ocr_engine.py`, `user_store.py` |
| 클래스 | `PascalCase` | `BusinessCardPipeline`, `MLClassifier` |
| 함수/변수 | `snake_case` | `classify_text_block`, `text_blocks` |
| 상수 | `UPPER_SNAKE_CASE` | `MAX_SIDE`, `FIELD_LABELS` |
| API 엔드포인트 | `snake_case` 또는 `kebab-case` | `/auth/signup`, `/ml/train` |

### Database (PostgreSQL)
| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 테이블 | `snake_case` | `business_cards`, `users` |
| 컬럼 | `snake_case` | `person_name`, `created_at` |
| 인덱스 | `idx_<table>_<column>` | `idx_cards_user_id` |
| 제약 조건 | `<table>_<column>_<type>` | `users_email_unique` |

### 환경변수
| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 프론트 공개 키 | `NEXT_PUBLIC_*` | `NEXT_PUBLIC_API_URL` |
| 서버 전용 키 | 접두사 없음 | `OPENAI_API_KEY`, `DATABASE_URL` |
| DB 관련 | `DB_*` 또는 `DATABASE_*` | `DATABASE_URL`, `DB_HOST` |

---

## **4. CSS 규칙 (Tailwind CSS + CSS Modules)**

### Tailwind CSS (기본)
```tsx
// 대부분의 스타일은 Tailwind 유틸리티 클래스로 처리
export default function Card({ title }: { title: string }) {
  return (
    <div className="rounded-[10px] bg-white p-6 shadow-md">
      <h3 className="text-lg font-semibold text-[#15293D]">{title}</h3>
    </div>
  )
}
```

### CSS Modules (복잡한 애니메이션/로컬 스타일)
```tsx
// 스크롤 애니메이션 등 Tailwind만으로 어려운 경우
import styles from './HeroCards.module.css'

export default function HeroCards() {
  return <div className={styles.stack}>{/* ... */}</div>
}
```

### 디자인 토큰 (`styles/tokens.css`)
```css
:root {
  /* ── MORA 디자인 시스템 ── */
  --color-primary: #15293D;
  --color-bg: #DDE2E6;
  --color-text: #84888D;
  --color-accent: #FF8A3D;
  --color-white: #FFFFFF;

  /* ── 간격 ── */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* ── 폰트 ── */
  --font-default: var(--post-no-bills);    /* Post No Bills Jaffna Medium */
  --font-bold: var(--post-no-bills-sb);    /* SemiBold */
  --font-logo: var(--patua-one);           /* Patua One */
  --font-number: var(--konkhmer);          /* Konkhmer Sleokchher */

  /* ── 버튼 ── */
  --radius-button: 10px;
  --radius-card: 16px;
}
```

### Tailwind Config 확장
```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#15293D',
        background: '#DDE2E6',
        'text-muted': '#84888D',
        accent: '#FF8A3D',
      },
      fontFamily: {
        logo: ['var(--font-logo)'],
        number: ['var(--font-number)'],
      },
      borderRadius: {
        button: '10px',
        card: '16px',
      },
    },
  },
}
export default config
```

### 규칙
- Tailwind 유틸리티 우선, CSS Module은 **애니메이션/복잡한 상태 전환**에만 사용
- 전역 색상/간격은 `styles/tokens.css`에 CSS 변수로 정의 → Tailwind config에서 참조
- 컴포넌트별 CSS Module은 **컴포넌트와 같은 디렉토리에 colocation**
- `!important` 사용 금지 (Tailwind의 `!` prefix도 최소화)

---

## **5. React/Next.js 규칙**

- **서버 컴포넌트 우선**: 기본은 서버 컴포넌트. 브라우저 상호작용 필요 시만 `"use client"` 추가
- **상태/이펙트 최소화**: 클라이언트 컴포넌트는 꼭 필요한 곳에만
- **데이터 패칭**: 서버에서 수행 → props로 전달. 클라이언트 fetch는 최소화
- **폰트 관리**: `app/fonts/index.ts`에서 `next/font/local` 사용, 레이아웃에서 CSS 변수 적용
- **라우트 그룹**: `(marketing)` = 랜딩/소개, `(app)` = 로그인 후 기능 페이지
- **import 경로**: `@/components/*`, `@/lib/*`, `@/app/*` 절대 경로 사용

### 컴포넌트 구조 예시
```tsx
// components/cards/CardResult.tsx
'use client'

import { type BusinessCard } from '@/types'
import styles from './CardResult.module.css'

type Props = {
  card: BusinessCard
}

export default function CardResult({ card }: Props) {
  return (
    <div className="rounded-card bg-white p-6 shadow-md">
      <h2 className="text-xl font-bold text-primary">{card.name}</h2>
      <p className="text-text-muted">{card.company} · {card.position}</p>
    </div>
  )
}
```

---

## **6. TypeScript**

- **엄격 모드 유지** (`strict: true`)
- **명시적 타입**: 공개 API/유틸은 반환 타입 명시 권장
- **공유 타입**: `frontend/types/index.ts`에 도메인 타입 정의

```ts
// types/index.ts
export type BusinessCard = {
  id: string
  name: string
  company: string
  position: string
  phone: string
  email: string
  embedding?: number[]
  createdAt: string
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

---

## **7. API 규칙**

### Frontend → Backend API 호출 (BFF 패턴)
```
브라우저 → Next.js Route Handler (/api/*) → FastAPI Backend (:8000)
```
- 프론트엔드는 **자기 자신의 Route Handler**만 호출
- Route Handler가 백엔드 FastAPI를 내부적으로 호출 (BFF)
- 환경변수 `BACKEND_URL=http://backend:8000` (Docker 내부 통신)

### Backend API 응답 포맷
```python
# 성공
{"success": True, "data": {...}}

# 실패
{"success": False, "error": "NOT_FOUND"}
```

### 상태 코드 매핑

| 상황 | 상태 코드 | 응답 예시 |
| --- | --- | --- |
| 정상 처리 | `200`, `201` | `{ success: true, data: {...} }` |
| 유효성 오류 | `400` | `{ success: false, error: 'BAD_REQUEST' }` |
| 인증 실패 | `401`, `403` | `{ success: false, error: 'UNAUTHORIZED' }` |
| 찾을 수 없음 | `404` | `{ success: false, error: 'NOT_FOUND' }` |
| 서버 오류 | `500` | `{ success: false, error: 'INTERNAL_ERROR' }` |

### Backend 라우터 분리 예시
```python
# backend/app.py — 라우터 마운트만
from fastapi import FastAPI
from routers import ocr, search, auth, ml

app = FastAPI(title="MORA API", version="2.0")
app.include_router(ocr.router, prefix="/api", tags=["OCR"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(ml.router, prefix="/api/ml", tags=["ML"])
```

```python
# backend/routers/ocr.py
from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    ...
```

---

## **8. 데이터베이스 규칙 (PostgreSQL + pgvector)**

### 테이블 설계
```sql
-- 사용자 테이블
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider      VARCHAR(20) NOT NULL DEFAULT 'local',  -- 'local', 'google', 'kakao'
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),                           -- 소셜 로그인은 NULL
    name          VARCHAR(100) NOT NULL,
    picture       TEXT DEFAULT '',
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 명함 테이블 (벡터 포함)
CREATE TABLE business_cards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    image_file      VARCHAR(255),
    name            VARCHAR(100),
    company         VARCHAR(200),
    position        VARCHAR(100),
    phone           VARCHAR(50),
    email           VARCHAR(255),
    raw_ocr_text    TEXT,
    embedding       vector(1536),    -- OpenAI text-embedding-3-small 차원
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 벡터 검색용 인덱스 (IVFFlat)
CREATE INDEX idx_cards_embedding ON business_cards
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- 사용자별 조회 인덱스
CREATE INDEX idx_cards_user_id ON business_cards(user_id);
```

### 벡터 검색 쿼리
```sql
-- 코사인 유사도 기반 상위 5개 검색
SELECT id, name, company, position, phone, email,
       1 - (embedding <=> $1::vector) AS similarity
FROM business_cards
WHERE user_id = $2
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

### 규칙
- 모든 테이블에 `created_at`, `updated_at` 포함
- PK는 `UUID` 사용 (`gen_random_uuid()`)
- 외래키에 `ON DELETE CASCADE` 명시
- pgvector 인덱스는 데이터 1000건 이상일 때 `IVFFlat`, 이전에는 `HNSW` 또는 Flat
- 마이그레이션 스크립트는 `backend/db/migrations/` 에 순번으로 관리

---

## **9. 임베딩 규칙 (OpenAI + pgvector)**

### OpenAI 임베딩 생성
```python
# backend/src/embedding/openai_embedder.py
import openai

EMBED_MODEL = "text-embedding-3-small"  # 1536차원
EMBED_DIMENSIONS = 1536

async def create_embedding(text: str) -> list[float]:
    """텍스트를 OpenAI 임베딩 벡터로 변환."""
    response = await openai.embeddings.create(
        model=EMBED_MODEL,
        input=text,
    )
    return response.data[0].embedding
```

### 명함 텍스트 → 임베딩 변환 규칙
```python
def card_to_text(card: dict) -> str:
    """명함 데이터를 임베딩용 텍스트로 변환."""
    parts = []
    if card.get("name"):    parts.append(f"이름: {card['name']}")
    if card.get("company"): parts.append(f"회사: {card['company']}")
    if card.get("position"):parts.append(f"직책: {card['position']}")
    if card.get("phone"):   parts.append(f"전화: {card['phone']}")
    if card.get("email"):   parts.append(f"이메일: {card['email']}")
    return " | ".join(parts)
```

### 규칙
- 임베딩 모델: `text-embedding-3-small` (1536차원) 고정
- 텍스트 포맷: `"이름: X | 회사: Y | 직책: Z"` 형식 통일
- 검색 쿼리도 동일 모델로 임베딩 → pgvector 코사인 유사도 검색
- `OPENAI_API_KEY`는 `.env` 서버 전용, 절대 프론트엔드 노출 금지

---

## **10. Docker 규칙**

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: mora
      POSTGRES_USER: mora
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://mora:${DB_PASSWORD}@db:5432/mora
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      BACKEND_URL: http://backend:8000
    depends_on:
      - backend

volumes:
  pgdata:
```

### 규칙
- 로컬 개발: `docker compose up` 한 명령으로 전체 환경 구동
- DB 데이터는 Docker volume으로 영속화
- 환경변수는 `.env` 파일에서 관리 (`.env.example` 제공)
- `pgvector/pgvector:pg16` 이미지 사용 (pgvector 사전 설치됨)

---

## **11. 커밋 메시지 (Conventional Commits)**

- 형식: `<type>(<scope>): <subject>`
- **영문 소문자**, 명령형 현재 시제

| type | 설명 | 예시 |
| --- | --- | --- |
| `feat` | 새 기능 추가 | `feat(ocr): add image preprocessing` |
| `fix` | 버그 수정 | `fix(search): handle empty query` |
| `docs` | 문서 추가/수정 | `docs: add conventions.md` |
| `style` | UI/코드 포맷 변경 | `style(landing): adjust card spacing` |
| `refactor` | 구조 개선 (동작 동일) | `refactor(api): split routers` |
| `test` | 테스트 코드 | `test(classifier): add edge cases` |
| `ci` | 빌드/배포 설정 | `ci: add docker compose` |
| `chore` | 기타 (패키지 등) | `chore: update dependencies` |

### scope 예시
- Frontend: `landing`, `upload`, `search`, `auth`, `ui`
- Backend: `ocr`, `classifier`, `embedding`, `search`, `auth`, `ml`
- Infra: `docker`, `db`, `ci`

---

## **12. 브랜치 전략**

| 브랜치 | 용도 | 예시 |
| --- | --- | --- |
| `main` | 프로덕션 릴리즈 | - |
| `develop` | 개발 통합 | - |
| `feat/<topic>` | 기능 개발 | `feat/pgvector-search` |
| `init/<topic>` | 초기 설정 | `init/nextjs-setup` |
| `fix/<desc>` | 버그 수정 | `fix/ocr-timeout` |
| `hotfix/<desc>` | 긴급 수정 | `hotfix/auth-crash` |

### 규칙
- 기능 브랜치는 PR 후 **squash and merge** 기본
- 리뷰: 최소 1인 이상 승인
- `main` 직접 push 금지

---

## **13. PR 규칙**

### 체크리스트
- [ ] 커밋 메시지 컨벤션에 맞게 작성했습니다
- [ ] 변경 사항에 대한 테스트를 했습니다
- [ ] 코드 품질을 위한 자체 리뷰를 진행했습니다
- [ ] 관련 문서를 업데이트했습니다
- [ ] 빌드/타입 에러 없음
- [ ] (FE) ESLint/Prettier 적용
- [ ] (BE) pytest 통과
- [ ] 변경사항이 다른 기능에 부작용을 일으키지 않는지 확인했습니다

---

## **14. 코드 스타일**

### Frontend (ESLint/Prettier)
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```
- 린트: `pnpm lint`
- 포맷: `pnpm format`
- 타입 체크: `pnpm typecheck`

### Backend (Python)
- 포매터: `black` (line-length=100)
- 린터: `ruff`
- 타입 체크: `mypy` (선택)
- 테스트: `pytest`

---

## **15. 향후 추가 예정**

- 테스트 전략 (Jest/Playwright + pytest 커버리지 기준)
- Supabase 또는 자체 PostgreSQL 운영 규칙
- 접근성 체크리스트 (ARIA, 키보드 내비게이션)
- 배포 파이프라인 (Preview → Staging → Production)
- 모니터링/로깅 규칙

---

본 컨벤션 문서는 `docs/conventions.md`에서 유지·관리합니다.
변경 시 PR에 변경 요약을 포함해 주세요.
