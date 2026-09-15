from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


# ---------- Case content (loaded from clinical-engine/app/cases/*.json) ----------

class Demographics(BaseModel):
    age: int
    sex: Literal["male", "female"]
    occupation: str | None = None


class VitalSigns(BaseModel):
    heart_rate: int
    bp_systolic: int
    bp_diastolic: int
    respiratory_rate: int
    spo2: int
    temperature_c: float


class HistoryItem(BaseModel):
    id: str
    question: str
    finding: str
    critical: bool = False
    evidence_basis: str | None = None


class ExaminationItem(BaseModel):
    id: str
    maneuver: str
    finding: str
    critical: bool = False
    evidence_basis: str | None = None


class InvestigationOption(BaseModel):
    id: str
    name: str
    category: str  # e.g. "ECG", "Lab", "Imaging"
    cost_time_minutes: int
    result_summary: str
    result_detail: str
    discriminating: bool = False  # does this meaningfully separate differentials?
    evidence_basis: str | None = None
    likelihood_ratios: dict[str, float] = Field(
        default_factory=dict,
        description="diagnosis_id -> LR applied by the Bayesian engine when this result is positive",
    )


class DifferentialOption(BaseModel):
    id: str
    name: str
    prior_probability: float = Field(..., ge=0, le=1)
    is_ground_truth: bool = False


class OutcomeBranch(BaseModel):
    id: str
    condition: str  # human-readable description of what triggers this branch
    requires_decision_id: str
    title: str
    narrative: str
    favorable: bool
    educational_explanation: str


class CounterfactualBranch(BaseModel):
    id: str
    alternative_to_action_id: str
    alternative_action_label: str
    alternative_evidence: str
    probability_effect: str
    potential_outcome: str
    reasoning_lesson: str


class ReasoningErrorDefinition(BaseModel):
    id: str
    label: str
    trigger: str  # human-readable description of what student behavior triggers this
    educational_note: str


class ClinicalDecisionOption(BaseModel):
    id: str
    label: str
    is_appropriate: bool
    rationale: str


class CaseMetadata(BaseModel):
    source_type: Literal["author-drafted", "clinician-reviewed"] = "author-drafted"
    reviewer_status: str = "author-drafted, pending clinician review"
    reviewed_by: str | None = None
    last_reviewed: str | None = None
    references: list[str] = Field(default_factory=list)


class Case(BaseModel):
    """Full case definition, INCLUDING hidden ground truth. Never sent to the
    frontend as-is — the API layer strips hidden fields via `to_public()`.
    """

    id: str
    domain: str
    title: str
    difficulty: Literal["beginner", "intermediate", "advanced"]
    demographics: Demographics
    presenting_complaint: str
    vitals: VitalSigns
    history_items: list[HistoryItem]
    examination_items: list[ExaminationItem]
    investigations: list[InvestigationOption]
    differentials: list[DifferentialOption]
    critical_actions: list[str]
    clinical_decisions: list[ClinicalDecisionOption]
    outcome_branches: list[OutcomeBranch]
    counterfactual_branches: list[CounterfactualBranch]
    reasoning_error_catalog: list[ReasoningErrorDefinition]
    ml_feature_hint: dict[str, Any] = Field(
        default_factory=dict,
        description="Deterministic mapping from this case's ground-truth patient profile "
        "to the UCI Heart Disease feature schema, so the ML prediction step has real "
        "features rather than an invented profile.",
    )
    metadata: CaseMetadata

    def ground_truth_diagnosis_id(self) -> str:
        gt = next((d for d in self.differentials if d.is_ground_truth), None)
        if gt is None:
            raise ValueError(f"Case {self.id} has no ground-truth differential marked")
        return gt.id

    def to_public(self) -> dict:
        """Student-visible view: presenting complaint, demographics, vitals,
        and the MENU of available history/exam/investigation actions and
        differential options — WITHOUT revealing which is ground truth,
        which investigations are 'discriminating', critical-action lists,
        outcome/counterfactual content, or reasoning-error triggers.
        """
        return {
            "id": self.id,
            "domain": self.domain,
            "title": self.title,
            "difficulty": self.difficulty,
            "demographics": self.demographics.model_dump(),
            "presenting_complaint": self.presenting_complaint,
            "vitals": self.vitals.model_dump(),
            "history_menu": [
                {"id": h.id, "question": h.question} for h in self.history_items
            ],
            "examination_menu": [
                {"id": e.id, "maneuver": e.maneuver} for e in self.examination_items
            ],
            "investigation_menu": [
                {"id": i.id, "name": i.name, "category": i.category, "cost_time_minutes": i.cost_time_minutes}
                for i in self.investigations
            ],
            "differential_options": [
                {"id": d.id, "name": d.name} for d in self.differentials
            ],
            "clinical_decision_options": [
                {"id": c.id, "label": c.label} for c in self.clinical_decisions
            ],
            "metadata": self.metadata.model_dump(),
        }


# ---------- Session / action request-response contracts ----------

class ActionRequest(BaseModel):
    case_id: str
    session_id: str
    action_type: Literal["history", "examination", "investigation"]
    item_id: str


class ActionResult(BaseModel):
    action_type: str
    item_id: str
    label: str
    finding: str
    critical: bool = False


class DifferentialUpdateRequest(BaseModel):
    case_id: str
    session_id: str
    differential_ids: list[str]


class BayesianUpdateRequest(BaseModel):
    case_id: str
    session_id: str
    ordered_investigation_ids: list[str]
    risk_factor_history_ids: list[str] = Field(default_factory=list)


class BayesianStep(BaseModel):
    step_label: str
    evidence_applied: str | None
    probabilities: dict[str, float]


class BayesianUpdateResponse(BaseModel):
    disclaimer: str = (
        "Educational model output for teaching Bayesian reasoning. NOT a "
        "real-world clinical probability."
    )
    diagnoses: list[str]
    trajectory: list[BayesianStep]
    final_probabilities: dict[str, float]
    most_likely_diagnosis: str


class DecisionRequest(BaseModel):
    case_id: str
    session_id: str
    decision_id: str


class OutcomeResponse(BaseModel):
    outcome_id: str
    title: str
    narrative: str
    favorable: bool
    educational_explanation: str
    ground_truth_diagnosis: str
    was_decision_appropriate: bool


class ReasoningAnalysisRequest(BaseModel):
    case_id: str
    session_id: str
    history_ids: list[str]
    examination_ids: list[str]
    investigation_ids_in_order: list[str]
    differential_ids_selected: list[str]
    decision_id: str
    time_to_decision_seconds: int | None = None


class ReasoningFlag(BaseModel):
    id: str
    label: str
    detected: bool
    explanation: str


class ReasoningAnalysisResponse(BaseModel):
    correct_diagnosis: bool
    good_reasoning_process: bool
    flags: list[ReasoningFlag]
    summary: str


class MLPredictionRequest(BaseModel):
    case_id: str
    session_id: str


class MLPredictionResponse(BaseModel):
    predicted_class: int
    predicted_label: str
    probability_disease: float
    probability_no_disease: float
    model: str
    disclaimer: str


class CounterfactualRequest(BaseModel):
    case_id: str
    session_id: str
    actual_investigation_ids: list[str]


class CounterfactualItem(BaseModel):
    id: str
    alternative_action_label: str
    alternative_evidence: str
    probability_effect: str
    potential_outcome: str
    reasoning_lesson: str


class CounterfactualResponse(BaseModel):
    items: list[CounterfactualItem]
