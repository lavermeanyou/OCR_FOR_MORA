"""
Business Card OCR + RAG Search API
"""
import sys
import os
import json
import tempfile
import shutil
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, Query, Request
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ── Path Setup ──
# backend/ 디렉토리가 기준
BACKEND_DIR = Path(__file__).resolve().parent
REPO_ROOT = BACKEND_DIR.parent

# backend/ 를 sys.path 에 추가 → from src.xxx 가 동작
sys.path.insert(0, str(BACKEND_DIR))

from src.pipeline.extract_pipeline import BusinessCardPipeline
from src.skills.parsing_skill import ParsingSkill
from src.skills.embedding_skill import EmbeddingSkill
from src.skills.retrieval_skill import RetrievalSkill
from src.vectorstore.faiss_store import FaissVectorStore
from src.auth import oauth_google, oauth_kakao
from src.auth.jwt_handler import create_token, verify_token
from src.auth.user_store import find_or_create_user
from src.auth.config import GOOGLE_CLIENT_ID, KAKAO_CLIENT_ID
from src.classifier.ml.ml_classifier import MLClassifier
from src.classifier.ml.trainer import train as ml_train

# ── App Setup ──
app = FastAPI(title="Business Card OCR + RAG API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Singleton Services ──
pipeline = BusinessCardPipeline(lang="korean")
parsing_skill = ParsingSkill()
embedding_skill = EmbeddingSkill()
vector_store = FaissVectorStore(store_dir=str(REPO_ROOT / "data" / "vectorstore"))
retrieval_skill = RetrievalSkill(store=vector_store, embedding_skill=embedding_skill)

# ── Change Log ──
CHANGELOG_PATH = REPO_ROOT / "data" / "changelog.json"


def log_change(file: str, reason: str, impact: str):
    """변경 이력 기록."""
    CHANGELOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    entries = []
    if CHANGELOG_PATH.exists():
        with open(CHANGELOG_PATH, "r", encoding="utf-8") as f:
            entries = json.load(f)
    entries.append({
        "timestamp": datetime.now().isoformat(),
        "file": file,
        "reason": reason,
        "impact": impact,
    })
    with open(CHANGELOG_PATH, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)


# ── Mount frontend (../frontend) ──
FRONTEND_DIR = REPO_ROOT / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
    app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")
    if (FRONTEND_DIR / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")


# ── Root: Serve frontend ──
@app.get("/", response_class=HTMLResponse)
def root():
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return HTMLResponse("<h1>MORA - Business Card OCR API</h1><p>Frontend not found.</p>")


# ══════════════════════════════════════
# AUTH ENDPOINTS
# ══════════════════════════════════════

@app.get("/auth/config")
def auth_config():
    """프론트엔드에 OAuth 설정 전달 (secret 제외)."""
    return {
        "google_enabled": bool(GOOGLE_CLIENT_ID),
        "kakao_enabled": bool(KAKAO_CLIENT_ID),
    }


# ── Google OAuth2 ──
@app.get("/auth/google/login")
def google_login():
    """Google 로그인 페이지로 리다이렉트."""
    url = oauth_google.get_login_url(state="google")
    return RedirectResponse(url)


@app.get("/auth/google/callback")
async def google_callback(code: str = "", error: str = ""):
    """Google OAuth2 콜백 처리."""
    if error or not code:
        return RedirectResponse("/?auth_error=google_denied")

    try:
        token_data = await oauth_google.exchange_code(code)
        access_token = token_data["access_token"]
        user_info = await oauth_google.get_user_info(access_token)

        user = find_or_create_user(
            provider="google",
            provider_id=user_info.get("id", ""),
            email=user_info.get("email", ""),
            name=user_info.get("name", ""),
            picture=user_info.get("picture", ""),
        )

        jwt_token = create_token({
            "user_id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "picture": user["picture"],
            "provider": "google",
        })

        return RedirectResponse(f"/?token={jwt_token}")
    except Exception as e:
        return RedirectResponse(f"/?auth_error={str(e)[:100]}")


# ── Kakao OAuth2 ──
@app.get("/auth/kakao/login")
def kakao_login():
    """Kakao 로그인 페이지로 리다이렉트."""
    url = oauth_kakao.get_login_url(state="kakao")
    return RedirectResponse(url)


@app.get("/auth/kakao/callback")
async def kakao_callback(code: str = "", error: str = ""):
    """Kakao OAuth2 콜백 처리."""
    if error or not code:
        return RedirectResponse("/?auth_error=kakao_denied")

    try:
        token_data = await oauth_kakao.exchange_code(code)
        access_token = token_data["access_token"]
        user_info = await oauth_kakao.get_user_info(access_token)

        user = find_or_create_user(
            provider="kakao",
            provider_id=user_info.get("id", ""),
            email=user_info.get("email", ""),
            name=user_info.get("name", ""),
            picture=user_info.get("picture", ""),
        )

        jwt_token = create_token({
            "user_id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "picture": user["picture"],
            "provider": "kakao",
        })

        return RedirectResponse(f"/?token={jwt_token}")
    except Exception as e:
        return RedirectResponse(f"/?auth_error={str(e)[:100]}")


# ── Token 검증 ──
@app.get("/auth/me")
def auth_me(request: Request):
    """현재 로그인된 사용자 정보 반환."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"error": "토큰이 없습니다."})

    token = auth_header.split(" ", 1)[1]
    payload = verify_token(token)
    if not payload:
        return JSONResponse(status_code=401, content={"error": "유효하지 않은 토큰입니다."})

    return {
        "user_id": payload.get("user_id"),
        "email": payload.get("email"),
        "name": payload.get("name"),
        "picture": payload.get("picture"),
        "provider": payload.get("provider"),
    }


# ── Health ──
@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": "2.0",
        "vector_count": vector_store.count(),
    }


# ── POST /ocr  (기존 OCR 파이프라인 재사용) ──
@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    """이미지 업로드 → OCR + 분류 + 구조화 결과 반환."""
    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = pipeline.run(tmp_path)
        log_change(file.filename, "OCR 처리", "텍스트 추출 완료")
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        os.unlink(tmp_path)


# ── POST /parse ──
@app.post("/parse")
async def parse(file: UploadFile = File(...)):
    """이미지 업로드 → OCR → 파싱된 명함 데이터 반환."""
    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        ocr_result = pipeline.ocr_engine.extract(tmp_path)
        text_blocks = ocr_result["text_blocks"]
        parsed_result = parsing_skill.execute(text_blocks)

        log_change(file.filename, "명함 파싱", f"필드 {len(parsed_result['parsed'])}개 추출")

        return JSONResponse(content={
            "image_file": file.filename,
            "ocr_blocks": len(text_blocks),
            **parsed_result,
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        os.unlink(tmp_path)


# ── POST /embed ──
@app.post("/embed")
async def embed(file: UploadFile = File(...)):
    """이미지 업로드 → OCR → 파싱 → 임베딩 → 벡터 저장."""
    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        ocr_result = pipeline.ocr_engine.extract(tmp_path)
        text_blocks = ocr_result["text_blocks"]
        parsed_result = parsing_skill.execute(text_blocks)
        parsed = parsed_result["parsed"]

        if not parsed:
            return JSONResponse(status_code=400, content={"error": "파싱된 데이터가 없습니다."})

        embed_result = embedding_skill.execute(parsed)

        if not embed_result["embedding"]:
            return JSONResponse(status_code=400, content={"error": "임베딩 생성 실패."})

        vector_store.add(
            doc_id=embed_result["id"],
            embedding=embed_result["embedding"],
            text=embed_result["text"],
            metadata=embed_result["metadata"],
        )

        log_change(file.filename, "임베딩 저장", f"벡터 ID: {embed_result['id']}")

        return JSONResponse(content={
            "id": embed_result["id"],
            "parsed": parsed,
            "text": embed_result["text"],
            "stored": True,
            "total_vectors": vector_store.count(),
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        os.unlink(tmp_path)


# ── GET /search ──
@app.get("/search")
async def search(q: str = Query(..., description="검색 쿼리"), top_k: int = Query(5, ge=1, le=50)):
    """자연어 쿼리로 유사 명함 벡터 검색."""
    try:
        results = retrieval_skill.execute(q, top_k=top_k)
        log_change("search", f"검색: {q}", f"결과 {len(results)}건")
        return JSONResponse(content={
            "query": q,
            "count": len(results),
            "results": results,
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ── POST /process  (전체 파이프라인: OCR → Parse → Embed → Store) ──
@app.post("/process")
async def process(file: UploadFile = File(...)):
    """전체 파이프라인: 이미지 → OCR → 파싱 → 임베딩 → 저장."""
    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Step 1: OCR
        ocr_result = pipeline.run(tmp_path)

        # Step 2: Parse
        text_blocks = ocr_result.get("raw_blocks", [])
        parsed_result = parsing_skill.execute(text_blocks)
        parsed = parsed_result["parsed"]

        # Step 3: Embed + Store
        stored = False
        embed_id = None
        total_vectors = vector_store.count()

        if parsed:
            embed_result = embedding_skill.execute(parsed)
            if embed_result["embedding"]:
                vector_store.add(
                    doc_id=embed_result["id"],
                    embedding=embed_result["embedding"],
                    text=embed_result["text"],
                    metadata=embed_result["metadata"],
                )
                stored = True
                embed_id = embed_result["id"]
                total_vectors = vector_store.count()

        log_change(file.filename, "전체 처리", f"파싱 {len(parsed)}필드, 저장={stored}")

        return JSONResponse(content={
            **ocr_result,
            "parsed": parsed,
            "stored": stored,
            "embed_id": embed_id,
            "total_vectors": total_vectors,
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        os.unlink(tmp_path)


# ── GET /changelog ──
@app.get("/changelog")
def get_changelog():
    """변경 이력 조회."""
    if CHANGELOG_PATH.exists():
        with open(CHANGELOG_PATH, "r", encoding="utf-8") as f:
            return JSONResponse(content=json.load(f))
    return JSONResponse(content=[])


# ── GET /stats ──
@app.get("/stats")
def stats():
    """시스템 통계."""
    changelog_count = 0
    if CHANGELOG_PATH.exists():
        with open(CHANGELOG_PATH, encoding="utf-8") as f:
            changelog_count = len(json.load(f))
    return {
        "vector_count": vector_store.count(),
        "changelog_entries": changelog_count,
    }


# ══════════════════════════════════════
# ML CLASSIFIER ENDPOINTS
# ══════════════════════════════════════

# ML 분류기 (학습된 모델이 있으면 로드)
_ml_classifier = None


def _get_ml_classifier():
    global _ml_classifier
    if _ml_classifier is None:
        try:
            _ml_classifier = MLClassifier()
        except FileNotFoundError:
            return None
    return _ml_classifier


@app.post("/ml/train")
async def ml_train_endpoint(
    samples_per_field: int = Query(5000, ge=100, le=50000),
    rounds: int = Query(2, ge=1, le=5),
):
    """ML 분류기 학습 실행."""
    try:
        result = ml_train(
            samples_per_field=samples_per_field,
            reinforcement_rounds=rounds,
            verbose=False,
        )
        # 학습 후 모델 재로드
        global _ml_classifier
        _ml_classifier = MLClassifier()

        log_change("ml_model", "ML 분류기 학습", f"정확도: {result['accuracy']:.4f}")

        return JSONResponse(content={
            "accuracy": result["accuracy"],
            "report": result["report"],
            "model_path": result["model_path"],
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/ml/status")
def ml_status():
    """ML 분류기 상태 확인."""
    clf = _get_ml_classifier()
    if clf is None:
        return {"trained": False, "message": "모델이 학습되지 않았습니다."}
    return {
        "trained": True,
        "accuracy": clf.accuracy,
        "n_features": clf.meta.get("n_features"),
        "total_samples": clf.meta.get("total_samples"),
        "reinforcement_rounds": clf.meta.get("reinforcement_rounds"),
    }


@app.post("/ml/classify")
async def ml_classify(file: UploadFile = File(...)):
    """ML 분류기로 명함 이미지 처리."""
    clf = _get_ml_classifier()
    if clf is None:
        return JSONResponse(status_code=400, content={"error": "모델이 학습되지 않았습니다. POST /ml/train 으로 학습하세요."})

    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # OCR
        ocr_result = pipeline.ocr_engine.extract(tmp_path)
        text_blocks = ocr_result["text_blocks"]

        # ML 분류
        classified = clf.classify_all_blocks(text_blocks)

        # 구조화
        best = {}
        for block in classified:
            field = block["field"]
            if field == "unknown":
                continue
            if field not in best or block["confidence"] > best[field]["confidence"]:
                best[field] = block

        field_map = {
            "person_name": "name", "company_name": "company",
            "job_title": "position", "phone_number": "phone",
            "fax_number": "fax", "email": "email",
        }
        parsed = {field_map.get(k, k): v["text"] for k, v in best.items()}

        log_change(file.filename, "ML 분류", f"필드 {len(parsed)}개 추출")

        return JSONResponse(content={
            "image_file": file.filename,
            "classifier": "ml",
            "model_accuracy": clf.accuracy,
            "classified_blocks": classified,
            "parsed": parsed,
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
