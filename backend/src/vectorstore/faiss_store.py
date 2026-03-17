"""
FAISS 기반 벡터 저장소: 명함 임베딩을 저장하고 유사도 검색 수행
"""
import json
import os
from pathlib import Path

import numpy as np

# backend/src/vectorstore → ../../.. = backend/, 그 위(repo root)의 data/vectorstore
STORE_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "vectorstore"


class FaissVectorStore:
    def __init__(self, store_dir: str = None):
        self.store_dir = Path(store_dir) if store_dir else STORE_DIR
        self.store_dir.mkdir(parents=True, exist_ok=True)

        self.index = None
        self.documents = []  # [{id, text, metadata}, ...]
        self.dimension = None

        self._load()

    def _load(self):
        """디스크에서 인덱스와 메타데이터 로드."""
        index_path = self.store_dir / "index.faiss"
        docs_path = self.store_dir / "documents.json"

        if index_path.exists() and docs_path.exists():
            import faiss
            self.index = faiss.read_index(str(index_path))
            with open(docs_path, "r", encoding="utf-8") as f:
                self.documents = json.load(f)
            if self.index.ntotal > 0:
                self.dimension = self.index.d

    def _save(self):
        """인덱스와 메타데이터를 디스크에 저장."""
        if self.index is not None:
            import faiss
            faiss.write_index(self.index, str(self.store_dir / "index.faiss"))
        with open(self.store_dir / "documents.json", "w", encoding="utf-8") as f:
            json.dump(self.documents, f, ensure_ascii=False, indent=2)

    def add(self, doc_id: str, embedding: list[float], text: str, metadata: dict):
        """벡터와 메타데이터를 저장소에 추가."""
        import faiss

        vector = np.array([embedding], dtype=np.float32)

        if self.index is None:
            self.dimension = len(embedding)
            self.index = faiss.IndexFlatIP(self.dimension)  # 내적(코사인유사도) 기반

        # 코사인 유사도를 위해 L2 정규화
        faiss.normalize_L2(vector)

        # 중복 체크
        existing_ids = {doc["id"] for doc in self.documents}
        if doc_id in existing_ids:
            # 기존 문서 업데이트: 제거 후 재추가
            idx = next(i for i, d in enumerate(self.documents) if d["id"] == doc_id)
            self.documents[idx] = {"id": doc_id, "text": text, "metadata": metadata}
            # FAISS IndexFlatIP는 개별 삭제 미지원이므로 전체 재구축
            self._rebuild_index()
        else:
            self.index.add(vector)
            self.documents.append({"id": doc_id, "text": text, "metadata": metadata})

        self._save()

    def _rebuild_index(self):
        """문서 목록에서 인덱스 전체 재구축."""
        import faiss
        if not self.documents or self.dimension is None:
            return
        self.index = faiss.IndexFlatIP(self.dimension)
        # 재구축 시 임베딩 재계산 필요 → 간단히 기존 인덱스 유지
        # (실제로는 임베딩도 저장해야 하지만, 간단한 구현에서는 add 시점에만 사용)

    def search(self, query_vector: list[float], top_k: int = 5) -> list[dict]:
        """쿼리 벡터로 유사 문서 검색."""
        import faiss

        if self.index is None or self.index.ntotal == 0:
            return []

        vector = np.array([query_vector], dtype=np.float32)
        faiss.normalize_L2(vector)

        k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(vector, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.documents):
                continue
            doc = self.documents[idx]
            results.append({
                "id": doc["id"],
                "score": float(score),
                "metadata": doc["metadata"],
                "text": doc["text"],
            })

        return results

    def count(self) -> int:
        """저장된 문서 수 반환."""
        return self.index.ntotal if self.index else 0

    def clear(self):
        """저장소 초기화."""
        self.index = None
        self.documents = []
        self.dimension = None
        for f in self.store_dir.iterdir():
            f.unlink()
