import express from 'express';
import pool from '../config/db.js';
import { requireRoles } from '../middleware/auth.js';

export const router = express.Router();

// Create a leave request (employee)
router.post('/', async (req, res) => {
  const employeeId = req.user.id;
  const { start_date, end_date, leave_type, remarks } = req.body || {};
  if (!start_date || !end_date || !leave_type) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const [r] = await pool.execute(
      'INSERT INTO LeaveRequests (employee_id, start_date, end_date, leave_type, remarks) VALUES (?,?,?,?,?)',
      [employeeId, start_date, end_date, leave_type, remarks || null]
    );
    res.json({ id: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create leave request' });
  }
});

// List leave requests
router.get('/', async (req, res) => {
  const role = req.user.role;
  const userId = req.user.id;
  try {
    let rows;
    if (role === 'hr') {
      [rows] = await pool.execute(
        'SELECT lr.*, e.name FROM LeaveRequests lr JOIN Employees e ON e.id = lr.employee_id ORDER BY lr.id DESC'
      );
    } else if (role === 'manager') {
      [rows] = await pool.execute(
        `SELECT lr.*, e.name FROM LeaveRequests lr
         JOIN Employees e ON e.id = lr.employee_id
         WHERE e.manager_id = ? ORDER BY lr.id DESC`,
        [userId]
      );
    } else {
      [rows] = await pool.execute(
        'SELECT lr.*, (SELECT name FROM Employees WHERE id = lr.employee_id) as name FROM LeaveRequests lr WHERE employee_id = ? ORDER BY lr.id DESC',
        [userId]
      );
    }
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch leave requests' });
  }
});

// Approve/Reject/Partial (manager or HR)
router.post('/:id/decision', requireRoles('manager', 'hr'), async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body || {};
  if (!['approved', 'rejected', 'partially_approved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // If manager, ensure the request belongs to their team
    if (req.user.role === 'manager') {
      const [rows] = await pool.execute(
        `SELECT lr.id FROM LeaveRequests lr JOIN Employees e ON e.id = lr.employee_id WHERE lr.id = ? AND e.manager_id = ?`,
        [id, req.user.id]
      );
      if (rows.length === 0) return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.execute('UPDATE LeaveRequests SET status = ?, remarks = ? WHERE id = ?', [status, remarks || null, id]);
    res.json({ id, status, remarks });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update leave request' });
  }
});