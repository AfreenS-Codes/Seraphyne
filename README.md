# SERAPHYNE — Cardiology Clinical Reasoning MVP

A domain-first medical education platform. This MVP implements **Cardiology
only** end-to-end: login → dashboard → Golden Hour → flagship Acute Coronary
Syndrome case → history/examination/investigations → differential diagnosis
→ Bayesian probability update → clinical decision → outcome → reasoning
analysis → ML prediction → counterfactual analysis → Mistake Memory →
adaptive recommendation → AI Study Companion integration → analytics.

**Every step above was verified live**, over real HTTP, across the actually
running services in this build (not just files existing — see
`docs/VERIFICATION_LOG.md` for the full transcript).

This is the **main SERAPHYNE platform**. The AI Study Companion is a
separate, already-built service (delivered earlier), integrated here only
as an HTTP adapter (`backend/src/services/aiCompanionService.ts`) — it is
not rebuilt in this repo.

---

## 1. Architecture

```
seraphyne/
├── frontend/          React + TypeScript + Vite + Tailwind + Recharts
├── backend/            Node + Express + TypeScript (auth, sessions, mistakes, recommendations)
├── clinical-engine/    Python + FastAPI (cases, Bayesian engine, reasoning, outcome, counterfactual, ML client)
├── ml/                 Real trained ML model (UCI Heart Disease dataset)
├── docs/                DATASETS.md, VERIFICATION_LOG.md
├── database/            (MongoDB has no schema files of its own — see backend/src/models)
├── scripts/
└── docker-compose.yml
```

**Request flow for a case session:**
```
Frontend (React)
   │  JWT-authenticated REST calls
   ▼
Backend (Node/Express) ── MongoDB (or in-memory fallback — see §6)
   │  owns: auth, CaseSession/StudentAction state, Mistake Memory,
   │        Competency, Recommendations, AI Companion adapter
   │  HTTP calls for pure computation:
   ▼
Clinical-engine (FastAPI) ── ml/ (trained model, imported directly)
   owns: case content (hidden ground truth never leaves this service),
         Bayesian engine, reasoning analysis, outcome/counterfactual engines
```

This split matches the tech-stack requirement (Node/Express + MongoDB for
the platform, Python/FastAPI for clinical/Bayesian/ML) without introducing
unnecessary microservices — clinical-engine is the one Python service,
called synchronously by the backend.

## 2. How to run it

### Option A — Docker Compose (production-shaped path)

```bash
cd seraphyne
docker compose --profile train run ml-train   # trains + evaluates the ML model once, writes ml/artifacts/
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Clinical-engine: http://localhost:8010/docs (Swagger)
- MongoDB: real `mongo:7` image, persisted in a named volume

### Option B — Local dev (what was actually used to verify this build)

```bash
# 1. Clinical-engine
cd clinical-engine
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8010 &

# 2. Train the ML model once (writes ml/artifacts/best_model.joblib)
cd ../ml
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python preprocessing/prepare_dataset.py
python training/train_model.py
python evaluation/evaluate_model.py

# 3. Backend
cd ../backend
npm install
cp .env.example .env   # leave MONGODB_URI blank for the in-memory fallback, or point it at a real Mongo
npm run dev

# 4. (optional) Seed a demo account with one completed session
npm run seed

# 5. Frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

Demo login (after running `npm run seed` in `backend/`):
`demo@seraphyne.app` / `seraphyne-demo-2026`

## 3. What's genuinely working (priorities 1–9, all verified live)

1. **Cardiology simulation** — 5 structured cases (flagship ACS +
   angina/heart failure/AFib/hypertensive emergency), deterministic JSON,
   no LLM-generated medical ground truth anywhere.
2. **Bayesian engine** — real sequential likelihood-ratio (log-odds)
   evidence update, not a lookup table. Converges from a 35% NSTEMI prior to
   ~89% after ECG + troponin evidence, live-verified. Labeled everywhere as
   an educational model output.
3. **Real, trained ML model** — UCI Heart Disease dataset, proper
   train/val/test split, cross-validated model selection, **88.5% held-out
   test accuracy** (never fabricated — see `ml/README.md`).
4. **Reasoning analysis** — 9 rule-based educational reasoning-error
   patterns (premature closure, anchoring, confirmation bias, etc.),
   distinct from "correct diagnosis."
5. **Outcome + counterfactual** — deterministic, authored branches per
   case; no LLM invents outcomes.
6. **Mistake Memory** — persistent, cross-session pattern tracking with
   frequency/confidence/severity escalation, verified across two sessions.
