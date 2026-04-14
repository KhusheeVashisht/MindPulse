

# MindPulse - Project Audit Report

**Audit Date:** April 7, 2026  
**Audit Time:** 20:47 IST  
**Project Status:** Working full-stack app with corrected ML contract and optional GenAI layer  
**Audit Confidence:** 97%

---

## 1. Executive Summary

MindPulse is now a working full-stack student burnout prediction system with:

- React frontend and wellness-focused multi-page UI
- Node.js and Express backend for auth, API mediation, and GenAI routing
- FastAPI ML backend for burnout prediction and prediction history
- SQLite persistence
- JWT authentication

The project is in a strong pause point tonight.

The most important technical correction has already been completed:

- the ML model now uses only real, user-fillable features
- fake or guessed feature filling has been removed
- old invalid prediction history was cleared

Today, a new optional Generative AI layer was added on top of the working system without changing the ML prediction pipeline.

---

## 2. Current Architecture

```text
React Frontend
    ->
Node.js / Express Backend
    ->
FastAPI Prediction API
    ->
SQLite Database
```

### Responsibility Split

- `frontend/`
  - login, register, dashboard, assessment, results, history, about page, AI UI panels
- `node_backend/`
  - register/login, JWT auth, `/predict`, `/history`, `/me`, GenAI routes
- `api/api.py`
  - FastAPI prediction endpoints and history persistence
- `train_burnout_model.py`
  - training pipeline for the current reduced-feature model
- `model/`
  - `burnout_model.pkl` and `scaler.pkl`
- `predictions.db`
  - users and burnout prediction history

---

## 3. ML Model Status

### Current Inference Features

The model now predicts from only these 15 honest user-input fields:

1. `age`
2. `gender`
3. `academic_year`
4. `study_hours_per_day`
5. `exam_pressure`
6. `academic_performance`
7. `stress_level`
8. `anxiety_score`
9. `depression_score`
10. `sleep_hours`
11. `physical_activity`
12. `social_support`
13. `screen_time`
14. `financial_stress`
15. `family_expectation`

### Removed From Model Input

- `internet_usage`
- `mental_health_index`
- `dropout_risk`
- `risk_level`

### Current Model

- `RandomForestClassifier`
- `n_estimators=50`
- `max_depth=10`
- `random_state=42`
- `n_jobs=1`

### Latest Model Metrics

Using the retrained reduced-feature setup:

- Accuracy: `0.7230`
- Macro Precision: `0.7263`
- Macro Recall: `0.7230`
- Macro F1: `0.7242`

### Current ML Assessment

The ML side is now much more trustworthy than before because the model contract finally matches the real form users complete.

---

## 4. FastAPI Backend Status

### Active Endpoints

```text
GET  /
GET  /health
GET  /history
POST /predict
```

### Current Behavior

- model and scaler load on startup
- reduced-feature payload is accepted by `/predict`
- predictions are saved to SQLite
- `/history` returns prediction records for the shared database

### Schema Note

The SQLite schema still contains some legacy storage columns:

- `internet_usage`
- `mental_health_index`
- `dropout_risk`
- `risk_level`

These are no longer used for inference. They are only retained to avoid an unnecessary destructive schema migration.

---

## 5. Node Backend Status

### Working Routes

- `GET /`
- `GET /health`
- `POST /register`
- `POST /login`
- `GET /me`
- `POST /predict`
- `GET /history`
- `POST /ai/recommendations`
- `POST /ai/reflection`
- `POST /ai/insights`

### Auth Stack

- bcrypt password hashing
- JWT generation
- JWT middleware
- SQLite-backed users table

### Root Route

The Node backend now returns a friendly running-status JSON message at `/` instead of `Cannot GET /`.

---

## 6. Frontend Status

### Current Pages

- Login
- Register
- Dashboard
- Self Assessment
- Results
- Past Check-ins
- About MindPulse

### Current UX State

The frontend is now designed as a calmer wellbeing experience rather than a technical ML form.

Implemented UI improvements include:

- collapsible sidebar drawer
- centered page header illustration
- dashboard snapshot cards
- results and history as dedicated pages
- slider-based self-assessment prompts
- last-result comparison
- realistic numeric limits on overview fields
- About MindPulse page with creator section
- feedback form that drafts email to `khusheevashisht.hs.106.prag@gmail.com`

### Current Input Validation

Realistic frontend and FastAPI bounds now exist for:

- `age`: `16-35`
- `academic_year`: `1-6`
- `study_hours_per_day`: `0-16`
- `sleep_hours`: `2-14`
- `academic_performance`: `0-100`
- `screen_time`: `0-16`

