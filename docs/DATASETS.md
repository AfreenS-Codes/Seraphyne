# SERAPHYNE — Dataset Documentation

This document records every dataset used anywhere in the SERAPHYNE platform,
per the project's credible-data requirement. No fabricated, randomly
invented, or purely synthetic data is used as evidence for the ML model or
as a clinical knowledge source. Where synthetic/simulation data appears
(case-session logs, demo accounts), it is clearly labeled as such below and
is never presented as real clinical evidence.

---

## 1. UCI Heart Disease Dataset (Cleveland subset) — used for the trained ML model

- **Dataset name:** Heart Disease (Cleveland Clinic Foundation subset), commonly
  distributed as `heart.csv` / `processed.cleveland.data`.
- **Source:** UCI Machine Learning Repository, donated by Andras Janosi (Hungarian
  Institute of Cardiology, Budapest), William Steinbrunn (University Hospital,
  Zurich), Matthias Pfisterer (University Hospital, Basel), and Robert Detrano
  (V.A. Medical Center, Long Beach and Cleveland Clinic Foundation).
- **Canonical reference:** UCI ML Repository, "Heart Disease" dataset,
  https://archive.ics.uci.edu/dataset/45/heart+disease (original data
  collection published 1988).
- **File actually fetched for this build (mirror, since the sandbox network
  allowlist does not include archive.ics.uci.edu):**
  `https://raw.githubusercontent.com/kb22/Heart-Disease-Prediction/master/dataset.csv`
  — this is the widely-used, byte-identical-to-Kaggle "Heart Disease UCI"
  303-row CSV that is the de facto standard mirror of the Cleveland subset
  used across the ML education community. Saved locally at
  `ml/data/heart_raw.csv` (`sha256` recorded in `ml/data/heart_raw.sha256`).
- **Description:** 303 patient records from the Cleveland Clinic Foundation.
  Each row is one patient with clinical/demographic features and a label
  for presence of heart disease (derived from angiographic disease status).
- **Fields used (all 13 original feature columns):**
  `age`, `sex`, `cp` (chest pain type), `trestbps` (resting blood pressure),
  `chol` (serum cholesterol), `fbs` (fasting blood sugar > 120 mg/dl),
  `restecg` (resting ECG results), `thalach` (max heart rate achieved),
  `exang` (exercise-induced angina), `oldpeak` (ST depression induced by
  exercise), `slope` (slope of peak exercise ST segment), `ca` (number of
  major vessels colored by fluoroscopy), `thal` (thalassemia test result).
- **Label used:** `target` — binary, 1 = presence of heart disease
  (angiographic diameter narrowing > 50% in ≥1 major vessel), 0 = absence.
  This is the standard binarization of the original 0–4 severity scale used
  in essentially all published work on this dataset.
- **Preprocessing:** see `ml/preprocessing/`. Column types cast; no missing
  values were present in this mirror (checked programmatically — the
  original UCI file has a handful of `?` missing values in `ca`/`thal`,
  already dropped/imputed upstream in this popular mirror). Numeric features
  are standardized (zero mean, unit variance) fit on the **training split
  only**, to avoid leakage. Categorical features (`sex`, `cp`, `fbs`,
  `restecg`, `exang`, `slope`, `thal`) are one-hot encoded, fit on the
  training split only.
- **Train/validation/test split:** stratified 60/20/20 split by `target`,
  fixed `random_state=42` for reproducibility (`ml/preprocessing/split.py`).
  The test set is held out and touched exactly once, only for final
  reporting, never during model selection or hyperparameter tuning.
- **Licensing:** UCI ML Repository datasets are provided for research and
  educational use; this specific dataset has no explicit restrictive license
  attached and is ubiquitously used in ML coursework and research. SERAPHYNE
  uses it strictly for educational, non-commercial, in-app teaching
  purposes and cites the original donors above. No patient-identifying
  information is present (fully de-identified, aggregate clinical
  variables only).
- **Limitations (reported honestly, not hidden):**
  - Only 303 records — small by modern ML standards; expect wider confidence
    intervals on held-out metrics than a large clinical dataset would give.
  - This popular mirror is known in the ML community to contain a small
    number of out-of-documented-range categorical codes (e.g. `ca` values
    up to 4, though the original UCI codebook documents 0–3; `thal` coded
    as {0,1,2,3} in this mirror vs. {3,6,7} in the original codebook). These
    are treated as their own categorical levels during one-hot encoding
    rather than silently "corrected," and are called out here rather than
    hidden.
  - **This mirror's `cp` and `exang` columns correlate with `target` in the
    opposite direction from the standard clinical convention** — verified
    directly on this file (`df.groupby("cp")["target"].mean()`): `cp=0`
    ("typical angina" in the usual UCI codebook) has only a 27% disease
    rate here, while `cp=1–3` have 70–82%; similarly `exang=1`
    (exercise-induced angina, clinically a positive finding) correlates
    with a *lower* disease rate (23%) than `exang=0` (70%). This is a
    widely-noted quirk/mislabeling in this specific popular mirror, not
    something introduced by this project. Because of this, the flagship
    ACS case's `ml_feature_hint` (`clinical-engine/app/cases/acs_001.json`)
    is deliberately set to match this dataset's *actual empirical* high-risk
    encoding rather than the textbook clinical convention, so the demo
    prediction is consistent with how the trained model actually reads the
    data — this mismatch between the dataset's coding and standard clinical
    teaching is itself called out in the UI-facing disclaimer as a dataset
    limitation, not hidden.
  - Single-institution-era, 1988 patient population (Cleveland, Hungary,
    Switzerland, Long Beach VA) — not representative of a modern, diverse
    patient population, and must not be used to make real clinical
    decisions about any actual patient.
  - This dataset predicts presence of *coronary artery disease* from
    resting/exercise clinical variables. It is a **teaching-only surrogate
    model**, not a validated diagnostic tool, and SERAPHYNE labels every ML
    output accordingly in the UI.
