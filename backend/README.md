# EcoSphere — ESG Management Platform (Django backend)

A Django + Django REST Framework backend implementing the EcoSphere ESG Management
Platform spec: Environmental, Social, Governance and Gamification modules, wired
together with the business rules from Section 8 (auto emission calc, evidence
requirement, badge auto-award, reward redemption, notifications, compliance
overdue flagging) and the reporting suite from Section 7.

## 1. Project layout

```
ecosphere/
  ecosphere/         # project settings, root urls
  core/               # Department, Employee, Category, SystemSettings (the config toggles)
  environmental/      # EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction
  social/             # CSRActivity, EmployeeParticipation, DiversityMetric, TrainingCompletion
  governance/         # ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue
  gamification/       # Badge, EmployeeBadge, Reward, RewardRedemption, Challenge, ChallengeParticipation
  scoring/            # DepartmentScore, OrganizationScore + the weighted-average scoring engine
  notifications/      # Notification, NotificationSetting + the central notify() helper
  reports/            # SavedReport + the 4 fixed reports and the Custom Report Builder (PDF/Excel/CSV)
```

Each app follows the same shape: `models.py`, `admin.py`, `serializers.py`,
`views.py` (DRF ViewSets), `urls.py` (DRF router). Cross-cutting business logic
lives in each app's `services.py`, and side effects (points/XP awarding, badge
checks, notifications) are wired via Django signals in `signals.py`.

## 2. Setup

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py makemigrations   # already generated, but harmless to re-run
python manage.py migrate
python manage.py seed_demo_data   # optional: populates demo departments, employees,
                                   # activities, badges, scores, etc. Creates a
                                   # superuser admin / admin12345. Safe to re-run.
python manage.py runserver
```

Admin site: `http://127.0.0.1:8000/admin/`
API root: `http://127.0.0.1:8000/api/`

Authentication: DRF's session auth (works automatically once logged into
`/admin/`) plus token auth. Get a token:

```
POST /api/auth-token/   { "username": "...", "password": "..." }
```
then send `Authorization: Token <token>` on subsequent requests.

## 3. How each spec requirement maps to the code

### Master data (Section 4)
| Spec model | App / model |
|---|---|
| Department | `core.Department` |
| Category | `core.Category` (type = csr_activity / challenge) |
| Emission Factor | `environmental.EmissionFactor` |
| Product ESG Profile | `environmental.ProductESGProfile` |
| Environmental Goal | `environmental.EnvironmentalGoal` |
| ESG Policy | `governance.ESGPolicy` |
| Badge | `gamification.Badge` (unlock_rule is a small JSON rule, see below) |
| Reward | `gamification.Reward` |

### Transactional data
| Spec model | App / model |
|---|---|
| Carbon Transaction | `environmental.CarbonTransaction` (auto-computes `calculated_emission = quantity * emission_factor.factor_value` on save) |
| CSR Activity | `social.CSRActivity` |
| Employee Participation | `social.EmployeeParticipation` |
| Challenge | `gamification.Challenge` (Draft → Active → Under Review → Completed, or Archived) |
| Challenge Participation | `gamification.ChallengeParticipation` |
| Policy Acknowledgement | `governance.PolicyAcknowledgement` |
| Audit | `governance.Audit` |
| Compliance Issue | `governance.ComplianceIssue` (owner + due_date required; `is_overdue` property) |
| Department Score | `scoring.DepartmentScore` (+ `scoring.OrganizationScore` for the org-wide rollup) |

### Section 8 business rules — where they live
- **Reward Redemption** — `gamification.services.redeem_reward()`. Atomically checks
  `status`/`stock`/points balance, decrements stock, deducts points, creates a
  `RewardRedemption` row. Exposed as `POST /api/gamification/rewards/{id}/redeem/`.
- **Notification System** — `notifications.services.notify()` is the single entry
  point every other app calls. It respects each employee's per-type
  `NotificationSetting` (in-app/email toggle). Wired in via signals for: new
  compliance issue (`governance/signals.py`), CSR/Challenge approval decisions
  (`social/signals.py`, `gamification/signals.py`), badge unlocks
  (`gamification/services.check_and_award_badges`). Policy acknowledgement
  reminders are meant to be sent by a scheduled job (not included, since the spec
  doesn't define the reminder cadence — trivial to add as another management
  command following the pattern of `flag_overdue_compliance_issues`).
- **Auto Emission Calculation** — toggle lives on `core.SystemSettings.auto_emission_calculation`.
  When ON, the ERP-facing endpoint `POST /api/environmental/carbon-transactions/auto-ingest/`
  creates the `CarbonTransaction` automatically from a Purchase/Manufacturing/Expense/Fleet
  reference + Emission Factor. When OFF, that endpoint refuses and transactions
  must be entered manually via the normal `CarbonTransaction` endpoint.
- **Evidence Requirement** — toggle on `core.SystemSettings.evidence_required_for_csr`.
  Enforced in `social.serializers.EmployeeParticipationSerializer.validate()`: you
  cannot set `approval_status="approved"` without a `proof` file while the toggle is on.
  (Challenges have their own always-on per-challenge `evidence_required` flag,
  enforced the same way in `gamification.serializers.ChallengeParticipationSerializer`.)
- **Badge Auto-Award** — toggle on `core.SystemSettings.badge_auto_award`.
  `gamification.services.check_and_award_badges()` runs after every points/XP
  change and evaluates each active Badge's `unlock_rule` JSON against the
  employee's cached `total_xp` / `total_points` / `completed_challenge_count`.
  Example rule: `{"metric": "total_xp", "operator": ">=", "value": 500}`.
