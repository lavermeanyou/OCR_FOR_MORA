"""
ParsingSkill: OCR 텍스트 블록을 명함 필드로 분류/파싱
"""
from src.classifier.rule_based import classify_all_blocks
from configs.schema import FIELD_LABELS, UNKNOWN_LABEL


class ParsingSkill:
    def execute(self, text_blocks: list[dict]) -> dict:
        """
        텍스트 블록 목록을 분류하여 구조화된 명함 데이터 반환.

        Returns:
            {
                "classified_blocks": [...],
                "parsed": {
                    "name": "...",
                    "company": "...",
                    "position": "...",
                    "phone": "...",
                    "email": "..."
                }
            }
        """
        if not text_blocks:
            return {"classified_blocks": [], "parsed": {}}

        classified = classify_all_blocks(text_blocks)

        # 필드별 최고 confidence 값 선택
        best = {}
        for block in classified:
            field = block["field"]
            if field == UNKNOWN_LABEL:
                continue
            if field not in best or block["confidence"] > best[field]["confidence"]:
                best[field] = block

        # 통일된 필드명으로 매핑
        field_map = {
            "person_name": "name",
            "company_name": "company",
            "job_title": "position",
            "phone_number": "phone",
            "fax_number": "fax",
            "email": "email",
        }

        parsed = {}
        for internal_key, data in best.items():
            output_key = field_map.get(internal_key, internal_key)
            parsed[output_key] = data["text"]

        return {
            "classified_blocks": classified,
            "parsed": parsed,
        }
