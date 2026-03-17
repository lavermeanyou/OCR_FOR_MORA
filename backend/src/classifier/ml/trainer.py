"""
ML 분류기 학습기
- 합성 데이터 생성 → 특성 추출 → 모델 학습
- 자기 강화 루프: 틀린 예제를 더 많이 생성하여 재학습
"""
import json
import time
from pathlib import Path

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

from src.classifier.ml.data_generator import generate_dataset, generate_hard_examples, FIELD_NAMES
from src.classifier.ml.feature_extractor import extract_batch

# backend/src/classifier/ml/ → 5 parents → repo root
MODEL_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent / "data" / "ml_model"


def train(
    samples_per_field: int = 5000,
    reinforcement_rounds: int = 2,
    model_dir: str = None,
    verbose: bool = True,
) -> dict:
    """
    ML 분류기 학습 (자기 강화 루프 포함).

    1라운드: 합성 데이터로 기본 학습
    2라운드+: 틀린 패턴에 대한 추가 데이터로 강화 학습

    Args:
        samples_per_field: 필드당 기본 샘플 수
        reinforcement_rounds: 강화 학습 반복 횟수
        model_dir: 모델 저장 경로
        verbose: 로그 출력 여부

    Returns:
        {"accuracy": float, "report": str, "model_path": str}
    """
    save_dir = Path(model_dir) if model_dir else MODEL_DIR
    save_dir.mkdir(parents=True, exist_ok=True)

    label_to_idx = {name: i for i, name in enumerate(FIELD_NAMES)}
    idx_to_label = {i: name for name, i in label_to_idx.items()}

    # ── 1라운드: 기본 데이터 생성 + 학습 ──
    if verbose:
        print(f"[Round 0] 합성 데이터 생성: {samples_per_field} x {len(FIELD_NAMES)} 필드")

    dataset = generate_dataset(samples_per_field=samples_per_field)
    texts = [t for t, _ in dataset]
    labels = [label_to_idx[l] for _, l in dataset]

    if verbose:
        print(f"[Round 0] 특성 추출 중... ({len(texts)} 샘플)")
    X = extract_batch(texts)
    y = np.array(labels)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)

    if verbose:
        print(f"[Round 0] 학습: {len(X_train)}, 테스트: {len(X_test)}")

    model = GradientBoostingClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        random_state=42,
    )

    start = time.time()
    model.fit(X_train, y_train)
    elapsed = time.time() - start

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    if verbose:
        print(f"[Round 0] 정확도: {acc:.4f} ({elapsed:.1f}s)")

    # ── 강화 학습 라운드 ──
    for r in range(1, reinforcement_rounds + 1):
        if verbose:
            print(f"\n[Round {r}] 강화 학습 시작...")

        # 1) 기존 테스트에서 틀린 것 분석
        wrong_mask = y_pred != y_test
        wrong_true_labels = y_test[wrong_mask]

        if len(wrong_true_labels) == 0:
            if verbose:
                print(f"[Round {r}] 틀린 예제 없음 — 스킵")
            continue

        # 어떤 필드를 가장 많이 틀렸는지
        wrong_counts = {}
        for idx in wrong_true_labels:
            label = idx_to_label[idx]
            wrong_counts[label] = wrong_counts.get(label, 0) + 1

        if verbose:
            print(f"[Round {r}] 오분류 분포: {wrong_counts}")

        # 2) 어려운 예제 추가 생성
        hard_data = generate_hard_examples(samples=3000, seed=42 + r)

        # 3) 약한 필드에 대한 추가 데이터
        extra_data = generate_dataset(
            samples_per_field=max(1000, samples_per_field // 2),
            seed=100 + r,
        )

        # 합치기
        all_texts = texts + [t for t, _ in hard_data] + [t for t, _ in extra_data]
        all_labels = labels + [label_to_idx[l] for _, l in hard_data] + [label_to_idx[l] for _, l in extra_data]

        X_all = extract_batch(all_texts)
        y_all = np.array(all_labels)

        X_train, X_test, y_train, y_test = train_test_split(
            X_all, y_all, test_size=0.15, random_state=42 + r, stratify=y_all
        )

        if verbose:
            print(f"[Round {r}] 학습: {len(X_train)}, 테스트: {len(X_test)}")

        # 모델 재학습 (더 많은 estimators)
        model = GradientBoostingClassifier(
            n_estimators=200 + r * 50,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            random_state=42 + r,
        )

        start = time.time()
        model.fit(X_train, y_train)
        elapsed = time.time() - start

        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)

        if verbose:
            print(f"[Round {r}] 정확도: {acc:.4f} ({elapsed:.1f}s)")

    # ── 최종 결과 ──
    report = classification_report(y_test, y_pred, target_names=FIELD_NAMES)
    if verbose:
        print(f"\n{'='*60}")
        print("최종 Classification Report:")
        print(report)
        print(f"{'='*60}")

    # ── 모델 저장 ──
    model_path = save_dir / "classifier.joblib"
    meta_path = save_dir / "meta.json"

    joblib.dump(model, str(model_path))

    meta = {
        "accuracy": float(acc),
        "n_features": int(X_train.shape[1]),
        "n_classes": len(FIELD_NAMES),
        "label_map": label_to_idx,
        "field_names": FIELD_NAMES,
        "total_samples": len(all_texts) if reinforcement_rounds > 0 else len(texts),
        "reinforcement_rounds": reinforcement_rounds,
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    if verbose:
        print(f"\n모델 저장: {model_path}")
        print(f"메타 저장: {meta_path}")

    return {
        "accuracy": float(acc),
        "report": report,
        "model_path": str(model_path),
    }


if __name__ == "__main__":
    result = train(samples_per_field=5000, reinforcement_rounds=2, verbose=True)
    print(f"\n최종 정확도: {result['accuracy']:.4f}")
