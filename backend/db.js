const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'governance.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT,
  head TEXT,
  parent_department_id INTEGER,
  employee_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  department_id INTEGER,
  role TEXT DEFAULT 'Employee',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'Draft', -- Draft, Active, Archived
  effective_date TEXT,
  department_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS policy_acknowledgements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  policy_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  status TEXT DEFAULT 'Pending', -- Pending, Acknowledged
  acknowledged_at TEXT,
  reminder_sent INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (policy_id) REFERENCES policies(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  department_id INTEGER,
  auditor TEXT,
  audit_date TEXT,
  status TEXT DEFAULT 'Scheduled', -- Scheduled, In Progress, Completed
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS compliance_issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'Medium', -- Low, Medium, High, Critical
  owner_employee_id INTEGER,
  due_date TEXT NOT NULL,
  status TEXT DEFAULT 'Open', -- Open, In Progress, Resolved, Closed
  overdue_notified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (audit_id) REFERENCES audits(id),
  FOREIGN KEY (owner_employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- ComplianceIssueRaised, PolicyAckReminder, ComplianceIssueOverdue
  message TEXT NOT NULL,
  related_type TEXT,
  related_id INTEGER,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

module.exports = db;