7. **Adaptive recommendations** — explainable, driven by the top
   unresolved mistake pattern (or competency/case-difficulty fallback).
8. **Dashboard + analytics** — competency score, reasoning score, cases
   completed, common mistakes, recommended next case, improvement trend
   chart (Recharts).
9. **AI Study Companion integration point** — server-to-server adapter;
   API key never reaches the frontend; core platform continues working and
   shows the required message when the companion is unavailable (verified
   live with no `AI_SERVICE_BASE_URL` configured).

## 4. Known limitations / what's explicitly out of scope for this MVP

- **Institution dashboard (Phase 10)** was not built — out of scope per the
  stated priority order ("finish 1–7 before expanding anything else").
- **Only Cardiology is functional.** Other domains appear as "Coming Soon"
  cards in the UI and have no case content or simulation logic.
- **No real MongoDB was available in the build sandbox** (no internet
  access to MongoDB's own package repo, and Ubuntu's default repos no
  longer ship `mongodb-server`). The backend was built against real
  Mongoose schemas (`backend/src/models/`) that work unmodified against a
  real MongoDB (see docker-compose's `mongo:7` service) — but all local
  verification in this session ran against the documented in-memory
  fallback (`backend/src/repositories/createRepository.ts`), which is
  data-loss-on-restart by design and clearly logged as such at startup.
  **Before any real deployment, run it against Docker Compose's real Mongo
  at least once** to confirm the Mongoose path (the schemas are identical
  either way, but this specific combination wasn't re-verified after the
  in-memory-only development pass).
- **Frontend was verified by production build (`vite build` succeeds) and
  by the backend API calls it makes being individually verified live via
  curl** — it was not visually inspected in an actual browser (none
  available in this sandbox). Expect minor CSS/layout issues to shake out
  on first real run.
- **Backend automated tests** (`backend/src/__tests__/`) cover auth and
  route-protection (12 tests, all passing) but not the full session/
  Bayesian/mistake-memory flow, since that requires a live clinical-engine
  and would need HTTP mocking to run in isolation — that flow was instead
  verified via live, real end-to-end `curl` runs (see
  `docs/VERIFICATION_LOG.md`), which is stronger evidence than a mocked
  unit test, but is not a repeatable, CI-friendly automated test yet.
- **Institution/Domain/Case MongoDB models exist** but the backend doesn't
  yet sync clinical-engine case metadata into them automatically — cases
  are read live from clinical-engine on every request rather than cached in
  Mongo, which is simpler and always fresh but means the `Case` Mongoose
  model is currently unused by any route.
- **Golden Hour** launches the flagship ACS case directly; it isn't a
  separate timed/gamified mode — kept intentionally simple per the
  "avoid excessive gamification" style guidance.

## 5. Full credible-data documentation

See `docs/DATASETS.md` for the complete dataset inventory (source, fields,
labels, split, license, limitations, why each dataset was chosen) and
`ml/README.md` for the full ML methodology and honest, reproducible
results.

## 6. Data layer note (MongoDB vs. in-memory fallback)

`backend/src/repositories/createRepository.ts` implements a generic
repository factory: it uses real MongoDB (via the Mongoose schemas in
`backend/src/models/`) whenever `MONGODB_URI` is set and reachable, and
transparently falls back to an in-memory store otherwise. This is a
deliberate, logged, documented engineering choice made necessary by this
build sandbox having no path to a real MongoDB server — **not a hidden
limitation**. `docker-compose.yml` runs a real `mongo:7` image; set
`MONGODB_URI=mongodb://mongo:27017/seraphyne` (already wired in compose) to
use it.

## 7. Environment variables

**backend/.env**
```
PORT=4000
MONGODB_URI=                      # blank = in-memory fallback; or mongodb://...
JWT_SECRET=                       # set a real secret outside local dev
CLINICAL_ENGINE_BASE_URL=http://localhost:8010
AI_SERVICE_BASE_URL=              # SERAPHYNE AI Study Companion base URL
AI_SERVICE_API_KEY=               # never exposed to the frontend
CORS_ORIGIN=*
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

**clinical-engine** has no required env vars for this MVP (case content is
file-based; the ML model is loaded from `../ml/artifacts/`).

## 8. Testing

```bash
# clinical-engine (13 tests)
cd clinical-engine && source .venv/bin/activate && python -m pytest -q

# backend (12 tests)
cd backend && npm test

# frontend (build-verified, no unit tests written for this MVP)
cd frontend && npm run build
```

See `docs/VERIFICATION_LOG.md` for the full live end-to-end journey
transcript (the strongest evidence this MVP actually works, beyond
per-service unit tests).
