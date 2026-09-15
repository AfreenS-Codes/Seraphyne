from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from app.schemas.case import Case

CASES_DIR = Path(__file__).resolve().parent


class CaseNotFoundError(Exception):
    pass


@lru_cache
def _load_all_cases() -> dict[str, Case]:
    cases: dict[str, Case] = {}
    for path in sorted(CASES_DIR.glob("*.json")):
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        case = Case.model_validate(data)
        cases[case.id] = case
    return cases


def list_cases() -> list[Case]:
    return list(_load_all_cases().values())


def get_case(case_id: str) -> Case:
    cases = _load_all_cases()
    if case_id not in cases:
        raise CaseNotFoundError(f"Case '{case_id}' not found")
    return cases[case_id]
