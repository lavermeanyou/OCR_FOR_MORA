"""
API 엔드포인트 테스트
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from app import app
    return TestClient(app)


def test_health(client):
    """Health 엔드포인트 테스트."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "vector_count" in data


def test_stats(client):
    """Stats 엔드포인트 테스트."""
    res = client.get("/stats")
    assert res.status_code == 200
    data = res.json()
    assert "vector_count" in data


def test_changelog_empty(client):
    """Changelog 엔드포인트 테스트."""
    res = client.get("/changelog")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_search_no_results(client):
    """검색 - 빈 결과."""
    res = client.get("/search?q=test")
    assert res.status_code == 200
    data = res.json()
    assert data["query"] == "test"
    assert "results" in data


def test_search_missing_query(client):
    """검색 - 쿼리 누락."""
    res = client.get("/search")
    assert res.status_code == 422
