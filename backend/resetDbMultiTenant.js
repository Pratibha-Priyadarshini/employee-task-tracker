const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'database.db');

// Check if database exists and delete it
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('Deleted old database');
  } catch (err) {
    console.error('Error deleting database. Please close any programs using it and try again.');
    process.exit(1);
  }
}

const db = new sqlite3.Database(dbPath);

// Create tables and insert data
db.serialize(() => {
  // Users table with admin_code for admins
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      admin_code TEXT UNIQUE,
      admin_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Employees table - now linked to admin
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      position TEXT NOT NULL,
      user_id INTEGER,
      admin_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tasks table - now linked to admin
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL CHECK(status IN ('pending', 'in-progress', 'completed')),
      priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
      employee_id INTEGER NOT NULL,
      admin_id INTEGER NOT NULL,
      due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Insert sample admins with unique codes
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  // Generate unique admin codes
  const admin1Code = crypto.randomBytes(4).toString('hex').toUpperCase();
  const admin2Code = crypto.randomBytes(4).toString('hex').toUpperCase();
  
  const users = [
    ['admin1', 'admin1@company.com', hashedPassword, 'admin', admin1Code, null],
    ['admin2', 'admin2@company.com', hashedPassword, 'admin', admin2Code, null]
  ];

  const insertUser = db.prepare('INSERT INTO users (username, email, password, role, admin_code, admin_id) VALUES (?, ?, ?, ?, ?, ?)');
  users.forEach(user => {
    insertUser.run(user);
  });
  insertUser.finalize();

  console.log('\n✅ Database initialized successfully!');
  console.log('✅ Multi-tenant structure created!');
  console.log('\n📋 Sample Admin Credentials:');
  console.log(`   Admin 1 - username: admin1 | password: password123 | Admin Code: ${admin1Code}`);
  console.log(`   Admin 2 - username: admin2 | password: password123 | Admin Code: ${admin2Code}`);
  console.log('\n💡 Users need an admin code to register and link themselves to an admin');
  console.log('💡 Admins can only add employees who are already registered with their code\n');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  }
});