- **Why this dataset is appropriate for the task:** SERAPHYNE's MVP domain is
  Cardiology, and this is one of the most credible, widely cited, and
  actually obtainable real clinical datasets directly relevant to
  cardiology diagnostic reasoning (chest pain type, ECG findings, exercise
  test results, coronary risk factors — the same clinical vocabulary as the
  flagship ACS case). It genuinely supports a real, labeled, binary
  classification task ("does this patient's clinical profile indicate
  coronary artery disease"), unlike forcing an unsupported task onto MedQA
  (see below).

## 2. MedQA — used for medical-knowledge retrieval, NOT for training this ML model

- **Dataset name:** MedQA (USMLE-style multiple-choice medical QA).
- **Source / reference:** Jin et al., "What Disease Does This Patient Have? A
  Large-scale Open Domain Question Answering Dataset from Medical Exams"
  (2021); repository: https://github.com/jind11/MedQA.
- **Where it is actually used in SERAPHYNE:** the separately-built SERAPHYNE
  AI Study Companion service (external microservice, integrated over HTTP —
  see Phase 16 / `backend/src/services/aiCompanion.ts`) uses MedQA as a
  retrieval corpus for grounding its tutoring answers (`MedQARetriever` in
  that service). It is **not** re-downloaded or retrained inside this
  platform's `ml/` pipeline.
- **What MedQA is explicitly NOT used for:** MedQA contains exam questions,
  answer options, and (where available) explanations — it does **not**
  contain student reasoning trajectories, student mistake logs, or
  SERAPHYNE case-session data. It is never used, and must never be
  described, as a source of "student reasoning" training data. SERAPHYNE's
  reasoning-error labels (Phase 8) come from the platform's own structured,
  clinician-authored case definitions and the student's own recorded
  actions during a session — not from MedQA.

## 3. Flagship Cardiology case content (ACS and others)

- **Source:** hand-authored, deterministic case definitions in
  `clinical-engine/app/cases/*.json`, written against standard, widely
  taught clinical teaching sources for Acute Coronary Syndrome recognition
  and management (e.g. the general diagnostic pattern taught from the
  Fourth Universal Definition of Myocardial Infarction (Thygesen et al.,
  2018) and standard ACS/NSTEMI-STEMI teaching pathways used in MBBS/USMLE
  curricula). No LLM is used to generate the medical ground truth, evidence
  weights, outcome branches, or counterfactual branches — these are
  structured, versioned, reviewer-attributable JSON authored for this
  build.
- **Reviewer status field:** every case file carries a `metadata.reviewer`
  object. For this MVP build, cases are marked
  `"status": "author-drafted, pending clinician review"` — **SERAPHYNE does
  not claim clinical validation by a qualified clinician for this MVP
  build**, and the UI must not claim otherwise until that review actually
  happens. This is intentional and required by the project's data-integrity
  rules.
- **Evidence basis field:** each investigation/finding in a case carries an
  `evidence_basis` string citing the general teaching principle it reflects
  (e.g. "troponin rise/fall pattern with at least one value above the 99th
  percentile URL, per the Fourth Universal Definition of MI").

## 4. Synthetic / simulation-only data (clearly labeled, never presented as clinical evidence)

- **Demo student account and demo case-session history**
  (`backend/src/scripts/seed.ts`): fabricated for UI/software testing and
  demo purposes only. Clearly named `demo@seraphyne.app` / session IDs
  prefixed `demo-`. Never used as ML training data, never presented as a
  real patient or real learner.
- **Bayesian network conditional probability tables**
  (`clinical-engine/app/bayesian/acs_network.py`): these are **illustrative,
  order-of-magnitude teaching estimates** loosely informed by the general
  diagnostic literature on ACS pretest probability and troponin/ECG
  likelihood ratios, not fitted to a specific dataset. This is standard
  practice for an educational Bayesian teaching tool, and the UI/API
  explicitly labels every Bayesian output as *"educational model output,
  not a real-world clinical probability."*
