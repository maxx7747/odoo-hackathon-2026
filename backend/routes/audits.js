const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare(`
    SELECT a.*, d.name AS department_name
    FROM audits a LEFT JOIN departments d ON a.department_id = d.id
    ORDER BY a.id DESC
  `).all());
});

router.get('/:id', (req, res) => {
  const audit = db.prepare('SELECT * FROM audits WHERE id = ?').get(req.params.id);
  if (!audit) return res.status(404).json({ error: 'Audit not found' });
  res.json(audit);
});

router.post('/', (req, res) => {
  const { title, description, department_id, auditor, audit_date, status } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const result = db.prepare(`INSERT INTO audits (title, description, department_id, auditor, audit_date, status)
    VALUES (?, ?, ?, ?, ?, ?)`)
    .run(title, description || null, department_id || null, auditor || null, audit_date || null, status || 'Scheduled');
  res.status(201).json(db.prepare('SELECT * FROM audits WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM audits WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Audit not found' });
  const { title, description, department_id, auditor, audit_date, status } = req.body;
  db.prepare(`UPDATE audits SET title = ?, description = ?, department_id = ?, auditor = ?, audit_date = ?, status = ? WHERE id = ?`)
    .run(
      title ?? existing.title,
      description ?? existing.description,
      department_id ?? existing.department_id,
      auditor ?? existing.auditor,
      audit_date ?? existing.audit_date,
      status ?? existing.status,
      req.params.id
    );
  res.json(db.prepare('SELECT * FROM audits WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM audits WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Audit not found' });
  res.json({ success: true });
});

module.exports = router;
