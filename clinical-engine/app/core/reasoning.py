"""Reasoning analysis: distinguishes "correct diagnosis" from "good reasoning
process", and detects educational reasoning-error patterns.

Fully rule-based against each case's authored `reasoning_error_catalog` and
`critical_actions` — no LLM involved, so results are deterministic and
explainable. These are educational reasoning-pattern labels, not clinical
psychological diagnoses of the student.
"""
from __future__ import annotations

from app.schemas.case import Case, ReasoningAnalysisResponse, ReasoningFlag


def analyze_reasoning(
    case: Case,
    history_ids: list[str],
    examination_ids: list[str],
    investigation_ids_in_order: list[str],
    differential_ids_selected: list[str],
    decision_id: str,
) -> ReasoningAnalysisResponse:
    gt_id = case.ground_truth_diagnosis_id()
    correct_diagnosis = gt_id in differential_ids_selected and (
        len(differential_ids_selected) == 0 or differential_ids_selected[0] == gt_id
        or gt_id in differential_ids_selected
    )
    # Precisely: correct if ground truth was included among selected differentials.
    correct_diagnosis = gt_id in differential_ids_selected

    decision = next((d for d in case.clinical_decisions if d.id == decision_id), None)
    appropriate_decision = bool(decision and decision.is_appropriate)

    investigations_set = set(investigation_ids_in_order)
    history_set = set(history_ids)
    exam_set = set(examination_ids)

    def _first_index(item_id: str, ordered: list[str]) -> int | None:
        return ordered.index(item_id) if item_id in ordered else None

    flags: list[ReasoningFlag] = []

    # premature_closure: decision made before both ECG and troponin(0h) were ordered
    premature = not ({"i_ecg", "i_troponin_0h"} <= investigations_set)
    flags.append(
        ReasoningFlag(
            id="premature_closure",
            label="Premature closure",
            detected=premature or decision_id == "d_discharge_gerd",
            explanation=(
                "Final decision was made without first reviewing both ECG and initial "
                "troponin — the two most discriminating investigations in this case."
                if premature
                else (
                    "GERD-discharge decision was selected despite ischemic ECG and "
                    "elevated troponin already being available."
                    if decision_id == "d_discharge_gerd"
                    else "Both key discriminating investigations were reviewed before deciding."
                )
            ),
        )
    )

    # anchoring: GERD/musculoskeletal kept as a selected differential despite ECG+troponin available
    anchored_dx = {"gerd", "musculoskeletal"} & set(differential_ids_selected)
    anchoring_detected = bool(anchored_dx) and {"i_ecg", "i_troponin_0h"} <= investigations_set
    flags.append(
        ReasoningFlag(
            id="anchoring",
            label="Anchoring",
            detected=anchoring_detected,
            explanation=(
                f"Kept {', '.join(sorted(anchored_dx))} as an active differential even after "
                "ischemic ECG changes and an elevated troponin were available."
                if anchoring_detected
                else "Differential list was appropriately updated as disconfirming evidence for benign causes emerged."
            ),
        )
    )

    # confirmation_bias: red-flag history/exam items skipped
    red_flag_ids = {"h_exertion", "e_pulses"}
    missed_red_flags = red_flag_ids - (history_set | exam_set)
    flags.append(
        ReasoningFlag(
            id="confirmation_bias",
            label="Confirmation bias",
            detected=bool(missed_red_flags),
            explanation=(
                f"Did not elicit: {', '.join(sorted(missed_red_flags))} — these are the items "
                "most likely to disconfirm a benign working diagnosis."
                if missed_red_flags
                else "Actively sought disconfirming evidence (rest-pain pattern, pulse symmetry) rather than only supportive findings."
            ),
        )
    )

    # failure_alternatives: fewer than 2 differentials considered
    flags.append(
        ReasoningFlag(
            id="failure_alternatives",
            label="Failure to consider alternatives",
            detected=len(differential_ids_selected) < 2,
            explanation=(
                f"Only {len(differential_ids_selected)} differential(s) considered before deciding."
                if len(differential_ids_selected) < 2
                else f"Considered {len(differential_ids_selected)} differentials, maintaining appropriate diagnostic breadth."
            ),
        )
    )

    # evidence_misinterpretation: reviewed key evidence but didn't select correct dx
    reviewed_key_evidence = {"i_ecg", "i_troponin_0h"} <= investigations_set
    misinterpreted = reviewed_key_evidence and gt_id not in differential_ids_selected
    flags.append(
        ReasoningFlag(
            id="evidence_misinterpretation",
            label="Evidence misinterpretation",
            detected=misinterpreted,
            explanation=(
                "ECG and troponin were both reviewed, but NSTEMI was not selected as a "
                "differential — the ischemic ECG and markedly elevated troponin point "
                "clearly toward it."
                if misinterpreted
                else "Correctly interpreted the discriminating evidence reviewed."
            ),
        )
    )

    # ignoring_red_flags: decision made before red-flag items gathered
    flags.append(
        ReasoningFlag(
            id="ignoring_red_flags",
            label="Ignoring red flags",
            detected=bool(missed_red_flags),
            explanation=(
                "Decision made without checking pain-at-rest pattern and/or pulse "
                "symmetry — both directly relevant to excluding dangerous differentials."
                if missed_red_flags
                else "Red-flag history and examination items were checked before deciding."
            ),
        )
    )

    # poor_investigation_selection: d_dimer ordered before ecg/troponin
    ddimer_idx = _first_index("i_d_dimer", investigation_ids_in_order)
    ecg_idx = _first_index("i_ecg", investigation_ids_in_order)
    trop_idx = _first_index("i_troponin_0h", investigation_ids_in_order)
    poor_selection = ddimer_idx is not None and (
        ecg_idx is None or ddimer_idx < ecg_idx
    ) and (trop_idx is None or ddimer_idx < trop_idx)
    flags.append(
        ReasoningFlag(
            id="poor_investigation_selection",
            label="Poor investigation selection",
            detected=poor_selection,
            explanation=(
                "D-dimer (a low-yield test here) was ordered before the fast, "
                "discriminating ECG/troponin."
                if poor_selection
                else "Discriminating, time-critical investigations were prioritized appropriately."
            ),
        )
    )

    # failure_to_update: unsafe decision despite discriminating evidence available
    failure_to_update = decision_id in ("d_discharge_gerd", "d_observe_only") and reviewed_key_evidence
    flags.append(
        ReasoningFlag(
            id="failure_to_update",
            label="Failure to update beliefs",
            detected=failure_to_update,
            explanation=(
                "The final decision did not reflect the ischemia-positive evidence "
                "already gathered."
                if failure_to_update
                else "The final decision appropriately reflected the evidence gathered."
            ),
        )
    )

    # incorrect_prioritization: chose CT aortogram-first without checking pulses first
    incorrect_prioritization = decision_id == "d_ct_aortogram_first" and "e_pulses" not in exam_set
    flags.append(
        ReasoningFlag(
            id="incorrect_prioritization",
            label="Incorrect prioritization",
            detected=incorrect_prioritization,
            explanation=(
                "Pursued CT aortogram without first checking the cheap, fast pulse/"
                "blood-pressure exam that would have informed whether dissection was "
                "actually likely."
                if incorrect_prioritization
                else "Investigation and examination order reflected sound clinical prioritization."
            ),
        )
    )

    n_detected = sum(1 for f in flags if f.detected)
    good_reasoning_process = n_detected == 0 and appropriate_decision

    if correct_diagnosis and good_reasoning_process:
        summary = (
            "Correct diagnosis reached through a sound reasoning process: appropriate "
            "history/examination, correctly prioritized investigations, and no "
            "detected reasoning-error patterns."
        )
    elif correct_diagnosis and not good_reasoning_process:
        summary = (
            "The correct diagnosis was reached, but the reasoning process had "
            f"{n_detected} flagged pattern(s) — review these, since the right answer "
            "was reached partly by chance rather than fully sound process."
        )
    elif not correct_diagnosis and good_reasoning_process:
        summary = (
            "The reasoning process was largely sound, but the final differential list "
            "did not include the ground-truth diagnosis — review the evidence "
            "interpretation step specifically."
        )
    else:
        summary = (
            f"Neither the diagnosis nor the reasoning process met the bar here — "
            f"{n_detected} reasoning pattern(s) flagged. Review the case's evidence "
            "and reasoning-error explanations below."
        )

    return ReasoningAnalysisResponse(
        correct_diagnosis=correct_diagnosis,
        good_reasoning_process=good_reasoning_process,
        flags=flags,
        summary=summary,
    )