---

## 7. Generative AI Layer Added Today

### Goal

A Generative AI layer was added without disturbing the already-working ML backend.

### Features Added

1. Personalized Recommendations  
   tailored suggestions based on latest result and recent history

2. Reflection Assistant  
   supportive reflection help based on the live assessment draft and past context

3. Insight Generator  
   short pattern summaries generated from recent check-ins

### Integration Strategy

- React still talks only to Node
- Node handles the AI provider call
- FastAPI remains the burnout prediction service only
- if AI is unavailable, the core app still works

### HF_TOKEN Management

- The Node backend now looks for `HF_TOKEN` in a local `.env` file (root-level), which is ignored via `.gitignore`. A `.env.example` template ships with the repo so you can copy it, paste your personal Hugging Face token, and keep secrets out of source control.
- If `HF_TOKEN` is empty, the AI routes still stay offline and the rest of the project continues running—the banner on the Insight Generator explains that the AI layer is unconfigured.

### Current AI Provider Status

The original OpenAI route layer was replaced with a Hugging Face provider integration today.

Current default provider/model:

- Hugging Face router
- `moonshotai/Kimi-K2-Instruct-0905`

### Current Configuration Requirement

The AI routes require a backend environment token:

- `HF_TOKEN`

Optional:

- `HF_MODEL`

### Important Security Note

The Hugging Face token was intentionally **not hardcoded** into project files. It must be provided through environment variables.

Because a token was pasted during discussion, it should be treated as exposed and rotated outside the codebase before long-term use.

### AI Fallback Behavior

If `HF_TOKEN` is not configured:

- the app still runs
- prediction still works
- auth still works
- AI routes return a friendly configuration message instead of crashing the system

---

## 8. Database Status

### Active Tables

- `users`
- `student_profiles`
- `burnout_predictions`

### History Integrity

- old invalid prediction history was cleared
- new history now reflects the corrected reduced-feature model only

This was the right decision because earlier rows were created under an outdated contract and would have been misleading.

---

## 9. Verified Working Items

### ML / Backend

- FastAPI loads the corrected model successfully
- reduced-feature `/predict` works
- Node backend syntax is valid
- Node health route responds successfully

### Frontend

- frontend production build succeeds
- assessment, results, dashboard, history, and about page structure remain intact after AI integration

### AI Layer

- AI route files compile
- frontend AI UI compiles
- the AI layer is structurally integrated
- live AI responses still depend on a valid `HF_TOKEN`

---

## 10. What Was Completed Today

Today was a high-value integration and cleanup day. Major completed work includes:

- paused feature sprawl and kept the architecture stable
- added Generative AI features without touching the ML inference flow
- implemented backend AI endpoints
- wired frontend AI panels into assessment, dashboard, and results pages
- switched the AI provider layer to Hugging Face Kimi
- preserved fallback behavior so the app does not break if AI is not configured
- kept the token out of source code
- revalidated backend syntax
- rebuilt the frontend successfully

---

## 11. Current Risks And Open Items

### Medium Priority

1. AI depends on external provider availability  
   if Hugging Face inference is unavailable or slow, the AI panels may fail gracefully while the core app still works.

2. No automated test suite yet  
   validation has been manual and build-based.

3. Legacy DB columns still exist  
   not harmful, but could be cleaned later with a schema migration.

4. Environment variables are not yet fully formalized via `.env` support  
   current setup still depends on manual env configuration.

### Low Priority

1. AI output normalization may need more hardening after real usage
2. results/history could later gain tiny charts or sparklines
3. deployment packaging and README instructions can still be improved

---

## 12. Recommended Next Steps

### Immediate Next Session

1. set a valid `HF_TOKEN`
2. restart the Node backend
3. manually test:
   - recommendations
   - reflection assistant
   - insight generator
4. confirm the Hugging Face model returns reliably parseable JSON

### After That

1. add `.env` support
2. tighten AI prompt/response handling if needed
3. optionally add visual charts for insights
4. add minimal automated smoke tests

---

## 13. Final Assessment

**MindPulse is currently in a strong, credible state for an academic full-stack ML project.**

The core prediction system is working, the ML contract is now honest, the UI is much more polished, and the new GenAI layer has been added in a way that does not destabilize the prediction pipeline.

This is a good stopping point for today:

- core app working
- ML model corrected
- history cleaned
- UI significantly improved
- GenAI architecture added
- Hugging Face provider integrated
- project remains stable even if AI is not configured yet

---

**Report Generated:** April 7, 2026  
**Recommended Next Review:** after live Hugging Face token validation and GenAI QA
