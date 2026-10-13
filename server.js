const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- READ: all students ----------
app.get('/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ---------- READ: one student ----------
app.get('/students/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// ---------- CREATE ----------
app.post('/students', async (req, res) => {
  const { name, email, age, course } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO students (name, email, age, course) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, age, course]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A student with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// ---------- UPDATE ----------
app.put('/students/:id', async (req, res) => {
  const { name, email, age, course } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    const result = await pool.query(
      'UPDATE students SET name = $1, email = $2, age = $3, course = $4 WHERE id = $5 RETURNING *',
      [name, email, age, course, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A student with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// ---------- DELETE ----------
app.delete('/students/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted', student: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});