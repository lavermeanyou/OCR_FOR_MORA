"""
EmbeddingSkill: 명함 데이터를 벡터 임베딩으로 변환
"""
import hashlib
import json


class EmbeddingSkill:
    def __init__(self):
        self._model = None

    def _get_model(self):
        """Lazy load sentence-transformers model."""
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
        return self._model

    def _card_to_text(self, parsed: dict) -> str:
        """명함 데이터를 임베딩용 텍스트로 변환."""
        parts = []
        if parsed.get("name"):
            parts.append(f"이름: {parsed['name']}")
        if parsed.get("company"):
            parts.append(f"회사: {parsed['company']}")
        if parsed.get("position"):
            parts.append(f"직책: {parsed['position']}")
        if parsed.get("phone"):
            parts.append(f"전화: {parsed['phone']}")
        if parsed.get("email"):
            parts.append(f"이메일: {parsed['email']}")
        return " | ".join(parts) if parts else ""

    def _generate_id(self, parsed: dict) -> str:
        """명함 데이터에서 고유 ID 생성."""
        content = json.dumps(parsed, sort_keys=True, ensure_ascii=False)
        return hashlib.md5(content.encode()).hexdigest()

    def execute(self, parsed: dict) -> dict:
        """
        파싱된 명함 데이터를 벡터 임베딩으로 변환.

        Returns:
            {
                "id": "md5hash",
                "text": "이름: 홍길동 | 회사: ...",
                "embedding": [0.1, 0.2, ...],
                "metadata": { ... parsed data ... }
            }
        """
        text = self._card_to_text(parsed)
        if not text:
            return {"id": "", "text": "", "embedding": [], "metadata": parsed}

        model = self._get_model()
        embedding = model.encode(text).tolist()

        return {
            "id": self._generate_id(parsed),
            "text": text,
            "embedding": embedding,
            "metadata": parsed,
        }

    def encode_query(self, query: str) -> list[float]:
        """검색 쿼리를 벡터로 변환."""
        model = self._get_model()
        return model.encode(query).tolist()
