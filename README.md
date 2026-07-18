# EcoSphere — ESG Management Platform

A full-stack ESG (Environmental, Social, Governance) management platform:
carbon tracking, CSR activities, policy/compliance management, an XP/badge/
rewards gamification layer, department & org-wide ESG scoring, and a report
builder (PDF/Excel/CSV).

- **Backend:** Django + Django REST Framework (`/backend`)
- **Frontend:** React + Vite + Tailwind CSS (`/frontend`)
- **Database:** SQLite by default (zero setup — swap for Postgres in
  production, see `backend/README.md`)

This repo has been verified to run end-to-end: migrations apply cleanly, the
seed script populates realistic demo data, and the frontend correctly talks
to every real backend endpoint through the Vite dev proxy (auth, ESG config,
scoring, gamification, etc. were all smoke-tested together).

## Quick start

You'll run two servers side by side — backend on port 8000, frontend on port
5173. Open two terminals.

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py seed_demo_data # populates demo data + creates admin/admin12345
python manage.py runserver
```

Backend is now running at `http://127.0.0.1:8000`. Admin panel:
`http://127.0.0.1:8000/admin/` (login `admin` / `admin12345`).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

By default the frontend renders against built-in **mock data** so it looks
complete even with no backend running — good for a first look or a quick
screenshot. To see it driven by the real Django API and the seeded demo
data instead:

1. Open `frontend/.env` and change `VITE_USE_MOCKS` to `false`.
2. Make sure the backend (above) is running and seeded.
3. Reload the page. Log in with any seeded user, e.g. `admin` / `admin12345`,
   or `priya.sharma` / `demo12345`.

**How to tell which one you're looking at:** every page has a small badge
next to its title — green **"Live data"** means it's talking to your Django
backend; gold **"Demo data"** means `VITE_USE_MOCKS` is still `true`; red
**"Demo data (backend unreachable)"** means mocks are off but the backend
isn't reachable at `/api`. If you ever see gold or red and expected live
data, that badge tells you exactly what to fix.

Every "+ New / Add" button across the app creates a real record through the
backend (CSR Activities, Policies, Audits, Challenges, Departments,
Categories, Emission Factors, Carbon Transactions) and reward redemption
calls the real point-balance-checked `/redeem/` endpoint — none of them are
decorative.

Any single API call that fails (e.g. an endpoint with no backend equivalent —
see `frontend/README.md`) transparently falls back to mock data instead of
breaking the page, so the app stays demoable either way.

## Project structure

```
EcoSphere-ESG-Platform/
  backend/     Django REST API — see backend/README.md for the full
               module-by-module breakdown and every endpoint
  frontend/    React app — see frontend/README.md for component/page layout
               and design notes
```

## Publishing this to GitHub

```bash
cd EcoSphere-ESG-Platform
git init
git add .
git commit -m "EcoSphere ESG Management Platform"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Both `backend/.gitignore` and `frontend/.gitignore` already exclude
`venv/`, `node_modules/`, `db.sqlite3`, and `.env` — so nothing sensitive or
bulky gets committed. `db.sqlite3` isn't included in this repo on purpose;
running `migrate` + `seed_demo_data` recreates it in seconds.

**Before you push:** update the `git remote add origin` URL above with a
repo you've created on GitHub first (GitHub → New repository → don't
initialize with a README, since this one already has one).

## What to say about it on LinkedIn

A few genuinely true, specific things this project demonstrates, in case
you want them in your post:

- 8-module Django REST API (environmental, social, governance, gamification,
  scoring, notifications, reports, core) with signal-driven side effects —
  approving a CSR activity automatically awards points, checks badge unlock
  rules, and fires a notification, with no manual wiring per feature.
- A configurable weighted ESG scoring engine (department + org-wide,
  environmental/social/governance weights adjustable from Settings).
- A React frontend built mock-first (works standalone for demos) and
  swappable to the live API with one env flag, with graceful per-request
  fallback if any single call fails.
- PDF/Excel/CSV report generation for 4 fixed reports plus a custom report
  builder.
