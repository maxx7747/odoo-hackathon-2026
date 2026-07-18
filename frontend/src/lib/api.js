import axios from 'axios'
import * as mock from './mockData.js'

// -----------------------------------------------------------------------
// Base client
//
// Talks to the Django REST Framework backend in /backend. Each app in the
// backend mounts its own router under its own prefix (see backend/ecosphere/urls.py),
// e.g. /api/core/departments/, /api/environmental/carbon-transactions/, etc.
//
// In dev, Vite proxies /api -> http://127.0.0.1:8000 (see vite.config.js),
// so no CORS setup is needed locally. In prod, set VITE_API_BASE_URL to the
// deployed API origin (e.g. https://api.yourapp.com/api).
// -----------------------------------------------------------------------

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecosphere_token')
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

// When the backend isn't running yet (or VITE_USE_MOCKS=true), USE_MOCKS lets
// the whole UI render against realistic sample data instead of failing every
// request. Flip VITE_USE_MOCKS to "false" in .env once the Django server is
// running and seeded (see backend/README.md) to use real data.
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

// -----------------------------------------------------------------------
// Small helpers shared by the resource-specific transforms below. The
// backend returns raw, snake_case, foreign-key-as-ID data (standard DRF);
// every page component was built against the mock data's shape instead:
// human-readable display strings, resolved names instead of IDs, camelCase
// fields, and a few UI-only convenience fields (e.g. "Out of Stock").
// These helpers translate real API responses into that same shape so no
// page component needs to change.
// -----------------------------------------------------------------------

function capWords(value) {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function dateOnly(value) {
  if (!value) return null
  return String(value).slice(0, 10)
}

async function fetchRaw(path, params) {
  const res = await client.get(`/${path}/`, { params })
  return Array.isArray(res.data?.results) ? res.data.results : res.data
}

// id -> label lookups, fetched once per page load and cached for reuse
// across every resource transform that needs to resolve a foreign key.
const lookupCache = {}
function getLookup(name, path, labelFn) {
  if (!lookupCache[name]) {
    lookupCache[name] = fetchRaw(path)
      .then((rows) => {
        const map = {}
        for (const row of rows) map[row.id] = labelFn(row)
        return map
      })
      .catch(() => ({}))
  }
  return lookupCache[name]
}

const deptLookup = () => getLookup('departments', 'core/departments', (d) => d.name)
const empLookup = () => getLookup('employees', 'core/employees', (e) => e.full_name)
const catLookup = () => getLookup('categories', 'core/categories', (c) => c.name)
const activityLookup = () => getLookup('csrActivities', 'social/csr-activities', (a) => a.title)
const challengeLookup = () => getLookup('challenges', 'gamification/challenges', (c) => c.title)
const policyLookup = () => getLookup('policies', 'governance/policies', (p) => p.title)
const auditLookup = () => getLookup('audits', 'governance/audits', (a) => a.title)

// Employee -> department name, for resources (like TrainingCompletion) that
// only reference an employee, not a department, directly.
let empDeptLookupPromise = null
function empDeptLookup() {
  if (!empDeptLookupPromise) {
    empDeptLookupPromise = Promise.all([fetchRaw('core/employees'), deptLookup()]).then(
      ([employees, depts]) => {
        const map = {}
        for (const e of employees) map[e.id] = e.department ? depts[e.department] || '—' : '—'
        return map
      }
    )
  }
  return empDeptLookupPromise
}

// Runs `transformFn(rawRows)` against the live API; on any failure (backend
// down, network error, etc.) falls back to mock data, same as every other
// resource in this file.
async function listWithTransform(mockKey, path, transformFn) {
  if (USE_MOCKS) return mock.getMock(mockKey)
  try {
    const rows = await fetchRaw(path)
    return await transformFn(rows)
  } catch (err) {
    console.warn(`API call failed for "${mockKey}", falling back to mock data.`, err)
    return mock.getMock(mockKey)
  }
}

async function withMockFallback(mockKey, requestFn) {
  if (USE_MOCKS) {
    return mock.getMock(mockKey)
  }
  try {
    const res = await requestFn()
    // DRF paginates list responses as { count, next, previous, results: [...] }.
    // Every page component expects a bare array (matching the mock data shape),
    // so unwrap it here rather than in every single page.
    if (res.data && Array.isArray(res.data.results)) {
      return res.data.results
    }
    return res.data
  } catch (err) {
    console.warn(`API call failed for "${mockKey}", falling back to mock data.`, err)
    return mock.getMock(mockKey)
  }
}

// Generic REST resource factory matching DRF ViewSet routes. Used for the
// handful of resources whose real API shape already matches (or is close
// enough to) what the pages expect. `path` is the full path under /api,
// e.g. "core/departments".
function resource(path, mockKey) {
  return {
    list: (params) => withMockFallback(mockKey, () => client.get(`/${path}/`, { params })),
    get: (id) => withMockFallback(`${mockKey}:one`, () => client.get(`/${path}/${id}/`)),
    create: (payload) => (USE_MOCKS ? mock.mockCreate(mockKey, payload) : client.post(`/${path}/`, payload).then((r) => r.data)),
    update: (id, payload) => (USE_MOCKS ? mock.mockUpdate(mockKey, id, payload) : client.patch(`/${path}/${id}/`, payload).then((r) => r.data)),
    remove: (id) => (USE_MOCKS ? mock.mockRemove(mockKey, id) : client.delete(`/${path}/${id}/`)),
  }
}

// -----------------------------------------------------------------------
// Master data
// -----------------------------------------------------------------------

export const departments = {
  ...resource('core/departments', 'departments'),
  list: () =>
    listWithTransform('departments', 'core/departments', async (rows) => {
      const emp = await empLookup()
      return rows.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        head: d.head ? emp[d.head] || `#${d.head}` : '—',
        parent: d.parent_department,
        employeeCount: d.employee_count,
        status: capWords(d.status),
      }))
    }),
}

