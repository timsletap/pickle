# Copilot / Agent Instructions — Pickle

Short, actionable notes to make an AI coding agent productive in this repo.

## Big picture
- Two small halves: a TypeScript Expo (React Native) frontend in `app/` and a minimal FastAPI backend in `backend/app/` backed by SQLite (`backend/pickle.db`).
- Frontend uses Expo Router (file-based routing), `react-native-paper` for UI, and Firebase Auth (dev keys in `FirebaseConfig.ts`).
- Backend is intentionally lightweight: routers in `backend/app/routes/*.py`, synchronous `sqlite3` usage, no Pydantic models or DI.

## Run & debug (quick commands)
- Frontend (local dev):
  - Install: `npm install`
  - Start: `npm run start` (or `npm run ios` / `npm run android` / `npx expo start`)
  - Useful script: `npm run reset-project` (moves starter code to `app-example` and creates a blank `app/`).
- Backend (local dev):
  - From `backend/`: create venv and install: `pip install fastapi uvicorn`
  - Initialize DB: `python init_db.py` (writes `backend/pickle.db` from `backend/app/schema.sql`).
  - Run: `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
  - Note: CORS is not configured — use `CORSMiddleware` or a tunnel (ngrok) when calling from devices/emulators.

## Conventions & patterns (do this, not that)
- Routing: Add screens by creating files under `app/`. Tabs live under `app/(tabs)/` and tab layout is `app/(tabs)/_layout.tsx`.
- Auth: `FirebaseConfig.ts` exports `auth` used in `app/auth.tsx`. On successful login the app calls `router.replace("/(tabs)")`.
- Backend endpoints: Functions accept query/body params and return plain dicts/lists. Example: `create_lineup(team_id: int, game_date: str, is_optimal: int = 0) -> POST /lineups/`.
- DB changes: Edit `backend/app/schema.sql` and re-run `python init_db.py` to regenerate `backend/pickle.db` (ephemeral local DB).
- Keep changes small and consistent with current lightweight style (avoid introducing Pydantic/DI unless intentionally refactoring).

## Typical small tasks (step-by-step examples)
- Add an endpoint: 1) add SQL to `schema.sql` (if needed), 2) re-run `init_db.py`, 3) add a route in `backend/app/routes/`, 4) include it in `backend/app/main.py`, 5) document in `README.md`.
- Add a screen/tab: create `app/(tabs)/newScreen.tsx` exporting a default React component (use `react-native-paper` components), the router will pick it up automatically.
- Connect mobile -> backend: either enable `CORSMiddleware` in FastAPI or expose `localhost:8000` via tunnel (ngrok / localtunnel) for a device.

## Gotchas & notes
- SQLite is opened synchronously per-request; watch for concurrency and lock errors when writing large batches.
- `FirebaseConfig.ts` contains dev API keys — treat as dev-only and prefer env vars for production/sensitive work.
- No tests or CI are present; add tests under `backend/tests` or `app/__tests__` if you add behaviour to validate.

## Where to look (key files)
- Frontend: `app/`, `app/(tabs)/_layout.tsx`, `app/auth.tsx`, `FirebaseConfig.ts`, `package.json` (scripts)
- Backend: `backend/app/routes/*.py`, `backend/app/main.py`, `backend/app/schema.sql`, `backend/init_db.py`, `backend/db.py`

If any part should be expanded (examples, troubleshooting steps, or testing guidelines), tell me which areas you want prioritized and I'll iterate. Thank you!