"""
RetrievalSkill: 벡터 저장소에서 유사 명함 검색
"""
from src.vectorstore.faiss_store import FaissVectorStore
from src.skills.embedding_skill import EmbeddingSkill


class RetrievalSkill:
    def __init__(self, store: FaissVectorStore = None, embedding_skill: EmbeddingSkill = None):
        self.store = store or FaissVectorStore()
        self.embedding_skill = embedding_skill or EmbeddingSkill()

    def execute(self, query: str, top_k: int = 5) -> list[dict]:
        """
        자연어 쿼리로 유사 명함 검색.

        Returns:
            [
                {"id": "...", "score": 0.95, "metadata": {...}},
                ...
            ]
        """
        query_vector = self.embedding_skill.encode_query(query)
        results = self.store.search(query_vector, top_k=top_k)
        return results
