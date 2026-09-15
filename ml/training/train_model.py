"""Train multiple baseline classifiers, select the best using cross-validated
accuracy computed ONLY on the combined train+validation data (appropriate
given the dataset's small size — a single train/val split of ~180/61 rows
gives a noisy point estimate; 5-fold CV over train+val gives a more stable
selection signal while still never touching the held-out test set), then
refit the selected model on all train+val data.

The held-out test set is never touched here — only in evaluate_model.py,
exactly once, for final reporting. This enforces the no-leakage /
tune-on-train-val-only requirement.

Usage:
    python ml/training/train_model.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.svm import SVC

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ML_ROOT))

from features.pipeline import build_pipeline  # noqa: E402
from preprocessing.prepare_dataset import FEATURE_COLUMNS, LABEL_COLUMN  # noqa: E402

SPLITS_DIR = ML_ROOT / "data" / "splits"
ARTIFACTS_DIR = ML_ROOT / "artifacts"
RANDOM_STATE = 42


def load_split(name: str) -> tuple[pd.DataFrame, pd.Series]:
    path = SPLITS_DIR / f"{name}.csv"
    if not path.exists():
        raise FileNotFoundError(f"{path} not found — run preprocessing/prepare_dataset.py first.")
    df = pd.read_csv(path)
    return df[FEATURE_COLUMNS], df[LABEL_COLUMN]


# (model, hyperparameter grid) — grids are small and principled, not tuned
# against the test set. Selection uses only train+val via cross-validation.
CANDIDATE_GRIDS = {
    "logistic_regression": (
        LogisticRegression(max_iter=2000, random_state=RANDOM_STATE),
        {"model__C": [0.03, 0.1, 0.3, 1, 3]},
    ),
    "random_forest": (
        RandomForestClassifier(random_state=RANDOM_STATE),
        {
            "model__n_estimators": [100, 200],
            "model__max_depth": [3, 4, 5, 6],
            "model__min_samples_leaf": [2, 3, 5],
        },
    ),
    "gradient_boosting": (
        GradientBoostingClassifier(random_state=RANDOM_STATE),
        {
            "model__n_estimators": [50, 100, 150],
            "model__max_depth": [1, 2, 3],
            "model__learning_rate": [0.03, 0.05, 0.1],
        },
    ),
    "svm": (
        SVC(probability=True, random_state=RANDOM_STATE),
        {"model__C": [0.1, 1, 3], "model__kernel": ["rbf", "linear"]},
    ),
}


def main() -> None:
    X_train, y_train = load_split("train")
    X_val, y_val = load_split("val")
    # Combine train+val for cross-validated model selection. This is
    # standard practice for small datasets (303 total rows): it gives a
    # far more stable selection signal than a single ~60-row validation
    # split, while the held-out test split is still never touched.
    X_trainval = pd.concat([X_train, X_val], ignore_index=True)
    y_trainval = pd.concat([y_train, y_val], ignore_index=True)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    results = {}
    fitted_pipelines = {}

    for name, (model, grid) in CANDIDATE_GRIDS.items():
        pipeline = build_pipeline(model)
        search = GridSearchCV(pipeline, grid, cv=cv, scoring="accuracy", n_jobs=-1)
        search.fit(X_trainval, y_trainval)  # preprocessor refit inside each CV fold
        results[name] = {
            "cv_mean_accuracy": round(float(search.best_score_), 4),
            "best_params": search.best_params_,
        }
        fitted_pipelines[name] = search.best_estimator_
        print(f"{name:20s} cv_mean_accuracy={search.best_score_:.4f} params={search.best_params_}")

    best_name = max(results, key=lambda n: results[n]["cv_mean_accuracy"])
    best_pipeline = fitted_pipelines[best_name]
    print(f"\nBest model by 5-fold CV on train+val: {best_name} ({results[best_name]})")

    ARTIFACTS_DIR.mkdir(exist_ok=True)
    joblib.dump(best_pipeline, ARTIFACTS_DIR / "best_model.joblib")
    with open(ARTIFACTS_DIR / "training_report.json", "w") as f:
        json.dump(
            {
                "candidate_cv_results": results,
                "selected_model": best_name,
                "selection_criterion": (
                    "highest 5-fold cross-validated accuracy on combined train+val "
                    "data (test set untouched)"
                ),
                "n_trainval_samples": int(len(X_trainval)),
                "random_state": RANDOM_STATE,
            },
            f,
            indent=2,
        )
    print(f"Saved best model to {ARTIFACTS_DIR / 'best_model.joblib'}")


if __name__ == "__main__":
    main()

