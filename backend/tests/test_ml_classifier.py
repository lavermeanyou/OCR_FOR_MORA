"""
ML 분류기 테스트
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
import numpy as np


def test_feature_extractor_email():
    """이메일 특성 추출."""
    from src.classifier.ml.feature_extractor import extract_features
    f = extract_features("test@gmail.com")
    assert isinstance(f, np.ndarray)
    assert f.shape == (53,)
    assert f[13] == 1.0  # has_email


def test_feature_extractor_phone():
    """전화번호 특성 추출."""
    from src.classifier.ml.feature_extractor import extract_features
    f = extract_features("010-1234-5678")
    assert f[14] == 1.0  # has_mobile


def test_feature_extractor_empty():
    """빈 입력."""
    from src.classifier.ml.feature_extractor import extract_features
    f = extract_features("")
    assert np.all(f == 0)


def test_feature_extractor_korean_name():
    """한국 이름 특성."""
    from src.classifier.ml.feature_extractor import extract_features
    f = extract_features("김민수")
    assert f[19] == 1.0  # all_korean
    assert f[51] == 1.0  # is_short_korean


def test_data_generator():
    """데이터 생성기."""
    from src.classifier.ml.data_generator import generate_dataset
    data = generate_dataset(samples_per_field=10)
    assert len(data) == 70  # 7 fields x 10
    texts, labels = zip(*data)
    assert "email" in labels
    assert "phone_number" in labels


def test_ml_classifier_inference():
    """ML 분류기 추론 (학습된 모델 필요)."""
    from src.classifier.ml.ml_classifier import MLClassifier
    try:
        clf = MLClassifier()
    except FileNotFoundError:
        pytest.skip("학습된 모델 없음")

    # 이메일
    field = clf.classify_text_block("hello@example.com")
    assert field == "email"

    # 전화번호
    field = clf.classify_text_block("010-9876-5432")
    assert field == "phone_number"

    # 이름
    field = clf.classify_text_block("김민수")
    assert field == "person_name"

    # confidence 포함
    field, conf = clf.classify_with_confidence("test@naver.com")
    assert field == "email"
    assert conf > 0.8


def test_ml_classifier_all_blocks():
    """ML 전체 블록 분류."""
    from src.classifier.ml.ml_classifier import MLClassifier
    try:
        clf = MLClassifier()
    except FileNotFoundError:
        pytest.skip("학습된 모델 없음")

    blocks = [
        {"text": "minsu@mora.co.kr", "confidence": 0.99, "bbox": [], "block_index": 0},
        {"text": "010-1234-5678", "confidence": 0.98, "bbox": [], "block_index": 1},
        {"text": "김민수", "confidence": 0.95, "bbox": [], "block_index": 2},
    ]

    results = clf.classify_all_blocks(blocks)
    # _split_multi_number_blocks 가 블록을 분리할 수 있으므로 >= 3
    assert len(results) >= 3
    fields = {r["field"] for r in results}
    assert "email" in fields
    assert "phone_number" in fields
