const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare(`
    SELECT p.*, d.name AS department_name
    FROM policies p LEFT JOIN departments d ON p.department_id = d.id
    ORDER BY p.id DESC
  `).all());
});

router.get('/:id', (req, res) => {
  const policy = db.prepare('SELECT * FROM policies WHERE id = ?').get(req.params.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });
  res.json(policy);
});

router.post('/', (req, res) => {
  const { title, description, category, version, status, effective_date, department_id } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const result = db.prepare(`INSERT INTO policies (title, description, category, version, status, effective_date, department_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(title, description || null, category || null, version || '1.0', status || 'Draft', effective_date || null, department_id || null);
  res.status(201).json(db.prepare('SELECT * FROM policies WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM policies WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Policy not found' });
  const { title, description, category, version, status, effective_date, department_id } = req.body;
  db.prepare(`UPDATE policies SET title = ?, description = ?, category = ?, version = ?, status = ?, effective_date = ?, department_id = ? WHERE id = ?`)
    .run(
      title ?? existing.title,
      description ?? existing.description,
      category ?? existing.category,
      version ?? existing.version,
      status ?? existing.status,
      effective_date ?? existing.effective_date,
      department_id ?? existing.department_id,
      req.params.id
    );
  res.json(db.prepare('SELECT * FROM policies WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM policies WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Policy not found' });
  res.json({ success: true });
});

module.exports = router;
