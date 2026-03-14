"""
PaddleOCR 래퍼: 이미지에서 텍스트 블록을 추출하여 표준 포맷으로 반환
"""
import json
import tempfile
from pathlib import Path

from PIL import Image
from paddleocr import PaddleOCR

# 이미지 긴 변 최대 크기 (이보다 크면 리사이즈)
MAX_SIDE = 1280


class PaddleOCREngine:
    def __init__(self, lang="korean"):
        self.ocr = PaddleOCR(
            lang=lang,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
        )

    def _preprocess_image(self, image_path: str) -> str:
        """
        이미지가 너무 크면 리사이즈.
        PaddleOCR 3.x는 고해상도 이미지에서 텍스트 검출 실패하는 문제가 있음.
        """
        img = Image.open(image_path)
        max_dim = max(img.size)

        if max_dim <= MAX_SIDE:
            return image_path

        ratio = MAX_SIDE / max_dim
        new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        img_resized = img.resize(new_size, Image.LANCZOS)

        # 임시 파일로 저장
        tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        img_resized.save(tmp.name, quality=95)
        return tmp.name

    def extract(self, image_path: str) -> dict:
        """
        이미지에서 OCR 수행 후 표준 JSON 구조로 반환.
        PaddleOCR 3.x 결과 구조 대응
        """
        processed_path = self._preprocess_image(image_path)
        results = self.ocr.predict(processed_path)

        text_blocks = []

        for page_idx, res in enumerate(results):
            # PaddleOCR 3.x 공식 문서 기준: Result 객체는 json 속성 제공
            data = res.json if hasattr(res, "json") else res

            # {"res": {...}} 형태면 안쪽으로 한 번 더 들어감
            if isinstance(data, dict) and "res" in data:
                data = data["res"]

            rec_texts = data.get("rec_texts", []) if isinstance(data, dict) else []
            rec_scores = data.get("rec_scores", []) if isinstance(data, dict) else []
            rec_polys = data.get("rec_polys", []) if isinstance(data, dict) else []

            for idx, text in enumerate(rec_texts):
                confidence = float(rec_scores[idx]) if idx < len(rec_scores) else 0.0
                bbox = rec_polys[idx] if idx < len(rec_polys) else []

                # numpy array 방지
                if hasattr(bbox, "tolist"):
                    bbox = bbox.tolist()

                text_blocks.append({
                    "text": text,
                    "confidence": round(confidence, 4),
                    "bbox": bbox,
                    "block_index": len(text_blocks),
                })

        return {
            "image_file": Path(image_path).name,
            "ocr_engine": "PaddleOCR",
            "text_blocks": text_blocks,
        }

    def extract_and_save(self, image_path: str, output_dir: str) -> dict:
        """OCR 수행 후 결과를 JSON 파일로 저장."""
        result = self.extract(image_path)
        output_path = Path(output_dir) / f"{Path(image_path).stem}_ocr.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        return result
