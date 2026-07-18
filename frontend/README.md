# EcoSphere — ESG Management Platform (Frontend)

React + Vite + Tailwind frontend for the EcoSphere ESG Management Platform,
built to sit in front of a Django REST Framework backend.

## Stack

- **React 18** with **react-router-dom** for routing
- **Tailwind CSS** for styling (custom ESG design tokens in `tailwind.config.js`)
- **Recharts** for charts, hand-rolled SVG for the tree-ring ESG score visual
- **Axios** for API calls
- **lucide-react** for icons

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`. By default it renders against
realistic **mock data** (`src/lib/mockData.js`) so the whole UI works before
your Django backend is ready.

## Connecting to the Django backend

This frontend is wired to the actual `backend/` app in this repo — see the
root `README.md` for the combined quick start. Short version:

1. Get the backend running and seeded (see `backend/README.md`).
2. Set `VITE_USE_MOCKS=false` in `.env`.
3. `npm run dev` — `vite.config.js` proxies `/api/*` to
   `http://127.0.0.1:8000` in dev, so no CORS setup is needed locally. For
   production, set `VITE_API_BASE_URL` to your deployed API origin.

`src/lib/api.js` calls the backend's real, namespaced DRF routes (each app
mounts under its own prefix, e.g. `/api/core/departments/`,
`/api/environmental/carbon-transactions/`, `/api/governance/policies/`, etc.)
and includes small adapters for the two places the shapes differ:

- **Auth** — the backend exposes DRF's standard token endpoint
  (`POST /api/auth-token/` → `{ token }`), not a custom `/auth/login/` route.
  `auth.login()` calls it and builds a minimal user object client-side.
- **ESG Configuration** — the backend's `SystemSettings` is a singleton
  (`GET/PATCH /api/core/settings/`) with flat snake_case fields; `esgConfig`
  translates to/from the nested camelCase shape the Settings page uses.

One endpoint has **no backend equivalent** and always falls back to mock
data: `dashboard.overview()`. The backend doesn't define a single combined
"overview" endpoint — the Dashboard page instead calls it optimistically and
silently uses mock numbers. If you want it live, add a small view in
`backend/core/views.py` that aggregates `OrganizationScore`,
`CarbonTransaction`, and `ComplianceIssue` and point this call at it.

Every other resource call automatically falls back to mock data too if the
backend call fails (e.g. backend not running yet), so the UI never breaks —
check the browser console for a warning when that happens.

## Project structure

```
src/
  components/
    layout/        Sidebar, Topbar, page shell
    ui/             ScoreRing, StatCard, DataTable, Pill, Modal, Tabs, ...
  lib/
    api.js          Resource client + mock fallback
    mockData.js      Sample data matching the Suggested Data Model
  pages/
    Dashboard.jsx           Overview (ESG score rings, trends)
    environmental/          Emission Factors, Carbon Transactions,
                             Department Tracking, Sustainability Goals
    social/                 CSR Activities, Participation, Diversity,
                             Training Completion
    governance/             Policies, Acknowledgements, Audits,
                             Compliance Issues
    gamification/           Challenges, Badges, Rewards, Leaderboard
    reports/                Standard reports + Custom Report Builder
    settings/               Departments, Categories, ESG Configuration,
                             Notification Settings
```

## Design notes

The signature visual is the **ESG Score Ring** (`components/ui/ScoreRing.jsx`)
on the Overview page — concentric rings modeled on tree growth rings, where
ring thickness maps to each pillar's weight in the scoring formula
(Environmental 40% / Social 30% / Governance 30%) and each ring fills to
that pillar's score. It's the same visual language used sparingly elsewhere
(moss/sky/plum accent colors for Environmental/Social/Governance).

## Business rules already wired into the UI

- Reward redemption is blocked once stock hits zero.
- CSR/Challenge approval buttons are disabled until proof is attached
  (Evidence Requirement toggle, configurable in Settings).
- Compliance Issues past their due date while still open are flagged
  automatically in the Governance tab.
- Badge cards are labeled "Auto-awarded" to reflect the Badge Auto-Award
  business rule — no manual assignment action is exposed by design.
- ESG Configuration weight sliders warn if the three weights don't total 100%.
