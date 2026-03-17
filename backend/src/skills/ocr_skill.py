"""
OCRSkill: 이미지에서 텍스트 블록 추출
"""
from src.ocr.paddle_ocr_engine import PaddleOCREngine


class OCRSkill:
    def __init__(self, lang="korean"):
        self.engine = PaddleOCREngine(lang=lang)

    def execute(self, image_path: str) -> dict:
        """이미지에서 OCR 수행하여 텍스트 블록 반환."""
        return self.engine.extract(image_path)
