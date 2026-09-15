from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.bayesian.engine import run_bayesian_update
from app.cases.loader import CaseNotFoundError, get_case, list_cases
from app.core.counterfactual import generate_counterfactuals
from app.core.outcome import DecisionNotFoundError, OutcomeNotDefinedError, resolve_outcome
from app.core.reasoning import analyze_reasoning
from app.ml_client.predictor import MLNotTrainedError, predict_for_case
from app.schemas.case import (
    BayesianUpdateRequest,
    BayesianUpdateResponse,
    CounterfactualRequest,
    CounterfactualResponse,
    MLPredictionRequest,
    MLPredictionResponse,
    OutcomeResponse,
    ReasoningAnalysisRequest,
    ReasoningAnalysisResponse,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clinical-engine")

app = FastAPI(
    title="SERAPHYNE Clinical Engine",
    description=(
        "Deterministic clinical simulation engine: structured case content, "
        "Bayesian evidence-update, reasoning analysis, outcome resolution, "
        "counterfactual analysis, and ML prediction. No LLM is used to "
        "generate medical ground truth anywhere in this service."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    try:
        cases = list_cases()
        cases_ok = True
        n_cases = len(cases)
    except Exception as e:  # pragma: no cover
        cases_ok = False
        n_cases = 0
        logger.error("case_load_failed error=%s", e)
    return {"status": "ok", "service": "clinical-engine", "cases_loaded": n_cases, "cases_ok": cases_ok}


@app.get("/api/v1/cases")
async def api_list_cases():
    return [c.to_public() for c in list_cases()]


@app.get("/api/v1/cases/{case_id}")
async def api_get_case(case_id: str):
    try:
        case = get_case(case_id)
    except CaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    return case.to_public()


@app.post("/api/v1/bayesian/update", response_model=BayesianUpdateResponse)
async def api_bayesian_update(req: BayesianUpdateRequest):
    try:
        case = get_case(req.case_id)
    except CaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    return run_bayesian_update(case, req.ordered_investigation_ids, req.risk_factor_history_ids)


@app.post("/api/v1/reasoning/analyze", response_model=ReasoningAnalysisResponse)
async def api_reasoning_analyze(req: ReasoningAnalysisRequest):
    try:
        case = get_case(req.case_id)
    except CaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    return analyze_reasoning(
        case,
        history_ids=req.history_ids,
        examination_ids=req.examination_ids,
        investigation_ids_in_order=req.investigation_ids_in_order,
        differential_ids_selected=req.differential_ids_selected,
        decision_id=req.decision_id,
    )


@app.post("/api/v1/outcome/resolve", response_model=OutcomeResponse)
async def api_outcome_resolve(req: dict):
    case_id = req.get("case_id")
    decision_id = req.get("decision_id")
    if not case_id or not decision_id:
        raise HTTPException(status_code=422, detail="case_id and decision_id are required")
    try:
        case = get_case(case_id)
        return resolve_outcome(case, decision_id)
    except CaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except (DecisionNotFoundError, OutcomeNotDefinedError) as e:
        raise HTTPException(status_code=422, detail=str(e)) from e


@app.post("/api/v1/counterfactual", response_model=CounterfactualResponse)
async def api_counterfactual(req: CounterfactualRequest):
    try:
        case = get_case(req.case_id)
    except CaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    return generate_counterfactuals(case, req.actual_investigation_ids)


@app.get("/api/v1/cases/{case_id}/{action_type}/{item_id}")
async def api_reveal_finding(case_id: str, action_type: str, item_id: str):
    """Reveals the finding/result for a single history/examination/investigation
    item once the student has chosen to gather it — never sent as part of the
    public case listing (see Case.to_public), only on demand per item.
    """
    try:
        case = get_case(case_id)
    except CaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

    if action_type == "history":
        item = next((h for h in case.history_items if h.id == item_id), None)
        if item is None:
            raise HTTPException(status_code=404, detail=f"History item '{item_id}' not found")
        return {"id": item.id, "label": item.question, "finding": item.finding, "critical": item.critical}
    if action_type == "examination":
        item = next((e for e in case.examination_items if e.id == item_id), None)
        if item is None:
            raise HTTPException(status_code=404, detail=f"Examination item '{item_id}' not found")
        return {"id": item.id, "label": item.maneuver, "finding": item.finding, "critical": item.critical}
    if action_type == "investigation":
        item = next((i for i in case.investigations if i.id == item_id), None)
        if item is None:
            raise HTTPException(status_code=404, detail=f"Investigation '{item_id}' not found")
        return {
            "id": item.id,
            "label": item.name,
            "finding": item.result_summary,
            "detail": item.result_detail,
            "critical": False,
        }
    raise HTTPException(status_code=422, detail=f"Unknown action_type '{action_type}'")


@app.post("/api/v1/ml/predict", response_model=MLPredictionResponse)
async def api_ml_predict(req: MLPredictionRequest):
    try:
        case = get_case(req.case_id)
    except CaseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    try:
        result = predict_for_case(case)
    except MLNotTrainedError as e:
        raise HTTPException(
            status_code=503,
            detail=f"ML model not available: {e}. Run ml/training/train_model.py first.",
        ) from e
    return MLPredictionResponse(
        predicted_class=result["predicted_class"],
        predicted_label=result["predicted_label"],
        probability_disease=result["probability_disease"],
        probability_no_disease=result["probability_no_disease"],
        model=result["model"],
        disclaimer=result["disclaimer"],
    )
