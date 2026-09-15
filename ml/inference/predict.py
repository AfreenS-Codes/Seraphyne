"""Load the trained artifact and run inference for a single patient profile.

Used by the clinical-engine's ML endpoint (via subprocess/import) to produce
the "ML Prediction" step of the ACS journey. This predicts coronary artery
disease presence from clinical variables — it is explicitly an educational
teaching-model output, not a real diagnostic tool, and callers must label it
as such.

Usage (CLI):
    python ml/inference/predict.py '{"age":63,"sex":1,"cp":3,...}'
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ML_ROOT))

from preprocessing.prepare_dataset import FEATURE_COLUMNS  # noqa: E402

ARTIFACTS_DIR = ML_ROOT / "artifacts"
_model = None


def get_model():
    global _model
    if _model is None:
        model_path = ARTIFACTS_DIR / "best_model.joblib"
        if not model_path.exists():
            raise FileNotFoundError(
                f"{model_path} not found — run training/train_model.py first."
            )
        _model = joblib.load(model_path)
    return _model


def predict(patient: dict) -> dict:
    missing = set(FEATURE_COLUMNS) - set(patient.keys())
    if missing:
        raise ValueError(f"Missing required features: {missing}")
    model = get_model()
    X = pd.DataFrame([{k: patient[k] for k in FEATURE_COLUMNS}])
    proba = model.predict_proba(X)[0]
    pred_class = int(model.predict(X)[0])
    return {
        "predicted_class": pred_class,
        "predicted_label": "disease_likely" if pred_class == 1 else "disease_unlikely",
        "probability_disease": round(float(proba[1]), 4),
        "probability_no_disease": round(float(proba[0]), 4),
        "model": type(model.named_steps["model"]).__name__,
        "disclaimer": (
            "Educational teaching-model output based on the UCI Heart Disease "
            "dataset (see docs/DATASETS.md). NOT a validated diagnostic tool and "
            "must never be used for real patient care."
        ),
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python predict.py '<json patient profile>'", file=sys.stderr)
        sys.exit(1)
    patient_input = json.loads(sys.argv[1])
    result = predict(patient_input)
    print(json.dumps(result, indent=2))
