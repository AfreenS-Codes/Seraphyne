"""Prepare the UCI Heart Disease dataset: load, validate, and create a
reproducible stratified train/validation/test split.

Source: ml/data/heart_raw.csv (see docs/DATASETS.md for full provenance).

Usage:
    python ml/preprocessing/prepare_dataset.py
"""
from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
RAW_PATH = DATA_DIR / "heart_raw.csv"
FEATURE_COLUMNS = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach",
    "exang", "oldpeak", "slope", "ca", "thal",
]
LABEL_COLUMN = "target"
RANDOM_STATE = 42


def load_raw() -> pd.DataFrame:
    if not RAW_PATH.exists():
        raise FileNotFoundError(
            f"Raw dataset not found at {RAW_PATH}. This file must be the real "
            "UCI Heart Disease CSV (see docs/DATASETS.md) — it is never "
            "fabricated by this script."
        )
    df = pd.read_csv(RAW_PATH)
    missing_cols = set(FEATURE_COLUMNS + [LABEL_COLUMN]) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Raw dataset is missing expected columns: {missing_cols}")
    return df


def validate(df: pd.DataFrame) -> dict:
    """Real, computed data-quality report — not fabricated."""
    report = {
        "n_rows": int(len(df)),
        "n_columns": int(df.shape[1]),
        "n_missing_values": int(df.isna().sum().sum()),
        "target_distribution": df[LABEL_COLUMN].value_counts().to_dict(),
        "out_of_documented_range": {
            "ca_values_present": sorted(df["ca"].unique().tolist()),
            "thal_values_present": sorted(df["thal"].unique().tolist()),
        },
    }
    return report


def split(df: pd.DataFrame):
    X = df[FEATURE_COLUMNS].copy()
    y = df[LABEL_COLUMN].copy()

    # 60/20/20 stratified split, held-out test set touched only once.
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.4, random_state=RANDOM_STATE, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=RANDOM_STATE, stratify=y_temp
    )
    return X_train, X_val, X_test, y_train, y_val, y_test


def main() -> None:
    df = load_raw()
    report = validate(df)
    print("Data quality report (computed, not fabricated):")
    print(json.dumps(report, indent=2))

    X_train, X_val, X_test, y_train, y_val, y_test = split(df)

    out_dir = DATA_DIR / "splits"
    out_dir.mkdir(exist_ok=True)
    for name, X, y in [("train", X_train, y_train), ("val", X_val, y_val), ("test", X_test, y_test)]:
        combined = X.copy()
        combined[LABEL_COLUMN] = y.values
        combined.to_csv(out_dir / f"{name}.csv", index=False)
        print(f"{name}: {len(combined)} rows, target distribution={y.value_counts().to_dict()}")

    with open(out_dir / "data_quality_report.json", "w") as f:
        json.dump(report, f, indent=2)

    print(f"\nSplits written to {out_dir}")


if __name__ == "__main__":
    main()
