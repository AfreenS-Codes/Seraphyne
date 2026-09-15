from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["cases_loaded"] >= 1


def test_list_cases_hides_ground_truth():
    r = client.get("/api/v1/cases")
    assert r.status_code == 200
    cases = r.json()
    assert len(cases) >= 1
    raw = str(cases)
    assert "is_ground_truth" not in raw
    assert "outcome_branches" not in raw
    assert "likelihood_ratios" not in raw


def test_get_case_public_view():
    r = client.get("/api/v1/cases/acs-001")
    assert r.status_code == 200
    case = r.json()
    assert case["id"] == "acs-001"
    assert len(case["history_menu"]) > 0
    assert len(case["investigation_menu"]) > 0


def test_get_case_404():
    r = client.get("/api/v1/cases/does-not-exist")
    assert r.status_code == 404


def test_bayesian_update_converges_on_ground_truth():
    r = client.post(
        "/api/v1/bayesian/update",
        json={
            "case_id": "acs-001",
            "session_id": "s1",
            "ordered_investigation_ids": ["i_ecg", "i_troponin_0h", "i_troponin_3h"],
            "risk_factor_history_ids": ["h_risk_smoking", "h_risk_diabetes"],
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["most_likely_diagnosis"] == "Non-ST-elevation myocardial infarction (NSTEMI)"
    assert len(body["trajectory"]) >= 3
    # probabilities at each step sum to ~1 (small tolerance for the 4-dp display rounding)
    for step in body["trajectory"]:
        assert abs(sum(step["probabilities"].values()) - 1.0) < 1e-3
    assert "disclaimer" in body


def test_bayesian_update_unknown_case_404():
    r = client.post(
        "/api/v1/bayesian/update",
        json={"case_id": "nope", "session_id": "s1", "ordered_investigation_ids": []},
    )
    assert r.status_code == 404


def test_reasoning_good_path_no_flags():
    r = client.post(
        "/api/v1/reasoning/analyze",
        json={
            "case_id": "acs-001",
            "session_id": "s1",
            "history_ids": ["h_onset", "h_radiation", "h_exertion"],
            "examination_ids": ["e_pulses"],
            "investigation_ids_in_order": ["i_ecg", "i_troponin_0h"],
            "differential_ids_selected": ["nstemi", "stable_angina"],
            "decision_id": "d_acs_pathway",
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["correct_diagnosis"] is True
    assert body["good_reasoning_process"] is True
    assert all(not f["detected"] for f in body["flags"])


def test_reasoning_bad_path_flags_multiple_errors():
    r = client.post(
        "/api/v1/reasoning/analyze",
        json={
            "case_id": "acs-001",
            "session_id": "s2",
            "history_ids": ["h_onset"],
            "examination_ids": [],
            "investigation_ids_in_order": ["i_d_dimer"],
            "differential_ids_selected": ["gerd"],
            "decision_id": "d_discharge_gerd",
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["correct_diagnosis"] is False
    assert body["good_reasoning_process"] is False
    detected = {f["id"] for f in body["flags"] if f["detected"]}
    assert "premature_closure" in detected
    assert "poor_investigation_selection" in detected
    assert "ignoring_red_flags" in detected


def test_outcome_resolve_favorable():
    r = client.post("/api/v1/outcome/resolve", json={"case_id": "acs-001", "decision_id": "d_acs_pathway"})
    assert r.status_code == 200
    body = r.json()
    assert body["favorable"] is True
    assert body["was_decision_appropriate"] is True


def test_outcome_resolve_unfavorable():
    r = client.post("/api/v1/outcome/resolve", json={"case_id": "acs-001", "decision_id": "d_discharge_gerd"})
    assert r.status_code == 200
    body = r.json()
    assert body["favorable"] is False
    assert body["was_decision_appropriate"] is False


def test_outcome_resolve_missing_fields_422():
    r = client.post("/api/v1/outcome/resolve", json={"case_id": "acs-001"})
    assert r.status_code == 422


def test_counterfactual_returns_case_branches():
    r = client.post(
        "/api/v1/counterfactual",
        json={"case_id": "acs-001", "session_id": "s1", "actual_investigation_ids": ["i_ecg"]},
    )
    assert r.status_code == 200
    body = r.json()
    assert len(body["items"]) == 3


def test_ml_predict_returns_disclaimer_and_matches_case_narrative():
    r = client.post("/api/v1/ml/predict", json={"case_id": "acs-001", "session_id": "s1"})
    assert r.status_code == 200
    body = r.json()
    assert "disclaimer" in body and "educational" in body["disclaimer"].lower()
    assert body["predicted_label"] in ("disease_likely", "disease_unlikely")
    assert 0.0 <= body["probability_disease"] <= 1.0
