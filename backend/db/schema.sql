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
);

CREATE TABLE IF NOT EXISTS Attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  start_time DATETIME NULL,
  end_time DATETIME NULL,
  hours_worked DECIMAL(5,2) NULL,
  FOREIGN KEY (employee_id) REFERENCES Employees(id)
);

CREATE TABLE IF NOT EXISTS LeaveRequests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type ENUM('paid','sick','unpaid') NOT NULL,
  status ENUM('pending','approved','partially_approved','rejected') NOT NULL DEFAULT 'pending',
  remarks TEXT NULL,
  FOREIGN KEY (employee_id) REFERENCES Employees(id)
);