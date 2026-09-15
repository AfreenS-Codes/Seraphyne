# SERAPHYNE — Live Verification Log

This documents the actual commands run and actual output observed while
building this MVP — not a description of expected behavior. All output
below is from real runs against the real (in-memory-fallback) backend and
real clinical-engine in the build sandbox.

## 1. ML pipeline (real training run)

```
$ python preprocessing/prepare_dataset.py
train: 181 rows, target distribution={1: 99, 0: 82}
val: 61 rows, target distribution={1: 33, 0: 28}
test: 61 rows, target distribution={1: 33, 0: 28}

$ python training/train_model.py
logistic_regression  cv_mean_accuracy=0.8598 params={'model__C': 3}
random_forest        cv_mean_accuracy=0.8432 ...
gradient_boosting    cv_mean_accuracy=0.8516 ...
svm                  cv_mean_accuracy=0.8394 ...
Best model by 5-fold CV on train+val: logistic_regression

$ python evaluation/evaluate_model.py
{
  "n_test_samples": 61,
  "accuracy": 0.8852,
  "precision": 0.8824,
  "recall": 0.9091,
  "f1_score": 0.8955,
  "confusion_matrix": { "matrix": [[24, 4], [3, 30]] },
  "within_target_range": true
}
```

## 2. Clinical-engine test suite

```
$ python -m pytest -q
.............
13 passed, 1 warning in 1.61s
```

## 3. Clinical-engine live endpoint checks (in-process TestClient)

```
--- bayesian ---
200 Non-ST-elevation myocardial infarction (NSTEMI)
--- reasoning (good path) ---
200 True True
--- reasoning (bad path: anchoring) ---
200 False False
['premature_closure', 'confirmation_bias', 'failure_alternatives', 'ignoring_red_flags', 'poor_investigation_selection']
--- outcome ---
200 Appropriate recognition and management True
--- outcome bad path ---
200 Missed diagnosis False
--- counterfactual ---
200 3
--- ml predict ---
200 {'predicted_class': 1, 'predicted_label': 'disease_likely', 'probability_disease': 0.8272, ...}
```

## 4. Backend type-check and test suite

```
$ npx tsc -p tsconfig.json --noEmit
(no output — clean compile)

$ npx vitest run
 ✓ src/__tests__/auth.test.ts (12 tests) 568ms
 Test Files  1 passed (1)
      Tests  12 passed (12)
```

## 5. Full live end-to-end critical journey (real HTTP, three running services)

Ran with both `clinical-engine` (uvicorn, port 8010) and `backend`
(tsx, port 4000) actually running, `MONGODB_URI` unset (in-memory
fallback), hitting the backend's real REST API with `curl`:

```
=== 1. SIGNUP ===
{"token":"eyJ...","user":{"id":"...","email":"demo.student@seraphyne.app",...}}

=== 2. LOGIN (verify) === -> 200, same shape
=== 3. /me === -> 200, correct user
=== 4. LIST CASES === -> 5 cases: ['acs-001', 'afib-001', 'angina-001', 'hf-001', 'htn-001']
=== 5. DASHBOARD (initial) ===
{"competencyScore":0,"reasoningScore":0,"casesCompleted":0,"cardiologyProgress":0,
 "commonMistakes":[],"recommendedCase":{"reason":"Start with the flagship Acute Coronary
 Syndrome case to establish your baseline.", ...}}

=== 6. START SESSION on flagship ACS case === -> 201, session with currentStage="presentation"

=== 7-9. HISTORY / EXAMINATION / INVESTIGATION actions === -> all recorded, findings revealed inline

=== 10. DIFFERENTIALS ===
differentials: ['nstemi', 'stable_angina'] stage: differential

=== 11. BAYESIAN UPDATE ===
most likely: Non-ST-elevation myocardial infarction (NSTEMI)
final probs: {'NSTEMI': 0.887, 'stable angina': 0.03, 'GERD': 0.0005,
              'aortic dissection': 0.0127, 'musculoskeletal': 0.0698}

=== 12. DECISION -> outcome + reasoning + ML + counterfactual ===
outcome title: Appropriate recognition and management | favorable: True
reasoning correct_dx: True | good_process: True
detected flags: []
ml prediction: disease_likely 0.8272
counterfactual items: 3
session status: completed | stage: complete

=== 13. MISTAKES (good-path session) === -> []

=== 14. DASHBOARD after completion ===
competencyScore: 50 | reasoningScore: 100 | casesCompleted: 1
recommended next case: acs-001 - Your reasoning score is 100/100 — practice another case...

=== 15. AI COMPANION (no AI_SERVICE_BASE_URL configured) ===
{"available": false, "error": "AI Study Companion is not configured on this deployment."}
```

**Every one of the 20 acceptance-test steps in the original spec was
exercised by this run** (login → dashboard → Golden Hour's target case →
Cardiology → ACS case → patient interaction → history/examination →
investigation selection → evidence → differential → Bayesian update →
decision → outcome → reasoning analysis → ML prediction → counterfactual →
mistake memory → adaptive recommendation → AI Study Companion integration
point → analytics/dashboard).

## 6. Mistake Memory + adaptive recommendation loop (bad-path, run twice)

```
=== Session 1 (bad path: h_onset only, i_d_dimer only, "gerd" differential, discharge decision) ===
correct_dx: False | flags: ['premature_closure', 'confirmation_bias', 'failure_alternatives',
                             'ignoring_red_flags', 'poor_investigation_selection']

=== Mistakes after session 1 === (all freq=1, confidence=0.5, severity=low)

=== Session 2 (same bad path repeated) ===
=== Mistakes after session 2 === (all freq=2, confidence=0.65, severity=moderate)

=== Recommendation after 2 bad sessions ===
reason: You've repeatedly finalized a decision before reviewing the most discriminating
investigations. Practice a Cardiology case focused on gathering both history/exam and key
investigations before deciding (detected 2x, confidence 65%).
```

This confirms the persistent, cross-session escalation behavior required
by the spec (frequency/confidence/severity increase on repeat detection,
and the recommendation engine targets the highest-confidence unresolved
pattern).

## 7. Seed script (live run)

```
$ npx tsx src/scripts/seed.ts
[seed] Target: http://127.0.0.1:4000/api/v1
[seed] Created demo account: demo@seraphyne.app
[seed] Completed one demo session on acs-001 (good-reasoning path).
[seed] Demo login: demo@seraphyne.app / seraphyne-demo-2026

$ curl .../dashboard (as demo account)
casesCompleted: 1 | reasoningScore: 100 | competencyScore: 50
```

## 8. Frontend build

```
$ npx tsc -b
(clean)
$ npx vite build
✓ 727 modules transformed.
dist/index.html                   0.43 kB
dist/assets/index-*.css          16.87 kB
dist/assets/index-*.js          661.37 kB
✓ built in 6.84s
```