export const categories = {
  ...resource('core/categories', 'categories'),
  list: () =>
    listWithTransform('categories', 'core/categories', async (rows) =>
      rows.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type === 'csr_activity' ? 'CSR Activity' : 'Challenge',
        status: capWords(c.status),
      }))
    ),
}

const SOURCE_TYPE_LABEL = {
  purchase: 'Purchase',
  manufacturing: 'Manufacturing',
  expense: 'Expense',
  fleet: 'Fleet',
}

export const emissionFactors = {
  ...resource('environmental/emission-factors', 'emissionFactors'),
  list: () =>
    listWithTransform('emissionFactors', 'environmental/emission-factors', async (rows) =>
      rows.map((f) => ({
        id: f.id,
        name: f.name,
        scope: SOURCE_TYPE_LABEL[f.source_type] || capWords(f.source_type),
        unit: f.unit,
        factor: Number(f.factor_value),
        uom: `kg CO2e/${f.unit}`,
        status: capWords(f.status),
      }))
    ),
}

export const productESGProfiles = resource('environmental/product-profiles', 'productESGProfiles')

export const environmentalGoals = {
  ...resource('environmental/goals', 'environmentalGoals'),
  list: () =>
    listWithTransform('environmentalGoals', 'environmental/goals', async (rows) =>
      rows.map((g) => ({
        id: g.id,
        title: g.title,
        target: Number(g.target_value),
        unit: g.unit,
        deadline: dateOnly(g.end_date),
        progress: Math.round(g.progress_percent ?? 0),
        status: capWords(g.status),
      }))
    ),
}

export const esgPolicies = {
  ...resource('governance/policies', 'esgPolicies'),
  list: () =>
    listWithTransform('esgPolicies', 'governance/policies', async (rows) =>
      rows.map((p) => ({
        id: p.id,
        title: p.title,
        category: capWords(p.category),
        version: p.version,
        effectiveDate: dateOnly(p.effective_date),
        // The backend doesn't track a mandatory/optional flag per policy;
        // every seeded policy in this platform requires acknowledgement.
        mandatory: true,
        status: capWords(p.status),
      }))
    ),
}

export const badges = {
  ...resource('gamification/badges', 'badges'),
  list: () =>
    listWithTransform('badges', 'gamification/badges', async (rows) =>
      rows.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        unlockRule: b.unlock_rule,
        status: capWords(b.status),
      }))
    ),
}

