import pool from '../config/db.js';
import mysql from 'mysql2/promise';

async function ensureDatabaseExists() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT || 3306);
  const dbName = process.env.DB_NAME || 'attendance_db';

  const conn = await mysql.createConnection({ host, user, password, port });
  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
  } finally {
    await conn.end();
  }
}

export async function runMigrations() {
  // Ensure database exists before using the pooled connection that targets it
  await ensureDatabaseExists();
  const createEmployees = `
    CREATE TABLE IF NOT EXISTS Employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      role ENUM('employee','manager','hr') NOT NULL DEFAULT 'employee',
      manager_id INT NULL,
      contact_info JSON NULL,
      password_hash VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (manager_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const createAttendance = `
    CREATE TABLE IF NOT EXISTS Attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      date DATE NOT NULL,
      start_time DATETIME NULL,
      end_time DATETIME NULL,
      hours_worked DECIMAL(5,2) NULL,
      FOREIGN KEY (employee_id) REFERENCES Employees(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const createLeave = `
    CREATE TABLE IF NOT EXISTS LeaveRequests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      leave_type ENUM('paid','sick','unpaid') NOT NULL,
      status ENUM('pending','approved','partially_approved','rejected') NOT NULL DEFAULT 'pending',
      remarks TEXT NULL,
      FOREIGN KEY (employee_id) REFERENCES Employees(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(createEmployees);
    await conn.query(createAttendance);
    await conn.query(createLeave);
    await conn.commit();
    console.log('Migrations applied');
  } catch (e) {
    await conn.rollback();
    console.error('Migration failed', e);
    throw e;
  } finally {
    conn.release();
  }
}