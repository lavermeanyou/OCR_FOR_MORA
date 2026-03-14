import sys
import os
import tempfile
import shutil
from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse

# Add project root to path so we can import the pipeline
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.pipeline.extract_pipeline import BusinessCardPipeline

app = FastAPI(title="Business Card OCR API")
pipeline = BusinessCardPipeline(lang="korean")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = pipeline.run(tmp_path)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        os.unlink(tmp_path)