export const rewards = {
  ...resource('gamification/rewards', 'rewards'),
  list: () =>
    listWithTransform('rewards', 'gamification/rewards', async (rows) =>
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        pointsRequired: r.points_required,
        stock: r.stock,
        status: r.stock <= 0 ? 'Out of Stock' : capWords(r.status),
      }))
    ),
}

// -----------------------------------------------------------------------
// Transactional data
// -----------------------------------------------------------------------

export const carbonTransactions = {
  ...resource('environmental/carbon-transactions', 'carbonTransactions'),
  list: () =>
    listWithTransform('carbonTransactions', 'environmental/carbon-transactions', async (rows) => {
      const [depts, factors] = await Promise.all([deptLookup(), getLookup('emissionFactors', 'environmental/emission-factors', (f) => f.name)])
      return rows.map((t) => ({
        id: t.id,
        date: dateOnly(t.transaction_date),
        department: t.department ? depts[t.department] || `#${t.department}` : '—',
        source: SOURCE_TYPE_LABEL[t.source_type] || capWords(t.source_type),
        emissionFactor: factors[t.emission_factor] || `#${t.emission_factor}`,
        quantity: Number(t.quantity),
        co2e: Number(t.calculated_emission),
      }))
    }),
}

export const csrActivities = {
  ...resource('social/csr-activities', 'csrActivities'),
  list: () =>
    listWithTransform('csrActivities', 'social/csr-activities', async (rows) => {
      const [depts, cats, participations] = await Promise.all([
        deptLookup(),
        catLookup(),
        fetchRaw('social/participations').catch(() => []),
      ])
      const participantCount = {}
      for (const p of participations) {
        participantCount[p.activity] = (participantCount[p.activity] || 0) + 1
      }
      return rows.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category ? cats[a.category] || `#${a.category}` : '—',
        department: a.department ? depts[a.department] || `#${a.department}` : '—',
        date: dateOnly(a.start_date),
        participants: participantCount[a.id] || 0,
        status: capWords(a.status),
      }))
    }),
}

const PARTICIPATION_STATUS_LABEL = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
const PARTICIPATION_STATUS_REVERSE = { Pending: 'pending', Approved: 'approved', Rejected: 'rejected' }

export const employeeParticipation = {
  list: () =>
    listWithTransform('employeeParticipation', 'social/participations', async (rows) => {
      const [emp, activities] = await Promise.all([empLookup(), activityLookup()])
      return rows.map((p) => ({
        id: p.id,
        employee: emp[p.employee] || `#${p.employee}`,
        activity: activities[p.activity] || `#${p.activity}`,
        proof: p.proof,
        approvalStatus: PARTICIPATION_STATUS_LABEL[p.approval_status] || capWords(p.approval_status),
        pointsEarned: p.points_earned,
        completionDate: dateOnly(p.completion_date),
      }))
    }),
  update: (id, payload) => {
    if (USE_MOCKS) return mock.mockUpdate('employeeParticipation', id, payload)
    const body = {}
    if (payload.approvalStatus) {
      body.approval_status = PARTICIPATION_STATUS_REVERSE[payload.approvalStatus] || payload.approvalStatus.toLowerCase()
    }
    return client.patch(`/social/participations/${id}/`, body).then((r) => r.data)
  },
}

export const challenges = {
  ...resource('gamification/challenges', 'challenges'),
  list: () =>
    listWithTransform('challenges', 'gamification/challenges', async (rows) => {
      const cats = await catLookup()
      return rows.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category ? cats[c.category] || `#${c.category}` : '—',
        description: c.description,
        xp: c.xp,
        difficulty: capWords(c.difficulty),
        evidenceRequired: c.evidence_required,
        deadline: dateOnly(c.deadline),
        status: capWords(c.status),
      }))
    }),
}

export const challengeParticipation = {
  ...resource('gamification/challenge-participations', 'challengeParticipation'),
  list: () =>
    listWithTransform('challengeParticipation', 'gamification/challenge-participations', async (rows) => {
      const [emp, chals] = await Promise.all([empLookup(), challengeLookup()])
      return rows.map((p) => ({
        id: p.id,
        challenge: chals[p.challenge] || `#${p.challenge}`,
        employee: emp[p.employee] || `#${p.employee}`,
        progress: p.progress,
        proof: p.proof,
        approval: capWords(p.approval),
        xpAwarded: p.xp_awarded,
      }))
    }),
}

