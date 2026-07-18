import { useEffect, useState } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import Layout from '../../components/layout/Layout.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Pill from '../../components/ui/Pill.jsx'
import ResourceFormModal from '../../components/ui/ResourceFormModal.jsx'
import { esgPolicies, policyAcknowledgements, audits, complianceIssues } from '../../lib/api.js'

const TABS = ['Policies', 'Acknowledgements', 'Audits', 'Compliance Issues']

const POLICY_CATEGORY_OPTIONS = [
  { value: 'environmental', label: 'Environmental' },
  { value: 'social', label: 'Social' },
  { value: 'governance', label: 'Governance' },
]
const POLICY_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'retired', label: 'Retired' },
]
const AUDIT_STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function isOverdue(issue) {
  return issue.status !== 'Resolved' && new Date(issue.dueDate) < new Date()
}

export default function GovernanceDashboard() {
  const [active, setActive] = useState(TABS[0])
  const [policies, setPolicies] = useState([])
  const [acks, setAcks] = useState([])
  const [auditList, setAuditList] = useState([])
  const [issues, setIssues] = useState([])
  const [showNewPolicy, setShowNewPolicy] = useState(false)
  const [showNewAudit, setShowNewAudit] = useState(false)

  function reload() {
    esgPolicies.list().then(setPolicies)
    policyAcknowledgements.list().then(setAcks)
    audits.list().then(setAuditList)
    complianceIssues.list().then(setIssues)
  }

  useEffect(() => {
    reload()
  }, [])

  const overdueCount = issues.filter(isOverdue).length

  async function createPolicy(values) {
    await esgPolicies.create({
      title: values.title,
      category: values.category || 'governance',
      version: values.version || '1.0',
      effective_date: values.effective_date,
      status: values.status || 'draft',
    })
    reload()
  }

  async function createAudit(values) {
    await audits.create({
      title: values.title,
      scope: values.scope,
      auditor: values.auditor,
      audit_date: values.audit_date,
      status: values.status || 'planned',
    })
    reload()
  }

  return (
    <Layout title="Governance">
      <Tabs tabs={TABS} active={active} onChange={setActive} />

      {active === 'Policies' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowNewPolicy(true)}
              className="flex items-center gap-1.5 rounded-lg bg-moss-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-moss-600"
            >
              <Plus size={15} /> New Policy
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'title', header: 'Policy' },
              { key: 'category', header: 'Category' },
              { key: 'version', header: 'Version' },
              { key: 'effectiveDate', header: 'Effective Date' },
              { key: 'mandatory', header: 'Mandatory', render: (r) => <Pill tone={r.mandatory ? 'red' : 'neutral'}>{r.mandatory ? 'Mandatory' : 'Optional'}</Pill> },
            ]}
            rows={policies}
          />
        </div>
      )}

      {active === 'Acknowledgements' && (
        <DataTable
          columns={[
            { key: 'employee', header: 'Employee' },
            { key: 'policy', header: 'Policy' },
            { key: 'acknowledgedOn', header: 'Acknowledged On', render: (r) => r.acknowledgedOn || '—' },
            { key: 'status', header: 'Status', render: (r) => <Pill>{r.status}</Pill> },
          ]}
          rows={acks}
        />
      )}

      {active === 'Audits' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowNewAudit(true)}
              className="flex items-center gap-1.5 rounded-lg bg-moss-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-moss-600"
            >
              <Plus size={15} /> New Audit
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'title', header: 'Audit' },
              { key: 'scope', header: 'Scope' },
              { key: 'auditor', header: 'Auditor' },
              { key: 'date', header: 'Date' },
              { key: 'outcome', header: 'Outcome', render: (r) => <Pill>{r.outcome}</Pill> },
            ]}
            rows={auditList}
          />
        </div>
      )}

      {active === 'Compliance Issues' && (
        <div>
          {overdueCount > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-brick-100 bg-brick-100/40 px-4 py-3 text-sm text-brick-700">
              <AlertTriangle size={16} />
              {overdueCount} issue{overdueCount > 1 ? 's are' : ' is'} past its due date and still open — notifications sent to owners.
            </div>
          )}
          <DataTable
            columns={[
              { key: 'description', header: 'Issue' },
              { key: 'audit', header: 'Audit' },
              { key: 'severity', header: 'Severity', render: (r) => <Pill>{r.severity}</Pill> },
              { key: 'owner', header: 'Owner' },
              { key: 'dueDate', header: 'Due Date' },
              { key: 'status', header: 'Status', render: (r) => <Pill tone={isOverdue(r) ? 'red' : undefined}>{isOverdue(r) ? 'Overdue' : r.status}</Pill> },
            ]}
            rows={issues}
          />
        </div>
      )}

      <ResourceFormModal
        open={showNewPolicy}
        title="New Policy"
        onClose={() => setShowNewPolicy(false)}
        onSubmit={createPolicy}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'category', label: 'Category', type: 'select', options: POLICY_CATEGORY_OPTIONS, defaultValue: 'governance' },
          { name: 'version', label: 'Version', type: 'text', defaultValue: '1.0' },
          { name: 'effective_date', label: 'Effective date', type: 'date', required: true },
          { name: 'status', label: 'Status', type: 'select', options: POLICY_STATUS_OPTIONS, defaultValue: 'draft' },
        ]}
      />

      <ResourceFormModal
        open={showNewAudit}
        title="New Audit"
        onClose={() => setShowNewAudit(false)}
        onSubmit={createAudit}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'scope', label: 'Scope', type: 'textarea' },
          { name: 'auditor', label: 'Auditor', type: 'text', required: true },
          { name: 'audit_date', label: 'Audit date', type: 'date', required: true },
          { name: 'status', label: 'Status', type: 'select', options: AUDIT_STATUS_OPTIONS, defaultValue: 'planned' },
        ]}
      />
    </Layout>
  )
}
