const API = '/api';

const state = {
  view: 'dashboard',
  departments: [],
  employees: [],
  policies: [],
  acknowledgements: [],
  audits: [],
  complianceIssues: [],
  notifications: [],
};

// ---------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------
async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.status === 204 ? null : res.json();
}

async function loadAll() {
  const [departments, employees, policies, acknowledgements, audits, complianceIssues, notifications] = await Promise.all([
    api('/departments'),
    api('/employees'),
    api('/policies'),
    api('/acknowledgements'),
    api('/audits'),
    api('/compliance-issues'),
    api('/notifications'),
  ]);
  state.departments = departments;
  state.employees = employees;
  state.policies = policies;
  state.acknowledgements = acknowledgements;
  state.audits = audits;
  state.complianceIssues = complianceIssues;
  state.notifications = notifications;
}

function fmtDate(d) {
  if (!d) return '—';
  return d.length > 10 ? d.slice(0, 10) : d;
}

function timeAgo(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso.replace(' ', 'T') + 'Z').getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function empName(id) {
  const e = state.employees.find(e => e.id === id);
  return e ? e.name : '—';
}
function initials(name) {
  if (!name || name === '—') return '?';
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}
function deptName(id) {
  const d = state.departments.find(d => d.id === id);
  return d ? d.name : 'All Departments';
}

// ---------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.view = btn.dataset.view;
    render();
  });
});

const titles = {
  dashboard: 'Dashboard',
  policies: 'Policies',
  acknowledgements: 'Policy Acknowledgements',
  audits: 'Audits',
  compliance: 'Compliance Issues',
  directory: 'Departments & Employees',
};

function render() {
  document.getElementById('view-title').textContent = titles[state.view];
  const el = document.getElementById('content');
  el.innerHTML = '';
  const renderers = {
    dashboard: renderDashboard,
    policies: renderPolicies,
    acknowledgements: renderAcknowledgements,
    audits: renderAudits,
    compliance: renderCompliance,
    directory: renderDirectory,
  };
  renderers[state.view](el);
  renderNotifBadge();
}

