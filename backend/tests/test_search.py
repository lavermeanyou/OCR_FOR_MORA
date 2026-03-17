"""
벡터 검색 테스트 (EmbeddingSkill + FaissVectorStore)
"""
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest


@pytest.fixture
def embedding_skill():
    from src.skills.embedding_skill import EmbeddingSkill
    return EmbeddingSkill()


@pytest.fixture
def vector_store():
    from src.vectorstore.faiss_store import FaissVectorStore
    with tempfile.TemporaryDirectory() as tmpdir:
        store = FaissVectorStore(store_dir=tmpdir)
        yield store


def test_embedding_generates_vector(embedding_skill):
    """임베딩 생성 테스트."""
    parsed = {"name": "김민수", "company": "모라테크", "position": "개발자"}
    result = embedding_skill.execute(parsed)

    assert result["id"]
    assert result["text"]
    assert len(result["embedding"]) > 0
    assert result["metadata"] == parsed


def test_embedding_empty_input(embedding_skill):
    """빈 입력 임베딩."""
    result = embedding_skill.execute({})
    assert result["embedding"] == []


def test_embedding_query(embedding_skill):
    """쿼리 임베딩."""
    vec = embedding_skill.encode_query("개발자 김민수")
    assert len(vec) > 0


def test_store_add_and_search(embedding_skill, vector_store):
    """저장 + 검색 통합 테스트."""
    # 명함 데이터 저장
    cards = [
        {"name": "김민수", "company": "모라테크", "position": "개발자", "email": "minsu@mora.kr"},
        {"name": "이지은", "company": "디자인랩", "position": "디자이너", "email": "jieun@design.co"},
        {"name": "박준호", "company": "클라우드넷", "position": "CTO", "phone": "010-1111-2222"},
    ]

    for card in cards:
        embed_result = embedding_skill.execute(card)
        vector_store.add(
            doc_id=embed_result["id"],
            embedding=embed_result["embedding"],
            text=embed_result["text"],
            metadata=embed_result["metadata"],
        )

    assert vector_store.count() == 3

    # 검색
    query_vec = embedding_skill.encode_query("개발자")
    results = vector_store.search(query_vec, top_k=2)

    assert len(results) == 2
    assert results[0]["score"] > 0  # 유사도 점수 존재
    assert "metadata" in results[0]


def test_store_empty_search(vector_store):
    """빈 저장소 검색."""
    results = vector_store.search([0.1] * 384, top_k=5)
    assert results == []
