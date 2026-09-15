"""Leakage-safe feature preprocessing pipeline.

The ColumnTransformer here is ALWAYS fit only on the training split; the
same fitted transformer is then applied (never re-fit) to validation and
test data. This module is imported by training/evaluation/inference so
there is exactly one preprocessing definition used everywhere.
"""
from __future__ import annotations

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

NUMERIC_FEATURES = ["age", "trestbps", "chol", "thalach", "oldpeak"]
CATEGORICAL_FEATURES = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("numeric", StandardScaler(), NUMERIC_FEATURES),
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_FEATURES,
            ),
        ]
    )


def build_pipeline(model) -> Pipeline:
    """Wrap a model with the shared preprocessor so fit/predict always apply
    the identical, leakage-safe transformation. `Pipeline.fit` only ever
    fits the preprocessor on whatever X is passed to it — callers must pass
    ONLY the training split to `.fit()`.
    """
    return Pipeline(steps=[("preprocess", build_preprocessor()), ("model", model)])
