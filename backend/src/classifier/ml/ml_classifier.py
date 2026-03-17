"""
ML 기반 명함 텍스트 분류기 (추론)
학습된 모델을 로드하여 텍스트 블록을 분류
"""
import json
from pathlib import Path

import numpy as np
import joblib

from src.classifier.ml.feature_extractor import extract_features

# backend/src/classifier/ml/ → 5 parents → repo root
MODEL_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent / "data" / "ml_model"


class MLClassifier:
    """
    학습된 ML 모델 기반 텍스트 분류기.
    rule_based.py 의 classify_text_block() 과 동일한 인터페이스 제공.
    """

    def __init__(self, model_dir: str = None):
        self.model_dir = Path(model_dir) if model_dir else MODEL_DIR
        self.model = None
        self.meta = None
        self.label_map = None  # label → idx
        self.idx_map = None    # idx → label

        self._load()

    def _load(self):
        """학습된 모델과 메타데이터 로드."""
        model_path = self.model_dir / "classifier.joblib"
        meta_path = self.model_dir / "meta.json"

        if not model_path.exists():
            raise FileNotFoundError(
                f"학습된 모델이 없습니다: {model_path}\n"
                f"먼저 학습을 실행하세요: python -m src.classifier.ml.trainer"
            )

        self.model = joblib.load(str(model_path))

        with open(meta_path, "r", encoding="utf-8") as f:
            self.meta = json.load(f)

        self.label_map = self.meta["label_map"]
        self.idx_map = {int(v): k for k, v in self.label_map.items()}

    def classify_text_block(self, text: str) -> str:
        """
        단일 텍스트 블록을 필드로 분류.
        rule_based.classify_text_block() 과 동일 인터페이스.
        """
        if not text.strip():
            return "unknown"

        features = extract_features(text).reshape(1, -1)
        pred_idx = self.model.predict(features)[0]
        return self.idx_map[pred_idx]

    def classify_with_confidence(self, text: str) -> tuple[str, float]:
        """분류 + 확신도 반환."""
        if not text.strip():
            return "unknown", 0.0

        features = extract_features(text).reshape(1, -1)
        proba = self.model.predict_proba(features)[0]
        pred_idx = np.argmax(proba)
        confidence = float(proba[pred_idx])
        return self.idx_map[pred_idx], confidence

    def classify_all_blocks(self, text_blocks: list[dict]) -> list[dict]:
        """
        전체 텍스트 블록을 분류.
        rule_based.classify_all_blocks() 과 동일 인터페이스.
        """
        from src.classifier.rule_based import extract_clean_value, _split_multi_number_blocks

        # 전처리: 복합 블록 분리
        text_blocks = _split_multi_number_blocks(text_blocks)

        results = []
        for block in text_blocks:
            text = block["text"].strip()
            field, confidence = self.classify_with_confidence(text)

            # ML 확신도가 낮으면 (< 0.5) unknown 처리
            if confidence < 0.5:
                field = "unknown"

            clean_text = extract_clean_value(text, field)

            results.append({
                "text": clean_text,
                "confidence": block.get("confidence", 0.0),
                "ml_confidence": round(confidence, 4),
                "bbox": block.get("bbox"),
                "block_index": block["block_index"],
                "field": field,
            })

        return results

    @property
    def accuracy(self) -> float:
        """모델 학습 정확도."""
        return self.meta.get("accuracy", 0.0) if self.meta else 0.0
