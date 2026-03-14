"""
엔드투엔드 파이프라인: 이미지 입력 → OCR → 필드 분류 → 구조화된 결과 출력
"""
import json
from pathlib import Path

from src.ocr.paddle_ocr_engine import PaddleOCREngine
from src.classifier.rule_based import classify_all_blocks
from configs.schema import FIELD_LABELS, UNKNOWN_LABEL


class BusinessCardPipeline:
    def __init__(self, lang="korean"):
        self.ocr_engine = PaddleOCREngine(lang=lang)

    def run(self, image_path: str) -> dict:
        """
        명함 이미지 → 구조화된 연락처 정보 추출.

        Args:
            image_path: 명함 이미지 경로

        Returns:
            {
                "image_file": "card_001.jpg",
                "raw_blocks": [...],          # OCR 원본 결과
                "classified_blocks": [...],   # 분류된 블록
                "result": {                   # 최종 구조화 결과
                    "company_name": {"text": "...", "confidence": 0.97},
                    "person_name": {"text": "...", "confidence": 0.95},
                    ...
                },
                "result_korean": {            # 사용자 표시용 한국어 결과
                    "회사이름": "...",
                    "이름": "...",
                    ...
                }
            }
        """
        # Step 1: OCR 수행
        ocr_result = self.ocr_engine.extract(image_path)
        text_blocks = ocr_result["text_blocks"]

        if not text_blocks:
            return {
                "image_file": ocr_result["image_file"],
                "raw_blocks": [],
                "classified_blocks": [],
                "result": {},
                "result_korean": {},
                "error": "텍스트를 감지하지 못했습니다.",
            }

        # Step 2: 필드 분류
        classified = classify_all_blocks(text_blocks)

        # Step 3: 구조화된 결과 생성
        result = {}
        for block in classified:
            field = block["field"]
            if field == UNKNOWN_LABEL:
                continue
            # 같은 필드가 여러 개면 confidence가 높은 것 우선
            if field not in result or block["confidence"] > result[field]["confidence"]:
                result[field] = {
                    "text": block["text"],
                    "confidence": block["confidence"],
                }

        # Step 4: 한국어 사용자 표시용 변환
        result_korean = {}
        for field_key, data in result.items():
            korean_label = FIELD_LABELS.get(field_key, field_key)
            result_korean[korean_label] = data["text"]

        return {
            "image_file": ocr_result["image_file"],
            "raw_blocks": ocr_result["text_blocks"],
            "classified_blocks": classified,
            "result": result,
            "result_korean": result_korean,
        }

    def run_and_save(self, image_path: str, output_dir: str) -> dict:
        """파이프라인 실행 후 결과를 JSON 파일로 저장."""
        result = self.run(image_path)
        output_path = Path(output_dir) / f"{Path(image_path).stem}_result.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        return result

    def print_result(self, result: dict):
        """사용자에게 보여줄 한국어 결과 출력."""
        print("=" * 40)
        print("  명함 인식 결과")
        print("=" * 40)

        if "error" in result:
            print(f"  오류: {result['error']}")
            return

        korean_result = result.get("result_korean", {})
        if not korean_result:
            print("  인식된 정보가 없습니다.")
            return

        for label, value in korean_result.items():
            print(f"  {label}: {value}")

        print("=" * 40)


# --- CLI 실행용 ---
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("사용법: python -m src.pipeline.extract_pipeline <이미지 경로>")
        sys.exit(1)

    image_path = sys.argv[1]
    output_dir = "data/ocr_outputs"

    pipeline = BusinessCardPipeline()
    result = pipeline.run_and_save(image_path, output_dir)
    pipeline.print_result(result)