export const policyAcknowledgements = {
  ...resource('governance/policy-acknowledgements', 'policyAcknowledgements'),
  list: () =>
    listWithTransform('policyAcknowledgements', 'governance/policy-acknowledgements', async (rows) => {
      const [emp, policies] = await Promise.all([empLookup(), policyLookup()])
      return rows.map((a) => ({
        id: a.id,
        employee: emp[a.employee] || `#${a.employee}`,
        policy: policies[a.policy] || `#${a.policy}`,
        acknowledgedOn: dateOnly(a.acknowledged_at),
        status: capWords(a.status),
      }))
    }),
}

export const audits = {
  ...resource('governance/audits', 'audits'),
  list: () =>
    listWithTransform('audits', 'governance/audits', async (rows) =>
      rows.map((a) => ({
        id: a.id,
        title: a.title,
        scope: a.scope,
        auditor: a.auditor,
        date: dateOnly(a.audit_date),
        outcome: capWords(a.status),
        findingsSummary: a.findings_summary,
      }))
    ),
}

export const complianceIssues = {
  ...resource('governance/compliance-issues', 'complianceIssues'),
  list: () =>
    listWithTransform('complianceIssues', 'governance/compliance-issues', async (rows) => {
      const [emp, audits_] = await Promise.all([empLookup(), auditLookup()])
      return rows.map((c) => ({
        id: c.id,
        audit: audits_[c.audit] || `#${c.audit}`,
        severity: capWords(c.severity),
        description: c.description,
        owner: emp[c.owner] || `#${c.owner}`,
        dueDate: dateOnly(c.due_date),
        status: capWords(c.status),
      }))
    }),
}

export const departmentScores = {
  ...resource('scoring/department-scores', 'departmentScores'),
  list: () =>
    listWithTransform('departmentScores', 'scoring/department-scores', async (rows) =>
      rows.map((s) => ({
        id: s.id,
        department: s.department_name,
        environmental: Math.round(Number(s.environmental_score)),
        social: Math.round(Number(s.social_score)),
        governance: Math.round(Number(s.governance_score)),
        total: Math.round(Number(s.total_score)),
      }))
    ),
}

export const employees = {
  ...resource('core/employees', 'employees'),
  list: () =>
    listWithTransform('employees', 'core/employees', async (rows) => {
      const depts = await deptLookup()
      return rows.map((e) => ({
        id: e.id,
        name: e.full_name,
        department: e.department ? depts[e.department] || `#${e.department}` : '—',
        xp: e.total_xp,
        points: e.total_points,
        completedChallengeCount: e.completed_challenge_count,
      }))
    }),
}

export const diversityMetrics = {
  ...resource('social/diversity-metrics', 'diversityMetrics'),
  list: () =>
    listWithTransform('diversityMetrics', 'social/diversity-metrics', async (rows) => {
      const depts = await deptLookup()
      return rows.map((m) => {
        const total = m.total || m.male_count + m.female_count + m.non_binary_count + m.undisclosed_count || 1
        return {
          id: m.id,
          department: m.department ? depts[m.department] || `#${m.department}` : '—',
          womenPct: Math.round((m.female_count / total) * 100),
          genderDiversePct: Math.round((m.non_binary_count / total) * 100),
          underrepresentedPct: Math.round(((m.non_binary_count + m.undisclosed_count) / total) * 100),
          // Not tracked by this data model (no disability field on Employee/DiversityMetric).
          pwdPct: 0,
        }
      })
    }),
}

const TRAINING_STATUS_PCT = { completed: 100, in_progress: 50, overdue: 0 }

export const trainingCompletion = {
  ...resource('social/training-completions', 'trainingCompletion'),
  list: () =>
    listWithTransform('trainingCompletion', 'social/training-completions', async (rows) => {
      const empDepts = await empDeptLookup()
      return rows.map((t) => ({
        id: t.id,
        department: empDepts[t.employee] || '—',
        course: t.training_name,
        completionPct: TRAINING_STATUS_PCT[t.status] ?? 0,
        status: capWords(t.status),
      }))
    }),
}

