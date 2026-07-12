const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM departments ORDER BY id DESC').all());
});

router.get('/:id', (req, res) => {
  const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id);
  if (!dept) return res.status(404).json({ error: 'Department not found' });
  res.json(dept);
});

router.post('/', (req, res) => {
  const { name, code, head, parent_department_id, employee_count, status } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const result = db.prepare(`INSERT INTO departments (name, code, head, parent_department_id, employee_count, status)
    VALUES (?, ?, ?, ?, ?, ?)`)
    .run(name, code || null, head || null, parent_department_id || null, employee_count || 0, status || 'Active');
  res.status(201).json(db.prepare('SELECT * FROM departments WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Department not found' });
  const { name, code, head, parent_department_id, employee_count, status } = req.body;
  db.prepare(`UPDATE departments SET name = ?, code = ?, head = ?, parent_department_id = ?, employee_count = ?, status = ? WHERE id = ?`)
    .run(
      name ?? existing.name,
      code ?? existing.code,
      head ?? existing.head,
      parent_department_id ?? existing.parent_department_id,
      employee_count ?? existing.employee_count,
      status ?? existing.status,
      req.params.id
    );
  res.json(db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM departments WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Department not found' });
  res.json({ success: true });
});

module.exports = router;