// ---------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------
function renderDashboard(el) {
  const today = new Date().toISOString().slice(0, 10);
  const openIssues = state.complianceIssues.filter(i => i.status === 'Open' || i.status === 'In Progress');
  const overdueIssues = state.complianceIssues.filter(i => i.is_overdue);
  const pendingAcks = state.acknowledgements.filter(a => a.status === 'Pending');
  const activePolicies = state.policies.filter(p => p.status === 'Active');

  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card accent-teal"><div class="stat-value">${activePolicies.length}</div><div class="stat-label">Active policies</div></div>
      <div class="stat-card accent-amber"><div class="stat-value">${pendingAcks.length}</div><div class="stat-label">Pending acknowledgements</div></div>
      <div class="stat-card"><div class="stat-value">${openIssues.length}</div><div class="stat-label">Open compliance issues</div></div>
      <div class="stat-card accent-red"><div class="stat-value">${overdueIssues.length}</div><div class="stat-label">Overdue issues</div></div>
    </div>

    <div class="panel">
      <div class="panel-header"><h3>Compliance issues needing attention</h3></div>
      <table>
        <thead><tr><th>Issue</th><th>Owner</th><th>Due date</th><th>Severity</th><th>Status</th></tr></thead>
        <tbody>
          ${openIssues.slice(0, 6).map(i => `
            <tr>
              <td>${i.title}</td>
              <td>${i.owner_name || empName(i.owner_employee_id)}</td>
              <td>${fmtDate(i.due_date)}</td>
              <td>${severityBadge(i.severity)}</td>
              <td>${statusBadge(i.status, i.is_overdue)}</td>
            </tr>`).join('') || `<tr><td colspan="5" class="empty-state">No open compliance issues. Nice work.</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="panel">
      <div class="panel-header"><h3>Recent notifications</h3></div>
      <table>
        <tbody>
          ${state.notifications.slice(0, 5).map(n => `
            <tr><td style="width:70%">${n.message}</td><td>${timeAgo(n.created_at)}</td></tr>
          `).join('') || `<tr><td class="empty-state">No notifications yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function severityBadge(sev) {
  const map = { Low: 'badge-gray', Medium: 'badge-amber', High: 'badge-red', Critical: 'badge-red' };
  return `<span class="badge ${map[sev] || 'badge-gray'}">${sev}</span>`;
}
function statusBadge(status, isOverdue) {
  if (isOverdue) return `<span class="badge badge-red">Overdue</span>`;
  const map = {
    Open: 'badge-amber', 'In Progress': 'badge-teal', Resolved: 'badge-green', Closed: 'badge-gray',
    Draft: 'badge-gray', Active: 'badge-green', Archived: 'badge-gray',
    Pending: 'badge-amber', Acknowledged: 'badge-green',
    Scheduled: 'badge-gray', Completed: 'badge-green',
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

// ---------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------
function renderPolicies(el) {
  el.innerHTML = `
    <div class="section-toolbar">
      <p>Governance policies distributed across the organization. Set a policy to Active once it's ready for employee acknowledgement.</p>
      <button class="btn" id="add-policy">+ New Policy</button>
    </div>
    <div class="panel">
      <table>
        <thead><tr><th>Title</th><th>Category</th><th>Version</th><th>Department</th><th>Effective date</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${state.policies.map(p => `
            <tr>
              <td><strong>${p.title}</strong><div style="color:var(--muted);font-size:12px;margin-top:2px">${p.description || ''}</div></td>
              <td>${p.category || '—'}</td>
              <td>v${p.version}</td>
              <td>${p.department_name || 'All Departments'}</td>
              <td>${fmtDate(p.effective_date)}</td>
              <td>${statusBadge(p.status)}</td>
              <td class="row-actions">
                <button class="btn btn-outline btn-sm" data-edit-policy="${p.id}">Edit</button>
                <button class="btn btn-outline btn-sm" data-del-policy="${p.id}">Delete</button>
              </td>
            </tr>`).join('') || `<tr><td colspan="7" class="empty-state">No policies yet. Add your first governance policy.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  el.querySelector('#add-policy').onclick = () => openPolicyModal();
  el.querySelectorAll('[data-edit-policy]').forEach(b => b.onclick = () => openPolicyModal(Number(b.dataset.editPolicy)));
  el.querySelectorAll('[data-del-policy]').forEach(b => b.onclick = async () => {
    if (confirm('Delete this policy? Related acknowledgements will remain but reference a missing policy.')) {
      await api(`/policies/${b.dataset.delPolicy}`, { method: 'DELETE' });
      await loadAll(); render();
    }
  });
}

function openPolicyModal(id) {
  const existing = id ? state.policies.find(p => p.id === id) : null;
  openModal(existing ? 'Edit Policy' : 'New Policy', [
    { name: 'title', label: 'Title', type: 'text', required: true, value: existing?.title },
    { name: 'description', label: 'Description', type: 'textarea', value: existing?.description },
    { name: 'category', label: 'Category', type: 'text', value: existing?.category, placeholder: 'e.g. Governance, Compliance' },
    { name: 'version', label: 'Version', type: 'text', value: existing?.version || '1.0' },
    { name: 'department_id', label: 'Department (optional)', type: 'select',
      options: [{ value: '', label: 'All Departments' }, ...state.departments.map(d => ({ value: d.id, label: d.name }))],
      value: existing?.department_id || '' },
    { name: 'effective_date', label: 'Effective date', type: 'date', value: existing?.effective_date },
    { name: 'status', label: 'Status', type: 'select',
      options: ['Draft', 'Active', 'Archived'].map(v => ({ value: v, label: v })),
      value: existing?.status || 'Draft' },
  ], async (data) => {
    data.department_id = data.department_id || null;
    if (existing) await api(`/policies/${existing.id}`, { method: 'PUT', body: JSON.stringify(data) });
    else await api('/policies', { method: 'POST', body: JSON.stringify(data) });
    await loadAll(); render();
  });
}

// ---------------------------------------------------------------------
// Policy Acknowledgements
// ---------------------------------------------------------------------
function renderAcknowledgements(el) {
  const pendingCount = state.acknowledgements.filter(a => a.status === 'Pending').length;
  el.innerHTML = `
    <div class="section-toolbar">
      <p>Track which employees have acknowledged which policies. Send reminders to everyone still pending.</p>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" id="send-reminders">Send Reminders (${pendingCount})</button>
        <button class="btn" id="add-ack">+ Assign Policy</button>
      </div>
    </div>
    <div class="panel">
      <table>
        <thead><tr><th>Policy</th><th>Employee</th><th>Status</th><th>Acknowledged at</th><th></th></tr></thead>
        <tbody>
          ${state.acknowledgements.map(a => `
            <tr>
              <td>${a.policy_title || '—'}</td>
              <td class="owner-cell"><span class="avatar">${initials(a.employee_name)}</span>${a.employee_name || '—'}</td>
              <td>${statusBadge(a.status)}</td>
              <td>${a.acknowledged_at ? timeAgo(a.acknowledged_at) : '—'}</td>
              <td class="row-actions">
                ${a.status === 'Pending' ? `<button class="btn btn-sm" data-ack="${a.id}">Mark Acknowledged</button>` : ''}
                <button class="btn btn-outline btn-sm" data-del-ack="${a.id}">Remove</button>
              </td>
            </tr>`).join('') || `<tr><td colspan="5" class="empty-state">No policy assignments yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  el.querySelector('#add-ack').onclick = () => openAckModal();
  el.querySelector('#send-reminders').onclick = async () => {
    const result = await api('/acknowledgements/send-reminders', { method: 'POST' });
    await loadAll(); render();
    alert(`Reminder notifications sent for ${result.remindersSent} pending acknowledgement(s).`);
  };
  el.querySelectorAll('[data-ack]').forEach(b => b.onclick = async () => {
    await api(`/acknowledgements/${b.dataset.ack}/acknowledge`, { method: 'PUT' });
    await loadAll(); render();
  });
  el.querySelectorAll('[data-del-ack]').forEach(b => b.onclick = async () => {
    if (confirm('Remove this acknowledgement record?')) {
      await api(`/acknowledgements/${b.dataset.delAck}`, { method: 'DELETE' });
      await loadAll(); render();
    }
  });
}

function openAckModal() {
  openModal('Assign Policy to Employee', [
    { name: 'policy_id', label: 'Policy', type: 'select', required: true,
      options: state.policies.map(p => ({ value: p.id, label: p.title })) },
    { name: 'employee_id', label: 'Employee', type: 'select', required: true,
      options: state.employees.map(e => ({ value: e.id, label: e.name })) },
  ], async (data) => {
    await api('/acknowledgements', { method: 'POST', body: JSON.stringify(data) });
    await loadAll(); render();
  });
}

// ---------------------------------------------------------------------
// Audits
// ---------------------------------------------------------------------
function renderAudits(el) {
  el.innerHTML = `
    <div class="section-toolbar">
      <p>Schedule and track governance audits by department.</p>
      <button class="btn" id="add-audit">+ New Audit</button>
    </div>
    <div class="panel">
      <table>
        <thead><tr><th>Title</th><th>Department</th><th>Auditor</th><th>Audit date</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${state.audits.map(a => `
            <tr>
              <td><strong>${a.title}</strong><div style="color:var(--muted);font-size:12px;margin-top:2px">${a.description || ''}</div></td>
              <td>${a.department_name || 'Organization-wide'}</td>
              <td>${a.auditor || '—'}</td>
              <td>${fmtDate(a.audit_date)}</td>
              <td>${statusBadge(a.status)}</td>
              <td class="row-actions">
                <button class="btn btn-outline btn-sm" data-edit-audit="${a.id}">Edit</button>
                <button class="btn btn-outline btn-sm" data-del-audit="${a.id}">Delete</button>
              </td>
            </tr>`).join('') || `<tr><td colspan="6" class="empty-state">No audits scheduled yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  el.querySelector('#add-audit').onclick = () => openAuditModal();
  el.querySelectorAll('[data-edit-audit]').forEach(b => b.onclick = () => openAuditModal(Number(b.dataset.editAudit)));
  el.querySelectorAll('[data-del-audit]').forEach(b => b.onclick = async () => {
    if (confirm('Delete this audit?')) {
      await api(`/audits/${b.dataset.delAudit}`, { method: 'DELETE' });
      await loadAll(); render();
    }
  });
}

function openAuditModal(id) {
  const existing = id ? state.audits.find(a => a.id === id) : null;
  openModal(existing ? 'Edit Audit' : 'New Audit', [
    { name: 'title', label: 'Title', type: 'text', required: true, value: existing?.title },
    { name: 'description', label: 'Description', type: 'textarea', value: existing?.description },
    { name: 'department_id', label: 'Department', type: 'select',
      options: [{ value: '', label: 'Organization-wide' }, ...state.departments.map(d => ({ value: d.id, label: d.name }))],
      value: existing?.department_id || '' },
    { name: 'auditor', label: 'Auditor', type: 'text', value: existing?.auditor, placeholder: 'Name or firm' },
    { name: 'audit_date', label: 'Audit date', type: 'date', value: existing?.audit_date },
    { name: 'status', label: 'Status', type: 'select',
      options: ['Scheduled', 'In Progress', 'Completed'].map(v => ({ value: v, label: v })),
      value: existing?.status || 'Scheduled' },
  ], async (data) => {
    data.department_id = data.department_id || null;
    if (existing) await api(`/audits/${existing.id}`, { method: 'PUT', body: JSON.stringify(data) });
    else await api('/audits', { method: 'POST', body: JSON.stringify(data) });
    await loadAll(); render();
  });
}

// ---------------------------------------------------------------------
// Compliance Issues
// ---------------------------------------------------------------------
function renderCompliance(el) {
  el.innerHTML = `
    <div class="section-toolbar">
      <p>Every issue has a required owner and due date. Issues that pass their due date while still Open are automatically flagged.</p>
      <button class="btn" id="add-issue">+ Raise Issue</button>
    </div>
    <div class="panel">
      <table>
        <thead><tr><th>Issue</th><th>Related audit</th><th>Owner</th><th>Due date</th><th>Severity</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${state.complianceIssues.map(i => `
            <tr>
              <td><strong>${i.title}</strong><div style="color:var(--muted);font-size:12px;margin-top:2px">${i.description || ''}</div></td>
              <td>${i.audit_title || '—'}</td>
              <td class="owner-cell"><span class="avatar">${initials(i.owner_name)}</span>${i.owner_name || '—'}</td>
              <td>${fmtDate(i.due_date)}</td>
              <td>${severityBadge(i.severity)}</td>
              <td>${statusBadge(i.status, i.is_overdue)}</td>
              <td class="row-actions">
                <button class="btn btn-outline btn-sm" data-edit-issue="${i.id}">Edit</button>
                <button class="btn btn-outline btn-sm" data-del-issue="${i.id}">Delete</button>
              </td>
            </tr>`).join('') || `<tr><td colspan="7" class="empty-state">No compliance issues recorded.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  el.querySelector('#add-issue').onclick = () => openIssueModal();
  el.querySelectorAll('[data-edit-issue]').forEach(b => b.onclick = () => openIssueModal(Number(b.dataset.editIssue)));
  el.querySelectorAll('[data-del-issue]').forEach(b => b.onclick = async () => {
    if (confirm('Delete this compliance issue?')) {
      await api(`/compliance-issues/${b.dataset.delIssue}`, { method: 'DELETE' });
      await loadAll(); render();
    }
  });
}

function openIssueModal(id) {
  const existing = id ? state.complianceIssues.find(i => i.id === id) : null;
  openModal(existing ? 'Edit Compliance Issue' : 'Raise Compliance Issue', [
    { name: 'title', label: 'Title', type: 'text', required: true, value: existing?.title },
    { name: 'description', label: 'Description', type: 'textarea', value: existing?.description },
    { name: 'audit_id', label: 'Related audit (optional)', type: 'select',
      options: [{ value: '', label: 'None' }, ...state.audits.map(a => ({ value: a.id, label: a.title }))],
      value: existing?.audit_id || '' },
    { name: 'owner_employee_id', label: 'Owner', type: 'select', required: true,
      hint: 'Every issue must have an assigned owner.',
      options: state.employees.map(e => ({ value: e.id, label: e.name })),
      value: existing?.owner_employee_id },
    { name: 'due_date', label: 'Due date', type: 'date', required: true, value: existing?.due_date },
    { name: 'severity', label: 'Severity', type: 'select',
      options: ['Low', 'Medium', 'High', 'Critical'].map(v => ({ value: v, label: v })),
      value: existing?.severity || 'Medium' },
    { name: 'status', label: 'Status', type: 'select',
      options: ['Open', 'In Progress', 'Resolved', 'Closed'].map(v => ({ value: v, label: v })),
      value: existing?.status || 'Open' },
  ], async (data) => {
    data.audit_id = data.audit_id || null;
    if (existing) await api(`/compliance-issues/${existing.id}`, { method: 'PUT', body: JSON.stringify(data) });
    else await api('/compliance-issues', { method: 'POST', body: JSON.stringify(data) });
    await loadAll(); render();
  });
}

// ---------------------------------------------------------------------
// Departments & Employees (directory)
// ---------------------------------------------------------------------
function renderDirectory(el) {
  el.innerHTML = `
    <div class="section-toolbar">
      <p>Master data: departments and employees, referenced across policies, audits, and compliance issues.</p>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" id="add-dept">+ Department</button>
        <button class="btn" id="add-emp">+ Employee</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><h3>Departments</h3></div>
      <table>
        <thead><tr><th>Name</th><th>Code</th><th>Head</th><th>Employee count</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${state.departments.map(d => `
            <tr>
              <td><strong>${d.name}</strong></td>
              <td>${d.code || '—'}</td>
              <td>${d.head || '—'}</td>
              <td>${d.employee_count ?? 0}</td>
              <td>${statusBadge(d.status)}</td>
              <td class="row-actions">
                <button class="btn btn-outline btn-sm" data-edit-dept="${d.id}">Edit</button>
                <button class="btn btn-outline btn-sm" data-del-dept="${d.id}">Delete</button>
              </td>
            </tr>`).join('') || `<tr><td colspan="6" class="empty-state">No departments yet.</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="panel">
      <div class="panel-header"><h3>Employees</h3></div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Role</th><th></th></tr></thead>
        <tbody>
          ${state.employees.map(e => `
            <tr>
              <td class="owner-cell"><span class="avatar">${initials(e.name)}</span>${e.name}</td>
              <td>${e.email || '—'}</td>
              <td>${e.department_name || '—'}</td>
              <td>${e.role}</td>
              <td class="row-actions">
                <button class="btn btn-outline btn-sm" data-edit-emp="${e.id}">Edit</button>
                <button class="btn btn-outline btn-sm" data-del-emp="${e.id}">Delete</button>
              </td>
            </tr>`).join('') || `<tr><td colspan="5" class="empty-state">No employees yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  el.querySelector('#add-dept').onclick = () => openDeptModal();
  el.querySelector('#add-emp').onclick = () => openEmpModal();
  el.querySelectorAll('[data-edit-dept]').forEach(b => b.onclick = () => openDeptModal(Number(b.dataset.editDept)));
  el.querySelectorAll('[data-del-dept]').forEach(b => b.onclick = async () => {
    if (confirm('Delete this department?')) { await api(`/departments/${b.dataset.delDept}`, { method: 'DELETE' }); await loadAll(); render(); }
  });
  el.querySelectorAll('[data-edit-emp]').forEach(b => b.onclick = () => openEmpModal(Number(b.dataset.editEmp)));
  el.querySelectorAll('[data-del-emp]').forEach(b => b.onclick = async () => {
    if (confirm('Delete this employee?')) { await api(`/employees/${b.dataset.delEmp}`, { method: 'DELETE' }); await loadAll(); render(); }
  });
}

function openDeptModal(id) {
  const existing = id ? state.departments.find(d => d.id === id) : null;
  openModal(existing ? 'Edit Department' : 'New Department', [
    { name: 'name', label: 'Name', type: 'text', required: true, value: existing?.name },
    { name: 'code', label: 'Code', type: 'text', value: existing?.code },
    { name: 'head', label: 'Department head', type: 'text', value: existing?.head },
    { name: 'employee_count', label: 'Employee count', type: 'number', value: existing?.employee_count ?? 0 },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'].map(v => ({ value: v, label: v })), value: existing?.status || 'Active' },
  ], async (data) => {
    data.employee_count = Number(data.employee_count) || 0;
    if (existing) await api(`/departments/${existing.id}`, { method: 'PUT', body: JSON.stringify(data) });
    else await api('/departments', { method: 'POST', body: JSON.stringify(data) });
    await loadAll(); render();
  });
}

function openEmpModal(id) {
  const existing = id ? state.employees.find(e => e.id === id) : null;
  openModal(existing ? 'Edit Employee' : 'New Employee', [
    { name: 'name', label: 'Name', type: 'text', required: true, value: existing?.name },
    { name: 'email', label: 'Email', type: 'text', value: existing?.email },
    { name: 'department_id', label: 'Department', type: 'select',
      options: [{ value: '', label: 'Unassigned' }, ...state.departments.map(d => ({ value: d.id, label: d.name }))],
      value: existing?.department_id || '' },
    { name: 'role', label: 'Role', type: 'select', options: ['Employee', 'Manager', 'Admin'].map(v => ({ value: v, label: v })), value: existing?.role || 'Employee' },
  ], async (data) => {
    data.department_id = data.department_id || null;
    if (existing) await api(`/employees/${existing.id}`, { method: 'PUT', body: JSON.stringify(data) });
    else await api('/employees', { method: 'POST', body: JSON.stringify(data) });
    await loadAll(); render();
  });
}

// ---------------------------------------------------------------------
// Generic modal
// ---------------------------------------------------------------------
const modalScrim = document.getElementById('modal-scrim');
const modalForm = document.getElementById('modal-form');
const modalTitle = document.getElementById('modal-title');

function openModal(title, fields, onSubmit) {
  modalTitle.textContent = title;
  modalForm.innerHTML = fields.map(f => renderField(f)).join('') + `
    <div class="modal-footer">
      <button type="button" class="btn btn-outline" id="modal-cancel">Cancel</button>
      <button type="submit" class="btn">Save</button>
    </div>
  `;
  modalScrim.classList.add('open');
  modalForm.querySelector('#modal-cancel').onclick = closeModal;
  modalForm.onsubmit = async (e) => {
    e.preventDefault();
    const data = {};
    fields.forEach(f => { data[f.name] = modalForm.elements[f.name].value; });
    try {
      await onSubmit(data);
      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };
}

function renderField(f) {
  const req = f.required ? 'required' : '';
  let control = '';
  if (f.type === 'select') {
    control = `<select name="${f.name}" ${req}>
      ${f.options.map(o => `<option value="${o.value}" ${String(o.value) === String(f.value) ? 'selected' : ''}>${o.label}</option>`).join('')}
    </select>`;
  } else if (f.type === 'textarea') {
    control = `<textarea name="${f.name}" ${req} placeholder="${f.placeholder || ''}">${f.value || ''}</textarea>`;
  } else {
    control = `<input type="${f.type}" name="${f.name}" ${req} value="${f.value ?? ''}" placeholder="${f.placeholder || ''}" />`;
  }
  return `<div class="field"><label>${f.label}${f.hint ? ` <span class="hint">— ${f.hint}</span>` : ''}</label>${control}</div>`;
}

function closeModal() {
  modalScrim.classList.remove('open');
  modalForm.onsubmit = null;
}

document.getElementById('modal-close').onclick = closeModal;
modalScrim.addEventListener('click', (e) => { if (e.target === modalScrim) closeModal(); });

// ---------------------------------------------------------------------
// Notifications drawer
// ---------------------------------------------------------------------
const drawer = document.getElementById('notif-drawer');
const scrim = document.getElementById('scrim');

document.getElementById('notif-btn').onclick = () => {
  drawer.classList.add('open');
  scrim.classList.add('open');
  renderNotifList();
};
document.getElementById('close-drawer').onclick = closeDrawer;
scrim.addEventListener('click', closeDrawer);
function closeDrawer() {
  drawer.classList.remove('open');
  scrim.classList.remove('open');
}

document.getElementById('mark-all-read').onclick = async () => {
  await api('/notifications/read-all', { method: 'PUT' });
  await loadAll();
  renderNotifList();
  renderNotifBadge();
};

function renderNotifList() {
  const list = document.getElementById('notif-list');
  list.innerHTML = state.notifications.map(n => `
    <div class="notif-item ${n.is_read ? '' : 'unread'}" data-notif="${n.id}">
      <span class="notif-dot"></span>
      <div class="notif-text">
        ${n.message}
        <div class="notif-time">${timeAgo(n.created_at)}</div>
      </div>
    </div>
  `).join('') || `<div class="empty-state">You're all caught up.</div>`;

  list.querySelectorAll('[data-notif]').forEach(item => item.onclick = async () => {
    await api(`/notifications/${item.dataset.notif}/read`, { method: 'PUT' });
    await loadAll();
    renderNotifList();
    renderNotifBadge();
  });
}

function renderNotifBadge() {
  const unread = state.notifications.filter(n => !n.is_read).length;
  const badge = document.getElementById('notif-count');
  if (unread > 0) { badge.hidden = false; badge.textContent = unread; }
  else badge.hidden = true;
}

// ---------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------
(async function init() {
  try {
    await loadAll();
    render();
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="empty-state">Failed to load data: ${err.message}</div>`;
  }
  // Periodically refresh notifications (and overdue checks) every 30s
  setInterval(async () => {
    try {
      state.notifications = await api('/notifications');
      state.complianceIssues = await api('/compliance-issues');
      renderNotifBadge();
      if (state.view === 'dashboard' || state.view === 'compliance') render();
    } catch (_) {}
  }, 30000);
})();
