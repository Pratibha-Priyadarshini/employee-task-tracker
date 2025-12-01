const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

function initDbMultiTenant() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, process.env.DB_PATH || 'database.db');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    db.serialize(() => {
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

      db.get(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`, [], (err, row) => {
        if (err) {
          db.close(() => reject(err));
          return;
        }
        if (row && row.count === 0) {
          const crypto = require('crypto');
          const hashedPassword = bcrypt.hashSync('password123', 10);
          const admin1Code = crypto.randomBytes(4).toString('hex').toUpperCase();
          const admin2Code = crypto.randomBytes(4).toString('hex').toUpperCase();

          const stmt = db.prepare('INSERT INTO users (username, email, password, role, admin_code, admin_id) VALUES (?, ?, ?, ?, ?, ?)');
          stmt.run(['admin1', 'admin1@company.com', hashedPassword, 'admin', admin1Code, null]);
          stmt.run(['admin2', 'admin2@company.com', hashedPassword, 'admin', admin2Code, null]);
          stmt.finalize(() => {
            console.log('✅ Multi-tenant DB initialized');
            console.log('📋 Sample Admins:');
            console.log(`   admin1 / password123 | Admin Code: ${admin1Code}`);
            console.log(`   admin2 / password123 | Admin Code: ${admin2Code}`);
            db.close(() => resolve());
          });
        } else {
          console.log('✅ Multi-tenant DB ready (admins already present)');
          db.close(() => resolve());
        }
      });
    });
  });
}

module.exports = initDbMultiTenant;

// Allow running directly from CLI as a script as well
if (require.main === module) {
  initDbMultiTenant()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
