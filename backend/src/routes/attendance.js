import express from 'express';
import pool from '../config/db.js';

export const router = express.Router();

router.post('/start', async (req, res) => {
  const employeeId = req.user.id;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      'SELECT id, start_time FROM Attendance WHERE employee_id = ? AND date = ?',
      [employeeId, dateStr]
    );
    if (rows.length > 0 && rows[0].start_time) {
      await conn.rollback();
      return res.status(400).json({ message: 'Start already marked' });
    }
    if (rows.length === 0) {
      await conn.execute(
        'INSERT INTO Attendance (employee_id, date, start_time) VALUES (?, ?, ?)',
        [employeeId, dateStr, now]
      );
    } else {
      await conn.execute(
        'UPDATE Attendance SET start_time = ? WHERE id = ?',
        [now, rows[0].id]
      );
    }
    await conn.commit();
    return res.json({ attendance: { start_ts: now } });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return res.status(500).json({ message: 'Failed to mark start' });
  } finally {
    conn.release();
  }
});

router.post('/end', async (req, res) => {
  const employeeId = req.user.id;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      'SELECT id, start_time FROM Attendance WHERE employee_id = ? AND date = ?',
      [employeeId, dateStr]
    );
    if (rows.length === 0 || !rows[0].start_time) {
      await conn.rollback();
      return res.status(400).json({ message: 'Start not marked yet' });
    }
    const startTime = new Date(rows[0].start_time);
    const diffMs = now - startTime;
    const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    await conn.execute(
      'UPDATE Attendance SET end_time = ?, hours_worked = ? WHERE id = ?',
      [now, hoursWorked, rows[0].id]
    );
    await conn.commit();
    return res.json({ attendance: { hours_worked: hoursWorked } });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return res.status(500).json({ message: 'Failed to mark end' });
  } finally {
    conn.release();
  }
});

router.get('/history', async (req, res) => {
  const employeeId = req.user.id;
  try {
    const [rows] = await pool.execute(
      'SELECT id, date, TIME_FORMAT(start_time, "%H:%i:%s") as start_time, TIME_FORMAT(end_time, "%H:%i:%s") as end_time, hours_worked FROM Attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 60',
      [employeeId]
    );
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to fetch history' });
  }
});

router.get('/report/monthly', async (req, res) => {
  const month = req.query.month; // YYYY-MM optional
  const now = new Date();
  const monthPrefix = month || now.toISOString().slice(0, 7);
  const role = req.user.role;
  const userId = req.user.id;
  try {
    let rows;
    if (role === 'hr') {
      [rows] = await pool.execute(
        `SELECT e.id as employee_id, e.name, COALESCE(SUM(a.hours_worked),0) as total_hours,
          CASE WHEN COALESCE(SUM(a.hours_worked),0) < 160 THEN 1 ELSE 0 END as discrepancy
         FROM Employees e
         LEFT JOIN Attendance a ON a.employee_id = e.id AND DATE_FORMAT(a.date, '%Y-%m') = ?
         GROUP BY e.id, e.name
         ORDER BY e.name`,
        [monthPrefix]
      );
    } else if (role === 'manager') {
      [rows] = await pool.execute(
        `SELECT e.id as employee_id, e.name, COALESCE(SUM(a.hours_worked),0) as total_hours,
          CASE WHEN COALESCE(SUM(a.hours_worked),0) < 160 THEN 1 ELSE 0 END as discrepancy
         FROM Employees e
         LEFT JOIN Attendance a ON a.employee_id = e.id AND DATE_FORMAT(a.date, '%Y-%m') = ?
         WHERE e.manager_id = ?
         GROUP BY e.id, e.name
         ORDER BY e.name`,
        [monthPrefix, userId]
      );
    } else {
      [rows] = await pool.execute(
        `SELECT e.id as employee_id, e.name, COALESCE(SUM(a.hours_worked),0) as total_hours,
          CASE WHEN COALESCE(SUM(a.hours_worked),0) < 160 THEN 1 ELSE 0 END as discrepancy
         FROM Employees e
         LEFT JOIN Attendance a ON a.employee_id = e.id AND DATE_FORMAT(a.date, '%Y-%m') = ?
         WHERE e.id = ?
         GROUP BY e.id, e.name`,
        [monthPrefix, userId]
      );
    }
    return res.json(rows.map(r => ({...r, discrepancy: r.discrepancy === 1 })));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to fetch monthly report' });
  }
});