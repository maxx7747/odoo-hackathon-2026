const db = require('./db');

function createNotification(type, message, relatedType, relatedId) {
  db.prepare(`INSERT INTO notifications (type, message, related_type, related_id) VALUES (?, ?, ?, ?)`)
    .run(type, message, relatedType || null, relatedId || null);
}

// Scans compliance issues and creates an "overdue" notification once per issue
// the first time it's found Open and past its due date.
function checkOverdueComplianceIssues() {
  const today = new Date().toISOString().slice(0, 10);
  const overdue = db.prepare(`
    SELECT * FROM compliance_issues
    WHERE status = 'Open' AND due_date < ? AND overdue_notified = 0
  `).all(today);

  for (const issue of overdue) {
    createNotification(
      'ComplianceIssueOverdue',
      `Compliance issue "${issue.title}" is overdue (was due ${issue.due_date}).`,
      'ComplianceIssue',
      issue.id
    );
    db.prepare('UPDATE compliance_issues SET overdue_notified = 1 WHERE id = ?').run(issue.id);
  }
  return overdue.length;
}

module.exports = { createNotification, checkOverdueComplianceIssues };
