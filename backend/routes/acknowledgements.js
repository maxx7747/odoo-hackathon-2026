const express = require('express');
const router = express.Router();
const db = require('../db');
const { createNotification } = require('../notify');

router.get('/', (req, res) => {
  res.json(db.prepare(`
    SELECT pa.*, p.title AS policy_title, e.name AS employee_name
    FROM policy_acknowledgements pa
    LEFT JOIN policies p ON pa.policy_id = p.id
    LEFT JOIN employees e ON pa.employee_id = e.id
    ORDER BY pa.id DESC
  `).all());
});

// Assign a policy to an employee (creates a Pending acknowledgement record)
router.post('/', (req, res) => {
  const { policy_id, employee_id } = req.body;
  if (!policy_id || !employee_id) return res.status(400).json({ error: 'policy_id and employee_id are required' });
  const result = db.prepare(`INSERT INTO policy_acknowledgements (policy_id, employee_id, status) VALUES (?, ?, 'Pending')`)
    .run(policy_id, employee_id);
  res.status(201).json(db.prepare('SELECT * FROM policy_acknowledgements WHERE id = ?').get(result.lastInsertRowid));
});

// Mark an acknowledgement as Acknowledged
router.put('/:id/acknowledge', (req, res) => {
  const existing = db.prepare('SELECT * FROM policy_acknowledgements WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Acknowledgement not found' });
  db.prepare(`UPDATE policy_acknowledgements SET status = 'Acknowledged', acknowledged_at = datetime('now') WHERE id = ?`)
    .run(req.params.id);
  res.json(db.prepare('SELECT * FROM policy_acknowledgements WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM policy_acknowledgements WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Acknowledgement not found' });
  res.json({ success: true });
});

// Send reminder notifications for all Pending acknowledgements
router.post('/send-reminders', (req, res) => {
  const pending = db.prepare(`
    SELECT pa.*, p.title AS policy_title, e.name AS employee_name
    FROM policy_acknowledgements pa
    LEFT JOIN policies p ON pa.policy_id = p.id
    LEFT JOIN employees e ON pa.employee_id = e.id
    WHERE pa.status = 'Pending'
  `).all();

  for (const ack of pending) {
    createNotification(
      'PolicyAckReminder',
      `Reminder: ${ack.employee_name} has not yet acknowledged policy "${ack.policy_title}".`,
      'PolicyAcknowledgement',
      ack.id
    );
    db.prepare('UPDATE policy_acknowledgements SET reminder_sent = 1 WHERE id = ?').run(ack.id);
  }
  res.json({ remindersSent: pending.length });
});

module.exports = router;
