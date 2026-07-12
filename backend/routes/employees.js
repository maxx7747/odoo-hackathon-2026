const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare(`
    SELECT e.*, d.name AS department_name
    FROM employees e LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY e.id DESC
  `).all());
});

router.get('/:id', (req, res) => {
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  res.json(emp);
});

router.post('/', (req, res) => {
  const { name, email, department_id, role } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const result = db.prepare(`INSERT INTO employees (name, email, department_id, role) VALUES (?, ?, ?, ?)`)
    .run(name, email || null, department_id || null, role || 'Employee');
  res.status(201).json(db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Employee not found' });
  const { name, email, department_id, role } = req.body;
  db.prepare(`UPDATE employees SET name = ?, email = ?, department_id = ?, role = ? WHERE id = ?`)
    .run(name ?? existing.name, email ?? existing.email, department_id ?? existing.department_id, role ?? existing.role, req.params.id);
  res.json(db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Employee not found' });
  res.json({ success: true });
});

module.exports = router;
