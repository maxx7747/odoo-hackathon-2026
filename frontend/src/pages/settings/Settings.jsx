import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import Layout from '../../components/layout/Layout.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Pill from '../../components/ui/Pill.jsx'
import ResourceFormModal from '../../components/ui/ResourceFormModal.jsx'
import { departments, categories, esgConfig, employees } from '../../lib/api.js'

const TABS = ['Departments', 'Categories', 'ESG Configuration', 'Notification Settings']

const DEPT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
const CATEGORY_TYPE_OPTIONS = [
  { value: 'csr_activity', label: 'CSR Activity' },
  { value: 'challenge', label: 'Challenge' },
]

function Toggle({ checked, onChange, label, hint }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink-100 bg-card p-4">
      <div>
        <p className="text-sm font-medium text-ink-700">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-moss-500' : 'bg-ink-100'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const [active, setActive] = useState(TABS[0])
  const [deptList, setDeptList] = useState([])
  const [catList, setCatList] = useState([])
  const [config, setConfig] = useState(null)
  const [notifChannels, setNotifChannels] = useState({ inApp: true, email: true })
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [showNewDept, setShowNewDept] = useState(false)
  const [showNewCat, setShowNewCat] = useState(false)

  function reload() {
    departments.list().then(setDeptList)
    categories.list().then(setCatList)
    esgConfig.get().then((c) => setConfig(Array.isArray(c) ? c[0] : c))
    employees.list().then((rows) => setEmployeeOptions(rows.map((e) => ({ value: e.id, label: e.name }))))
  }

  useEffect(() => {
    reload()
  }, [])

  function updateWeight(field, value) {
    setConfig((c) => {
      const weights = { ...c.weights, [field]: Number(value) }
      esgConfig.update({ weights })
      return { ...c, weights }
    })
  }

  function updateToggle(field, value) {
    setConfig((c) => ({ ...c, [field]: value }))
    esgConfig.update({ [field]: value })
  }

  async function createDepartment(values) {
    await departments.create({
      name: values.name,
      code: values.code,
      head: values.head || null,
      status: values.status || 'active',
    })
    reload()
  }

  async function createCategory(values) {
    await categories.create({
      name: values.name,
      type: values.type,
      status: values.status || 'active',
    })
    reload()
  }

  const weightTotal = config ? config.weights.environmental + config.weights.social + config.weights.governance : 0

  return (
    <Layout title="Settings">
      <Tabs tabs={TABS} active={active} onChange={setActive} />

      {active === 'Departments' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowNewDept(true)}
              className="flex items-center gap-1.5 rounded-lg bg-moss-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-moss-600"
            >
              <Plus size={15} /> Add Department
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'code', header: 'Code' },
              { key: 'head', header: 'Head' },
              { key: 'employeeCount', header: 'Employees' },
              { key: 'status', header: 'Status', render: (r) => <Pill>{r.status}</Pill> },
            ]}
            rows={deptList}
          />
        </div>
      )}

      {active === 'Categories' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowNewCat(true)}
              className="flex items-center gap-1.5 rounded-lg bg-moss-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-moss-600"
            >
              <Plus size={15} /> Add Category
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'type', header: 'Type', render: (r) => <Pill tone={r.type === 'CSR Activity' ? 'blue' : 'gold'}>{r.type}</Pill> },
              { key: 'status', header: 'Status', render: (r) => <Pill>{r.status}</Pill> },
            ]}
            rows={catList}
          />
        </div>
      )}

      {active === 'ESG Configuration' && config && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-ink-100 bg-card p-5 shadow-soft">
            <p className="mb-1 text-sm font-medium text-ink-700">Overall score weighting</p>
            <p className="mb-4 text-xs text-ink-400">
              Determines how each pillar's average department score rolls up into the Overall ESG Score. Must total 100%.
            </p>
            {['environmental', 'social', 'governance'].map((field) => (
              <div key={field} className="mb-3 flex items-center gap-3">
                <label className="w-32 text-sm capitalize text-ink-600">{field}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.weights[field]}
                  onChange={(e) => updateWeight(field, e.target.value)}
                  className="flex-1 accent-moss-500"
                />
                <span className="w-12 text-right font-mono text-sm text-ink-700">{config.weights[field]}%</span>
              </div>
            ))}
            <p className={`text-xs ${weightTotal === 100 ? 'text-moss-600' : 'text-brick-600'}`}>
              Total: {weightTotal}% {weightTotal !== 100 && '— weights should sum to 100%'}
            </p>
          </div>

          <Toggle
            label="Auto Emission Calculation"
            hint="Carbon Transactions are calculated automatically from linked Purchase / Manufacturing / Expense / Fleet records."
            checked={config.autoEmissionCalculation}
            onChange={(v) => updateToggle('autoEmissionCalculation', v)}
          />
          <Toggle
            label="Evidence Requirement"
            hint="CSR Activity participation cannot be marked Approved without an attached proof file."
            checked={config.evidenceRequired}
            onChange={(v) => updateToggle('evidenceRequired', v)}
          />
          <Toggle
            label="Badge Auto-Award"
            hint="A Badge is automatically assigned the moment an employee's tracked metric satisfies its Unlock Rule."
            checked={config.badgeAutoAward}
            onChange={(v) => updateToggle('badgeAutoAward', v)}
          />
        </div>
      )}

      {active === 'Notification Settings' && (
        <div className="max-w-2xl space-y-4">
          <Toggle label="In-app notifications" checked={notifChannels.inApp} onChange={(v) => setNotifChannels((c) => ({ ...c, inApp: v }))} />
          <Toggle label="Email notifications" checked={notifChannels.email} onChange={(v) => setNotifChannels((c) => ({ ...c, email: v }))} />
          <div className="rounded-xl border border-ink-100 bg-card p-5 shadow-soft">
            <p className="mb-3 text-sm font-medium text-ink-700">Sent for</p>
            <ul className="space-y-2 text-sm text-ink-500">
              <li>• New compliance issue raised</li>
              <li>• CSR / Challenge approval decisions</li>
              <li>• Policy acknowledgement reminders</li>
              <li>• Badge unlocks</li>
            </ul>
          </div>
        </div>
      )}

      <ResourceFormModal
        open={showNewDept}
        title="Add Department"
        onClose={() => setShowNewDept(false)}
        onSubmit={createDepartment}
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'code', label: 'Code', type: 'text', required: true, help: 'Short unique code, e.g. ENG' },
          { name: 'head', label: 'Department head', type: 'select', options: employeeOptions },
          { name: 'status', label: 'Status', type: 'select', options: DEPT_STATUS_OPTIONS, defaultValue: 'active' },
        ]}
      />

      <ResourceFormModal
        open={showNewCat}
        title="Add Category"
        onClose={() => setShowNewCat(false)}
        onSubmit={createCategory}
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'type', label: 'Type', type: 'select', options: CATEGORY_TYPE_OPTIONS, required: true },
          { name: 'status', label: 'Status', type: 'select', options: DEPT_STATUS_OPTIONS, defaultValue: 'active' },
        ]}
      />
    </Layout>
  )
}
