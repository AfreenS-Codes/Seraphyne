from __future__ import annotations

from app.schemas.case import Case, CounterfactualItem, CounterfactualResponse


def generate_counterfactuals(case: Case, actual_investigation_ids: list[str]) -> CounterfactualResponse:
    """Returns the case's authored counterfactual branches that are relevant
    given what the student actually did — i.e. "what if you'd done X
    differently" for actions the student DID take (their alternative-not-
    taken) plus any branch tied to an action they skipped entirely.

    All content is pulled verbatim from the case's structured
    `counterfactual_branches` — never invented at request time.
    """
    items: list[CounterfactualItem] = []
    for branch in case.counterfactual_branches:
        # Show a counterfactual if it's about something the student DID do
        # (contrasting with an alternative), or about something they SKIPPED
        # (i.e. the alternative path was never explored at all).
        relevant = True  # for this MVP, surface all authored counterfactuals for the case
        if relevant:
            items.append(
                CounterfactualItem(
                    id=branch.id,
                    alternative_action_label=branch.alternative_action_label,
                    alternative_evidence=branch.alternative_evidence,
                    probability_effect=branch.probability_effect,
                    potential_outcome=branch.potential_outcome,
                    reasoning_lesson=branch.reasoning_lesson,
                )
            )
    return CounterfactualResponse(items=items)
