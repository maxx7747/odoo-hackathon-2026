import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Plus } from 'lucide-react'
import Layout from '../../components/layout/Layout.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import Pill from '../../components/ui/Pill.jsx'
import ResourceFormModal from '../../components/ui/ResourceFormModal.jsx'
import { emissionFactors, carbonTransactions, environmentalGoals, departmentScores, departments } from '../../lib/api.js'

const TABS = ['Emission Factors', 'Carbon Transactions', 'Department Tracking', 'Sustainability Goals']

const SOURCE_TYPE_OPTIONS = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'expense', label: 'Expense' },
  { value: 'fleet', label: 'Fleet' },
]
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function EnvironmentalDashboard() {
  const [active, setActive] = useState(TABS[0])
  const [factors, setFactors] = useState([])
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [scores, setScores] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [factorOptions, setFactorOptions] = useState([])
  const [showNewFactor, setShowNewFactor] = useState(false)
  const [showNewTransaction, setShowNewTransaction] = useState(false)

  function reload() {
    emissionFactors.list().then((rows) => {
      setFactors(rows)
      setFactorOptions(rows.map((f) => ({ value: f.id, label: `${f.name} (${f.uom})` })))
    })
    carbonTransactions.list().then(setTransactions)
    environmentalGoals.list().then(setGoals)
    departmentScores.list().then(setScores)
  }

  useEffect(() => {
    reload()
    departments.list().then((rows) => setDepartmentOptions(rows.map((d) => ({ value: d.id, label: d.name }))))
  }, [])

  async function createFactor(values) {
    await emissionFactors.create({
      name: values.name,
      source_type: values.source_type,
      unit: values.unit,
      factor_value: values.factor_value,
      status: values.status || 'active',
    })
    reload()
  }

  async function createTransaction(values) {
    await carbonTransactions.create({
      department: values.department || null,
      source_type: values.source_type,
      emission_factor: values.emission_factor,
      quantity: values.quantity,
      transaction_date: values.transaction_date,
    })
    reload()
  }

  return (
    <Layout title="Environmental">
      <Tabs tabs={TABS} active={active} onChange={setActive} />

      {active === 'Emission Factors' && (
        <Section
          action="Add Emission Factor"
          onAction={() => setShowNewFactor(true)}
          table={
            <DataTable
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'scope', header: 'Scope' },
                { key: 'unit', header: 'Unit' },
                { key: 'factor', header: 'Factor', render: (r) => `${r.factor} ${r.uom}` },
              ]}
              rows={factors}
            />
          }
        />
      )}

      {active === 'Carbon Transactions' && (
        <Section
          action="Log Transaction"
          onAction={() => setShowNewTransaction(true)}
          table={
            <DataTable
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'department', header: 'Department' },
                { key: 'source', header: 'Source' },
                { key: 'emissionFactor', header: 'Emission Factor' },
                { key: 'quantity', header: 'Quantity' },
                { key: 'co2e', header: 'CO2e (kg)', render: (r) => r.co2e.toLocaleString() },
              ]}
              rows={transactions}
            />
          }
        >
          <p className="mb-4 text-xs text-ink-400">
            When <span className="font-medium text-ink-600">Auto Emission Calculation</span> is enabled in Settings, these rows are generated
            automatically from linked Purchase / Manufacturing / Expense / Fleet records.
          </p>
        </Section>
      )}

      {active === 'Department Tracking' && (
        <div className="rounded-2xl border border-ink-100 bg-card p-6 shadow-soft">
          <p className="mb-4 text-sm font-medium text-ink-500">Environmental score by department</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scores}>
              <CartesianGrid stroke="#dfe7e2" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#5c7d6d' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#5c7d6d' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #dfe7e2', fontSize: 12 }} />
              <Bar dataKey="environmental" fill="#2F6B4F" radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {active === 'Sustainability Goals' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((g) => (
            <div key={g.id} className="rounded-xl border border-ink-100 bg-card p-5 shadow-soft">
              <div className="mb-3 flex items-start justify-between">
                <p className="font-medium text-ink-800">{g.title}</p>
                <Pill>{g.status}</Pill>
              </div>
              <ProgressBar value={g.progress} />
              <div className="mt-2 flex justify-between text-xs text-ink-400">
                <span>{g.progress}% of {g.target}{g.unit.includes('%') ? '%' : ''} target</span>
                <span>Due {g.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResourceFormModal
        open={showNewFactor}
        title="Add Emission Factor"
        onClose={() => setShowNewFactor(false)}
        onSubmit={createFactor}
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'source_type', label: 'Source type', type: 'select', options: SOURCE_TYPE_OPTIONS, required: true },
          { name: 'unit', label: 'Unit', type: 'text', required: true, help: 'e.g. kWh, litre, kg, km' },
          { name: 'factor_value', label: 'Factor (kg CO2e per unit)', type: 'number', required: true },
          { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, defaultValue: 'active' },
        ]}
      />

      <ResourceFormModal
        open={showNewTransaction}
        title="Log Carbon Transaction"
        onClose={() => setShowNewTransaction(false)}
        onSubmit={createTransaction}
        fields={[
          { name: 'department', label: 'Department', type: 'select', options: departmentOptions },
          { name: 'source_type', label: 'Source type', type: 'select', options: SOURCE_TYPE_OPTIONS, required: true },
          { name: 'emission_factor', label: 'Emission factor', type: 'select', options: factorOptions, required: true },
          { name: 'quantity', label: 'Quantity', type: 'number', required: true },
          { name: 'transaction_date', label: 'Date', type: 'date', required: true },
        ]}
      />
    </Layout>
  )
}

function Section({ action, onAction, table, children }) {
  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>{children}</div>
        <button
          onClick={onAction}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-moss-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-moss-600"
        >
          <Plus size={15} /> {action}
        </button>
      </div>
      {table}
    </div>
  )
}
