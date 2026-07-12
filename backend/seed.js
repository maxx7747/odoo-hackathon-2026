// Run with: node seed.js
// Populates sample data so the app isn't empty on first run.
const db = require('./db');

const deptCount = db.prepare('SELECT COUNT(*) AS c FROM departments').get().c;

if (deptCount === 0) {
  console.log('Seeding sample data...');

  const insertDept = db.prepare(`INSERT INTO departments (name, code, head, parent_department_id, employee_count, status)
    VALUES (?, ?, ?, ?, ?, ?)`);
  const d1 = insertDept.run('Operations', 'OPS', 'Anita Rao', null, 25, 'Active').lastInsertRowid;
  const d2 = insertDept.run('Human Resources', 'HR', 'Vikram Shah', null, 10, 'Active').lastInsertRowid;
  const d3 = insertDept.run('Finance', 'FIN', 'Priya Mehta', null, 8, 'Active').lastInsertRowid;

  const insertEmp = db.prepare(`INSERT INTO employees (name, email, department_id, role) VALUES (?, ?, ?, ?)`);
  const e1 = insertEmp.run('Rudra Patel', 'rudra@ecosphere.com', d1, 'Manager').lastInsertRowid;
  const e2 = insertEmp.run('Sneha Joshi', 'sneha@ecosphere.com', d2, 'Employee').lastInsertRowid;
  const e3 = insertEmp.run('Kabir Singh', 'kabir@ecosphere.com', d3, 'Employee').lastInsertRowid;
  const e4 = insertEmp.run('Meera Nair', 'meera@ecosphere.com', d1, 'Employee').lastInsertRowid;

  const insertPolicy = db.prepare(`INSERT INTO policies (title, description, category, version, status, effective_date, department_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const p1 = insertPolicy.run(
    'Code of Conduct',
    'Standards of ethical behavior expected from all employees.',
    'Governance',
    '1.0',
    'Active',
    '2026-01-01',
    null
  ).lastInsertRowid;
  const p2 = insertPolicy.run(
    'Data Privacy Policy',
    'Guidelines for handling personal and sensitive data.',
    'Compliance',
    '2.1',
    'Active',
    '2026-02-01',
    d3
  ).lastInsertRowid;

  const insertAck = db.prepare(`INSERT INTO policy_acknowledgements (policy_id, employee_id, status, acknowledged_at)
    VALUES (?, ?, ?, ?)`);
  insertAck.run(p1, e1, 'Acknowledged', new Date().toISOString());
  insertAck.run(p1, e2, 'Pending', null);
  insertAck.run(p2, e3, 'Pending', null);
  insertAck.run(p2, e4, 'Pending', null);

  const insertAudit = db.prepare(`INSERT INTO audits (title, description, department_id, auditor, audit_date, status)
    VALUES (?, ?, ?, ?, ?, ?)`);
  const a1 = insertAudit.run(
    'Q1 Governance Audit',
    'Quarterly review of governance controls in Operations.',
    d1,
    'External Auditor - KPMG',
    '2026-06-15',
    'Completed'
  ).lastInsertRowid;
  const a2 = insertAudit.run(
    'Data Handling Audit',
    'Review of data privacy compliance in Finance.',
    d3,
    'Internal Audit Team',
    '2026-07-01',
    'In Progress'
  ).lastInsertRowid;

  const insertIssue = db.prepare(`INSERT INTO compliance_issues (audit_id, title, description, severity, owner_employee_id, due_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  insertIssue.run(a1, 'Missing signed acknowledgements', 'Several employees have not signed the Code of Conduct.', 'Medium', e1, '2026-07-20', 'Open');
  insertIssue.run(a2, 'Unencrypted data export found', 'A data export was found without encryption enabled.', 'Critical', e3, '2026-07-05', 'Open');

  console.log('Seeding complete.');
} else {
  console.log('Data already exists, skipping seed.');
}
