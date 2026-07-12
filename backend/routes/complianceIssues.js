const express = require('express');
const router = express.Router();
const db = require('../db');
const { createNotification, checkOverdueComplianceIssues } = require('../notify');

router.get('/', (req, res) => {
  checkOverdueComplianceIssues();
  const today = new Date().toISOString().slice(0, 10);
  const issues = db.prepare(`
    SELECT ci.*, a.title AS audit_title, e.name AS owner_name
    FROM compliance_issues ci
    LEFT JOIN audits a ON ci.audit_id = a.id
    LEFT JOIN employees e ON ci.owner_employee_id = e.id
    ORDER BY ci.id DESC
  `).all().map(issue => ({
    ...issue,
    is_overdue: issue.status !== 'Resolved' && issue.status !== 'Closed' && issue.due_date < today
  }));
  res.json(issues);
});

router.get('/:id', (req, res) => {
  const issue = db.prepare('SELECT * FROM compliance_issues WHERE id = ?').get(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Compliance issue not found' });
  res.json(issue);
});

router.post('/', (req, res) => {
  const { audit_id, title, description, severity, owner_employee_id, due_date, status } = req.body;
  if (!title || !due_date) return res.status(400).json({ error: 'title and due_date are required' });
  if (!owner_employee_id) return res.status(400).json({ error: 'owner_employee_id is required (every compliance issue must have an owner)' });

  const result = db.prepare(`INSERT INTO compliance_issues (audit_id, title, description, severity, owner_employee_id, due_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(audit_id || null, title, description || null, severity || 'Medium', owner_employee_id, due_date, status || 'Open');

  const newIssue = db.prepare('SELECT * FROM compliance_issues WHERE id = ?').get(result.lastInsertRowid);

  createNotification(
    'ComplianceIssueRaised',
    `New compliance issue raised: "${newIssue.title}" (Severity: ${newIssue.severity}).`,
    'ComplianceIssue',
    newIssue.id
  );

  res.status(201).json(newIssue);
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM compliance_issues WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Compliance issue not found' });
  const { audit_id, title, description, severity, owner_employee_id, due_date, status } = req.body;

  // If the due date changes, re-arm the overdue notification so a new due date can be flagged again later
  const newDueDate = due_date ?? existing.due_date;
  const overdueNotified = (newDueDate !== existing.due_date) ? 0 : existing.overdue_notified;

  db.prepare(`UPDATE compliance_issues SET audit_id = ?, title = ?, description = ?, severity = ?, owner_employee_id = ?, due_date = ?, status = ?, overdue_notified = ? WHERE id = ?`)
    .run(
      audit_id ?? existing.audit_id,
      title ?? existing.title,
      description ?? existing.description,
      severity ?? existing.severity,
      owner_employee_id ?? existing.owner_employee_id,
      newDueDate,
      status ?? existing.status,
      overdueNotified,
      req.params.id
    );
  res.json(db.prepare('SELECT * FROM compliance_issues WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM compliance_issues WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Compliance issue not found' });
  res.json({ success: true });
});

module.exports = router;
