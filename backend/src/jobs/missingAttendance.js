import cron from 'node-cron';
import pool from '../config/db.js';
import { sendEmail } from '../services/email.js';

async function notifyMissingAttendance() {
  const hrEmail = process.env.HR_EMAIL || 'concur.dev@gmail.com';
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dateStr = yesterday.toISOString().slice(0, 10);

  const query = `
    SELECT e.id as employee_id, e.name as employee_name, e.email as employee_email,
           m.email as manager_email, a.id as attendance_id, a.start_time, a.end_time
    FROM Employees e
    LEFT JOIN Employees m ON m.id = e.manager_id
    LEFT JOIN Attendance a ON a.employee_id = e.id AND a.date = ?
    WHERE a.id IS NULL OR a.start_time IS NULL OR a.end_time IS NULL
  `;

  try {
    const [rows] = await pool.execute(query, [dateStr]);
    if (!rows.length) return;

    const managerToEmployees = new Map();
    for (const r of rows) {
      const key = r.manager_email || 'no_manager';
      if (!managerToEmployees.has(key)) managerToEmployees.set(key, []);
      managerToEmployees.get(key).push(r);
    }

    // Send summary to HR
    const hrLines = rows.map(r => `${r.employee_name} (${r.employee_email}) missing on ${dateStr}`);
    await sendEmail({
      to: hrEmail,
      subject: `Missing attendance for ${dateStr}`,
      text: hrLines.join('\n'),
    });

    // Notify each manager
    for (const [managerEmail, list] of managerToEmployees.entries()) {
      if (managerEmail === 'no_manager') continue;
      const lines = list.map(r => `${r.employee_name} (${r.employee_email}) missing on ${dateStr}`);
      await sendEmail({
        to: managerEmail,
        subject: `Your team missing attendance for ${dateStr}`,
        text: lines.join('\n'),
      });
    }
  } catch (e) {
    console.error('Missing attendance notifier failed', e);
  }
}

export function scheduleMissingAttendanceJob() {
  // Every weekday at 09:00 server time
  cron.schedule('0 9 * * 1-5', () => {
    notifyMissingAttendance();
  });
}

export { notifyMissingAttendance };