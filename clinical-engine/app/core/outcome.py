from __future__ import annotations

from app.schemas.case import Case, OutcomeResponse


class DecisionNotFoundError(Exception):
    pass


class OutcomeNotDefinedError(Exception):
    pass


def resolve_outcome(case: Case, decision_id: str) -> OutcomeResponse:
    decision = next((d for d in case.clinical_decisions if d.id == decision_id), None)
    if decision is None:
        raise DecisionNotFoundError(f"Decision '{decision_id}' not found in case '{case.id}'")

    branch = next((b for b in case.outcome_branches if b.requires_decision_id == decision_id), None)
    if branch is None:
        raise OutcomeNotDefinedError(
            f"No structured outcome branch is defined for decision '{decision_id}' in case '{case.id}'"
        )

    gt = next(d for d in case.differentials if d.is_ground_truth)

    return OutcomeResponse(
        outcome_id=branch.id,
        title=branch.title,
        narrative=branch.narrative,
        favorable=branch.favorable,
        educational_explanation=branch.educational_explanation,
        ground_truth_diagnosis=gt.name,
        was_decision_appropriate=decision.is_appropriate,
    )
