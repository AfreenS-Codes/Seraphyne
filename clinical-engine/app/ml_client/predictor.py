from __future__ import annotations

import sys
from pathlib import Path

from app.schemas.case import Case

# The clinical-engine imports the ml/ package directly (both share the same
# scikit-learn/joblib/pandas versions in requirements.txt) rather than
# duplicating the trained pipeline or reimplementing inference logic.
ML_ROOT = Path(__file__).resolve().parents[3] / "ml"
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))


class MLNotTrainedError(Exception):
    pass


def predict_for_case(case: Case) -> dict:
    try:
        from inference.predict import predict  # imported lazily so the API can
    except ImportError as e:  # pragma: no cover
        raise MLNotTrainedError(f"ml package not importable: {e}") from e

    if not case.ml_feature_hint or any(
        k not in case.ml_feature_hint
        for k in ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
    ):
        raise ValueError(f"Case '{case.id}' has no complete ml_feature_hint defined")

    try:
        result = predict(case.ml_feature_hint)
    except FileNotFoundError as e:
        raise MLNotTrainedError(str(e)) from e
    return result
