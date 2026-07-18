import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Plus, Check, X as XIcon } from 'lucide-react'
import Layout from '../../components/layout/Layout.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Pill from '../../components/ui/Pill.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import ResourceFormModal from '../../components/ui/ResourceFormModal.jsx'
import { csrActivities, employeeParticipation, diversityMetrics, trainingCompletion, categories, departments } from '../../lib/api.js'

const TABS = ['CSR Activities', 'Employee Participation', 'Diversity Metrics', 'Training Completion']

const CSR_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export default function SocialDashboard() {
  const [active, setActive] = useState(TABS[0])
  const [activities, setActivities] = useState([])
  const [participation, setParticipation] = useState([])
  const [diversity, setDiversity] = useState([])
  const [training, setTraining] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [showNewActivity, setShowNewActivity] = useState(false)

  function reload() {
    csrActivities.list().then(setActivities)
    employeeParticipation.list().then(setParticipation)
    diversityMetrics.list().then(setDiversity)
    trainingCompletion.list().then(setTraining)
  }

  useEffect(() => {
    reload()
    categories.list().then((rows) => setCategoryOptions(rows.filter((c) => c.type === 'CSR Activity').map((c) => ({ value: c.id, label: c.name }))))
    departments.list().then((rows) => setDepartmentOptions(rows.map((d) => ({ value: d.id, label: d.name }))))
  }, [])

  function decide(id, status) {
    setParticipation((prev) => prev.map((p) => (p.id === id ? { ...p, approvalStatus: status } : p)))
    employeeParticipation.update(id, { approvalStatus: status })
  }

  async function createActivity(values) {
    await csrActivities.create({
      title: values.title,
      category: values.category || null,
      department: values.department || null,
      description: values.description,
      start_date: values.start_date,
      end_date: values.end_date,
      points_value: Number(values.points_value) || 0,
      status: values.status || 'draft',
    })
    reload()
  }

  return (
    <Layout title="Social">
      <Tabs tabs={TABS} active={active} onChange={setActive} />

      {active === 'CSR Activities' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowNewActivity(true)}
              className="flex items-center gap-1.5 rounded-lg bg-moss-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-moss-600"
            >
              <Plus size={15} /> New CSR Activity
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'title', header: 'Activity' },
              { key: 'category', header: 'Category' },
              { key: 'department', header: 'Department' },
              { key: 'date', header: 'Date' },
              { key: 'participants', header: 'Participants' },
            ]}
            rows={activities}
          />
        </div>
      )}

      {active === 'Employee Participation' && (
        <DataTable
          columns={[
            { key: 'employee', header: 'Employee' },
            { key: 'activity', header: 'Activity' },
            { key: 'proof', header: 'Proof', render: (r) => (r.proof ? r.proof : '— (evidence required)') },
            { key: 'approvalStatus', header: 'Status', render: (r) => <Pill>{r.approvalStatus}</Pill> },
            { key: 'pointsEarned', header: 'Points' },
          ]}
          rows={participation}
          actions={(r) =>
            r.approvalStatus !== 'Approved' ? (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => decide(r.id, 'Approved')}
                  disabled={!r.proof}
                  title={!r.proof ? 'Evidence required before approval' : 'Approve'}
                  className="rounded-lg bg-moss-50 p-1.5 text-moss-700 hover:bg-moss-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check size={14} />
                </button>
                <button onClick={() => decide(r.id, 'Rejected')} className="rounded-lg bg-brick-100 p-1.5 text-brick-700 hover:bg-brick-100/70">
                  <XIcon size={14} />
                </button>
              </div>
            ) : null
          }
        />
      )}

      {active === 'Diversity Metrics' && (
        <div className="rounded-2xl border border-ink-100 bg-card p-6 shadow-soft">
          <p className="mb-4 text-sm font-medium text-ink-500">Representation by department</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={diversity}>
              <CartesianGrid stroke="#dfe7e2" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#5c7d6d' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5c7d6d' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #dfe7e2', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="womenPct" name="Women" fill="#3A6EA5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="underrepresentedPct" name="Underrepresented groups" fill="#6B4A7A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pwdPct" name="Persons with disabilities" fill="#C9A24B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {active === 'Training Completion' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {training.map((t) => (
            <div key={t.id} className="rounded-xl border border-ink-100 bg-card p-5 shadow-soft">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-ink-800">{t.course}</p>
                <span className="font-mono text-sm text-ink-500">{t.completionPct}%</span>
              </div>
              <ProgressBar value={t.completionPct} colorClass="bg-sky-500" />
              <p className="mt-2 text-xs text-ink-400">{t.department}</p>
            </div>
          ))}
        </div>
      )}

      <ResourceFormModal
        open={showNewActivity}
        title="New CSR Activity"
        onClose={() => setShowNewActivity(false)}
        onSubmit={createActivity}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'category', label: 'Category', type: 'select', options: categoryOptions },
          { name: 'department', label: 'Department', type: 'select', options: departmentOptions },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'start_date', label: 'Start date', type: 'date', required: true },
          { name: 'end_date', label: 'End date', type: 'date', required: true },
          { name: 'points_value', label: 'Points value', type: 'number', defaultValue: 0 },
          { name: 'status', label: 'Status', type: 'select', options: CSR_STATUS_OPTIONS, defaultValue: 'draft' },
        ]}
      />
    </Layout>
  )
}
