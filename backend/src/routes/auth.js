import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const [rows] = await pool.execute('SELECT id, name, email, role, password_hash FROM Employees WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const payload = { id: user.id, role: user.role, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '8h' });
    return res.json({ user: payload, token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Login failed' });
  }
});

// Development helper to create a user quickly (disable in production)
router.post('/seed-user', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Not allowed' });
  const { name, email, password, role = 'employee', manager_id = null } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.execute(
      'INSERT INTO Employees (name, email, role, manager_id, password_hash) VALUES (?,?,?,?,?)',
      [name, email, role, manager_id, hash]
    );
    return res.json({ id: r.insertId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Seed failed' });
  }
});