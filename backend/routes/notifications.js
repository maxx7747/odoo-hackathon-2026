const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkOverdueComplianceIssues } = require('../notify');

router.get('/', (req, res) => {
  checkOverdueComplianceIssues();
  res.json(db.prepare('SELECT * FROM notifications ORDER BY id DESC').all());
});

router.get('/unread-count', (req, res) => {
  checkOverdueComplianceIssues();
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE is_read = 0').get();
  res.json({ count: c });
});

router.put('/:id/read', (req, res) => {
  const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Notification not found' });
  res.json({ success: true });
});

router.put('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE is_read = 0').run();
  res.json({ success: true });
});

module.exports = router;