// Aggregate dashboard endpoint: GET /api/core/dashboard-overview/
// (see backend/core/views.py::DashboardOverviewView). Falls back to mock
// data automatically if it's unreachable.
export const dashboard = {
  overview: () => withMockFallback('dashboardOverview', () => client.get('/core/dashboard-overview/')),
}

export const reports = {
  generate: (payload) =>
    USE_MOCKS
      ? Promise.resolve({ status: 'ok', message: 'Mock report generated (connect backend to export real files).' })
      : client.post('/reports/custom/', payload).then((r) => r.data),
}

const NOTIFICATION_TYPE_LABEL = {
  compliance_issue_raised: 'Compliance',
  csr_approval_decision: 'Approval',
  challenge_approval_decision: 'Approval',
  policy_ack_reminder: 'Policy',
  badge_unlocked: 'Badge',
  compliance_issue_overdue: 'Compliance',
}

// Reward redemption is a custom action on the backend (POST /rewards/{id}/redeem/,
// body { employee }), not a plain CRUD endpoint, since it validates point
// balance and stock server-side (see gamification/services.py::redeem_reward).
export const rewardRedemptions = {
  redeem: (rewardId, employeeId) => {
    if (USE_MOCKS) {
      return mock.mockUpdate('rewards', rewardId, {}) // no-op in mock mode, nothing to validate
    }
    return client.post(`/gamification/rewards/${rewardId}/redeem/`, { employee: employeeId }).then((r) => r.data)
  },
}

export const notifications = {
  ...resource('notifications/notifications', 'notifications'),
  list: () =>
    listWithTransform('notifications', 'notifications/notifications', async (rows) =>
      rows.map((n) => ({
        id: n.id,
        type: NOTIFICATION_TYPE_LABEL[n.type] || capWords(n.type),
        message: n.message,
        date: dateOnly(n.created_at),
        read: n.is_read,
      }))
    ),
}

// SystemSettings on the backend is a singleton APIView (GET/PATCH /api/core/settings/,
// no id in the URL) with flat snake_case fields, while the UI works with a nested,
// camelCase shape. These helpers translate between the two.
function toFrontendConfig(d) {
  return {
    id: 1,
    weights: {
      environmental: Number(d.weight_environmental),
      social: Number(d.weight_social),
      governance: Number(d.weight_governance),
    },
    autoEmissionCalculation: d.auto_emission_calculation,
    evidenceRequired: d.evidence_required_for_csr,
    badgeAutoAward: d.badge_auto_award,
  }
}

function toBackendConfig(payload) {
  const fieldMap = {
    autoEmissionCalculation: 'auto_emission_calculation',
    evidenceRequired: 'evidence_required_for_csr',
    badgeAutoAward: 'badge_auto_award',
  }
  const out = {}
  for (const [key, value] of Object.entries(payload)) {
    if (fieldMap[key]) out[fieldMap[key]] = value
  }
  if (payload.weights) {
    if (payload.weights.environmental != null) out.weight_environmental = payload.weights.environmental
    if (payload.weights.social != null) out.weight_social = payload.weights.social
    if (payload.weights.governance != null) out.weight_governance = payload.weights.governance
  }
  return out
}

export const esgConfig = {
  get: async () => {
    if (USE_MOCKS) return mock.getMock('esgConfig')
    try {
      const res = await client.get('/core/settings/')
      return toFrontendConfig(res.data)
    } catch (err) {
      console.warn('API call failed for "esgConfig", falling back to mock data.', err)
      return mock.getMock('esgConfig')
    }
  },
  update: async (payload) => {
    if (USE_MOCKS) return mock.mockUpdate('esgConfig', 1, payload)
    const res = await client.patch('/core/settings/', toBackendConfig(payload))
    return toFrontendConfig(res.data)
  },
}

// The backend uses DRF's standard obtain_auth_token endpoint (POST username +
// password -> { token }), not a custom /auth/login/ route, and doesn't return
// user profile info from that endpoint - so we build a minimal user object
// client-side from the username that was typed in.
export const auth = {
  login: async (username, password) => {
    if (USE_MOCKS) {
      return { token: 'mock-token', user: { username, name: 'Demo Admin', role: 'ESG Administrator' } }
    }
    const res = await client.post('/auth-token/', { username, password })
    return { token: res.data.token, user: { username, name: username, role: 'ESG User' } }
  },
}
