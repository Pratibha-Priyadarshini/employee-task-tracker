const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Employees table
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      position TEXT NOT NULL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL CHECK(status IN ('pending', 'in-progress', 'completed')),
      priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
      employee_id INTEGER NOT NULL,
      due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Insert sample users first
  // Password for all: password123
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  const users = [
    ['admin', 'admin@company.com', hashedPassword, 'admin'],
    ['johndoe', 'john.doe@company.com', hashedPassword, 'user'],
    ['janesmith', 'jane.smith@company.com', hashedPassword, 'user'],
    ['mikejohnson', 'mike.johnson@company.com', hashedPassword, 'user'],
    ['sarahw', 'sarah.williams@company.com', hashedPassword, 'user'],
    ['davidb', 'david.brown@company.com', hashedPassword, 'user']
  ];

  const insertUser = db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
  users.forEach(user => {
    insertUser.run(user);
  });
  insertUser.finalize();

  // Insert sample employees with user_id references
  const employees = [
    ['John Doe', 'john.doe@company.com', 'Engineering', 'Senior Developer', 2],
    ['Jane Smith', 'jane.smith@company.com', 'Marketing', 'Marketing Manager', 3],
    ['Mike Johnson', 'mike.johnson@company.com', 'Engineering', 'Backend Developer', 4],
    ['Sarah Williams', 'sarah.williams@company.com', 'Design', 'UI/UX Designer', 5],
    ['David Brown', 'david.brown@company.com', 'Engineering', 'Frontend Developer', 6]
  ];

  const insertEmployee = db.prepare('INSERT INTO employees (name, email, department, position, user_id) VALUES (?, ?, ?, ?, ?)');
  employees.forEach(employee => {
    insertEmployee.run(employee);
  });
  insertEmployee.finalize();

  // Insert sample tasks
  const tasks = [
    ['Implement User Authentication', 'Add JWT-based authentication to the API', 'in-progress', 'high', 1, '2025-12-15'],
    ['Design Landing Page', 'Create mockups for the new landing page', 'completed', 'medium', 4, '2025-11-25'],
    ['Database Optimization', 'Optimize database queries for better performance', 'pending', 'high', 3, '2025-12-10'],
    ['Marketing Campaign', 'Plan and execute Q1 marketing campaign', 'in-progress', 'medium', 2, '2025-12-20'],
    ['Bug Fix: Login Issue', 'Fix the login redirect bug reported by users', 'completed', 'high', 1, '2025-11-28'],
    ['Update Documentation', 'Update API documentation with new endpoints', 'pending', 'low', 5, '2025-12-05'],
    ['Mobile Responsive Design', 'Make the dashboard mobile responsive', 'in-progress', 'medium', 5, '2025-12-08'],
    ['Code Review', 'Review pull requests from the team', 'pending', 'medium', 1, '2025-12-01'],
    ['User Research', 'Conduct user interviews for new features', 'in-progress', 'high', 4, '2025-12-12'],
    ['Setup CI/CD Pipeline', 'Configure automated testing and deployment', 'pending', 'high', 3, '2025-12-18']
  ];

  const insertTask = db.prepare('INSERT INTO tasks (title, description, status, priority, employee_id, due_date) VALUES (?, ?, ?, ?, ?, ?)');
  tasks.forEach(task => {
    insertTask.run(task);
  });
  insertTask.finalize();

  console.log('Database initialized successfully!');
  console.log('Sample data inserted!');
  console.log('');
  console.log('Sample Login Credentials:');
  console.log('Admin - username: admin, password: password123');
  console.log('User - username: johndoe, password: password123');
  console.log('All other users also have password: password123');
});

db.close();