- **Compliance Issue Ownership** — `owner` and `due_date` are required
  (non-nullable) fields on `ComplianceIssue`. Overdue flagging is a management
  command: `python manage.py flag_overdue_compliance_issues` (schedule daily via
  cron/Celery beat) — flips status to `overdue` and notifies the owner.

### Section 5 — Business Workflow
`core.SystemSettings` holds the master configuration toggles. The
Purchase/Manufacturing/Expense/Fleet layer is outside this repo (that's your
existing ERP) — it talks to this platform through the auto-ingest endpoint
above. From there the flow is: CarbonTransaction → (Environmental/Social/Governance
scores per department, computed in `scoring.services.calculate_department_scores`)
→ DepartmentScore.total_score (weighted by `SystemSettings.weight_*`, default
40/30/30) → OrganizationScore (average of departments, same weights) → the
dashboard/report endpoints below.

Run scoring on a schedule with:
```bash
python manage.py recalculate_scores --period 2026-07-01 --start 2026-07-01 --end 2026-07-31
```
or on-demand via `POST /api/scoring/recalculate/` with the same 3 dates in the body.
**Note:** the exact E/S/G scoring formula isn't specified in the brief, so
`scoring/services.py` implements a documented, reasonable placeholder (goal
progress % for Environmental, CSR/training completion rate for Social, policy
acknowledgement + compliance resolution rate for Governance) — tune it to match
your judging rubric; nothing else in the app depends on the formula itself, only
on the resulting score rows.

### Section 6 — Expected Features → endpoints
All CRUD endpoints are standard DRF routers (list/create/retrieve/update/delete
at `/api/<app>/<resource>/`). Notable non-CRUD ones:

- `GET /api/core/employees/leaderboard/` — global XP leaderboard
- `GET /api/environmental/carbon-transactions/dashboard/` — Environmental Dashboard totals
- `POST /api/environmental/carbon-transactions/auto-ingest/` — ERP auto emission hook
- `POST /api/social/participations/{id}/` (PATCH `approval_status`) — approve/reject CSR participation (points auto-awarded)
- `POST /api/gamification/challenge-participations/{id}/` (PATCH `approval`) — approve/reject a challenge (XP auto-awarded)
- `POST /api/gamification/rewards/{id}/redeem/` — reward redemption
- `POST /api/governance/policy-acknowledgements/{id}/acknowledge/` — acknowledge a policy
- `GET /api/governance/compliance-issues/overdue/` — currently-overdue issues
- `GET /api/scoring/department-scores/rankings/?period=YYYY-MM-DD` — Department ESG rankings
- `GET /api/notifications/notifications/` + `POST .../{id}/mark_read/`

### Section 7 — Reports
Each of the 4 fixed reports plus the Custom Report Builder support
`?export_format=pdf|excel|csv` (defaults to pdf) and stream the file directly:

- `GET /api/reports/environmental/?department=&date_start=&date_end=`
- `GET /api/reports/social/?department=&date_start=&date_end=&employee=`
- `GET /api/reports/governance/?department=&date_start=&date_end=`
- `GET /api/reports/esg-summary/?department=&period=`
- `GET /api/reports/custom/?module=&department=&employee=&challenge=&esg_category=&date_start=&date_end=`
  (module = environmental / social / governance / gamification / all)

`SavedReport` (`/api/reports/saved-reports/`) lets the frontend persist a
named Custom Report Builder configuration for reuse.

### Gamification lifecycle
`Challenge.status`: Draft → Active → Under Review → Completed, or Archived at
any point (plain CharField with those choices — the frontend enforces/display
the transitions; add a state-machine validator if you want the API to reject
invalid transitions).

## 4. What's intentionally left for you to wire up
- **Frontend** — the `frontend/` folder at the repo root (React + Vite) is
  already wired to this backend's actual routes and proxied through Vite in
  dev; see the root `README.md` for the combined quick start.
  `django-cors-headers` is installed and `CORS_ALLOWED_ORIGINS` is set for
  `localhost:5173` in case you call the API directly instead of through the
  Vite proxy.
- **Email sending** for the "email" half of the Notification System —
  `Notification.channel` already records whether an email should also go out;
  hook `notifications/services.py::notify()` up to `django.core.mail.send_mail`
  (or Celery + a real mail backend) once you have SMTP/SES credentials.
- **Scheduling** — `flag_overdue_compliance_issues` and `recalculate_scores`
  are plain management commands; wire them to cron or Celery beat.
- **Production settings** — `DEBUG=True`, SQLite, and a placeholder
  `SECRET_KEY` are fine for a hackathon demo. Swap to Postgres +
  environment-based secrets before deploying for real.

## 5. Badge unlock_rule quick reference
```json
{"metric": "total_xp", "operator": ">=", "value": 500}
{"metric": "total_points", "operator": ">=", "value": 1000}
{"metric": "completed_challenge_count", "operator": ">=", "value": 10}
```
Supported operators: `>=`, `>`, `<=`, `<`, `==`.

## 6. Verified working (smoke-tested during build)
- Migrations apply cleanly on SQLite.
- Approving an `EmployeeParticipation` awards points, triggers badge
  auto-award, and fires a notification — confirmed end-to-end.
- Reward redemption deducts points/stock atomically and rejects
  insufficient-points/out-of-stock cases.
- `calculate_department_scores()` produces correct weighted totals using the
  configured 40/30/30 (or custom) weights.
- All 3 export formats (PDF via reportlab, Excel via openpyxl, CSV) generate
  valid files, including the multi-section Custom Report Builder output.
