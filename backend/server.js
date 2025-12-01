require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const { authenticate, requireAdmin, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed for this origin: ' + origin), false);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ==================== AUTHENTICATION ENDPOINTS ====================

// POST register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user', adminCode } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let adminId = null;
    let generatedAdminCode = null;

    // If registering as admin, generate a unique admin code
    if (role === 'admin') {
      const crypto = require('crypto');
      generatedAdminCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    } else {
      // If registering as user, validate and find admin by code
      if (!adminCode) {
        return res.status(400).json({ error: 'Admin code is required for user registration' });
      }

      const admin = await db.get('SELECT id FROM users WHERE admin_code = ? AND role = "admin"', [adminCode]);
      if (!admin) {
        return res.status(400).json({ error: 'Invalid admin code' });
      }

      adminId = admin.id;
    }

    // Insert user
    const result = await db.run(
      'INSERT INTO users (username, email, password, role, admin_code, admin_id) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, generatedAdminCode, adminId]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: result.id, username, email, role, adminId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      id: result.id,
      username,
      email,
      role,
      adminCode: generatedAdminCode, // Only set for admins
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
});

// POST login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        admin_id: user.admin_id || null
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      admin_code: user.admin_code || null,
      admin_id: user.admin_id || null,
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// POST logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// GET current user
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, username, email, role, admin_code, admin_id, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is a regular user, get their employee info
    if (user.role === 'user') {
      const employee = await db.get('SELECT * FROM employees WHERE user_id = ?', [user.id]);
      user.employee = employee;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ==================== EMPLOYEES ENDPOINTS ====================

// GET all employees (requires authentication)
app.get('/api/employees', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let employees;
    if (userRole === 'admin') {
      // Admin sees only their employees
      employees = await db.all('SELECT * FROM employees WHERE admin_id = ? ORDER BY name', [userId]);
    } else {
      // Regular users see only themselves
      employees = await db.all('SELECT * FROM employees WHERE user_id = ? ORDER BY name', [userId]);
    }
    
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET single employee by ID (requires authentication)
app.get('/api/employees/:id', authenticate, async (req, res) => {
  try {
    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// POST create new employee (admin only)
app.post('/api/employees', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email, department, position } = req.body;
    const adminId = req.user.id;
    
    // Validation
    if (!email || !department || !position) {
      return res.status(400).json({ error: 'Email, department, and position are required' });
    }

    // Find user by email who registered under this admin
    const user = await db.get(
      'SELECT id, username, email FROM users WHERE email = ? AND admin_id = ? AND role = "user"',
      [email, adminId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found. User must register with your admin code first.' });
    }

    // Check if employee already exists for this user
    const existingEmployee = await db.get(
      'SELECT id FROM employees WHERE user_id = ?',
      [user.id]
    );

    if (existingEmployee) {
      return res.status(400).json({ error: 'This user is already added as an employee' });
    }

    const result = await db.run(
      'INSERT INTO employees (name, email, department, position, user_id, admin_id) VALUES (?, ?, ?, ?, ?, ?)',
      [user.username, user.email, department, position, user.id, adminId]
    );

    const newEmployee = await db.get('SELECT * FROM employees WHERE id = ?', [result.id]);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create employee' });
    }
  }
});

// PUT update employee (admin only)
app.put('/api/employees/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { department, position } = req.body;
    const adminId = req.user.id;
    
    // Validation
    if (!department || !position) {
      return res.status(400).json({ error: 'Department and position are required' });
    }

    const result = await db.run(
      'UPDATE employees SET department = ?, position = ? WHERE id = ? AND admin_id = ?',
      [department, position, req.params.id, adminId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Employee not found or you do not have permission' });
    }

    const updatedEmployee = await db.get('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE employee (admin only)
app.delete('/api/employees/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const result = await db.run('DELETE FROM employees WHERE id = ? AND admin_id = ?', [req.params.id, adminId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Employee not found or you do not have permission' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// ==================== TASKS ENDPOINTS ====================

// GET all tasks with optional filters (filtered by user role)
app.get('/api/tasks', authenticate, async (req, res) => {
  try {
    const { status, employee_id, priority } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let sql = `
      SELECT tasks.*, employees.name as employee_name 
      FROM tasks 
      JOIN employees ON tasks.employee_id = employees.id
    `;
    const params = [];
    const conditions = [];

    // Admin sees only their tasks
    if (userRole === 'admin') {
      conditions.push('tasks.admin_id = ?');
      params.push(userId);
    } else {
      // Regular users can only see their own tasks
      const employee = await db.get('SELECT id FROM employees WHERE user_id = ?', [userId]);
      if (employee) {
        conditions.push('tasks.employee_id = ?');
        params.push(employee.id);
      } else {
        // User has no employee record, return empty array
        return res.json([]);
      }
    }

    if (status) {
      conditions.push('tasks.status = ?');
      params.push(status);
    }

    if (employee_id) {
      conditions.push('tasks.employee_id = ?');
      params.push(employee_id);
    }

    if (priority) {
      conditions.push('tasks.priority = ?');
      params.push(priority);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY tasks.created_at DESC';

    const tasks = await db.all(sql, params);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET single task by ID (requires authentication)
app.get('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const task = await db.get(
      `SELECT tasks.*, employees.name as employee_name 
       FROM tasks 
       JOIN employees ON tasks.employee_id = employees.id 
       WHERE tasks.id = ?`,
      [req.params.id]
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST create new task (admin only)
app.post('/api/tasks', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, status, priority, employee_id, due_date } = req.body;
    const adminId = req.user.id;
    
    // Validation
    if (!title || !status || !priority || !employee_id) {
      return res.status(400).json({ error: 'Title, status, priority, and employee_id are required' });
    }

    // Verify employee belongs to this admin
    const employee = await db.get(
      'SELECT id FROM employees WHERE id = ? AND admin_id = ?',
      [employee_id, adminId]
    );

    if (!employee) {
      return res.status(403).json({ error: 'You can only assign tasks to your own employees' });
    }

    const validStatuses = ['pending', 'in-progress', 'completed'];
    const validPriorities = ['low', 'medium', 'high'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const result = await db.run(
      'INSERT INTO tasks (title, description, status, priority, employee_id, admin_id, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, status, priority, employee_id, adminId, due_date || null]
    );

    const newTask = await db.get(
      `SELECT tasks.*, employees.name as employee_name 
       FROM tasks 
       JOIN employees ON tasks.employee_id = employees.id 
       WHERE tasks.id = ?`,
      [result.id]
    );
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH update task status (users can update their own task status)
app.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validation
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get the task to check ownership
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Regular users can only update their own tasks
    if (req.user.role === 'user') {
      const employee = await db.get('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
      if (!employee || task.employee_id !== employee.id) {
        return res.status(403).json({ error: 'You can only update your own tasks' });
      }
    }

    // Update only the status
    const result = await db.run(
      `UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await db.get(
      `SELECT tasks.*, employees.name as employee_name 
       FROM tasks 
       JOIN employees ON tasks.employee_id = employees.id 
       WHERE tasks.id = ?`,
      [req.params.id]
    );
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// PUT update task (admin only - full update)
app.put('/api/tasks/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, status, priority, employee_id, due_date } = req.body;
    const adminId = req.user.id;
    
    // Validation
    if (!title || !status || !priority || !employee_id) {
      return res.status(400).json({ error: 'Title, status, priority, and employee_id are required' });
    }

    // Verify employee belongs to this admin
    const employee = await db.get(
      'SELECT id FROM employees WHERE id = ? AND admin_id = ?',
      [employee_id, adminId]
    );

    if (!employee) {
      return res.status(403).json({ error: 'You can only assign tasks to your own employees' });
    }

    const validStatuses = ['pending', 'in-progress', 'completed'];
    const validPriorities = ['low', 'medium', 'high'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const result = await db.run(
      `UPDATE tasks 
       SET title = ?, description = ?, status = ?, priority = ?, employee_id = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND admin_id = ?`,
      [title, description || null, status, priority, employee_id, due_date || null, req.params.id, adminId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found or you do not have permission' });
    }

    const updatedTask = await db.get(
      `SELECT tasks.*, employees.name as employee_name 
       FROM tasks 
       JOIN employees ON tasks.employee_id = employees.id 
       WHERE tasks.id = ?`,
      [req.params.id]
    );
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task (admin only)
app.delete('/api/tasks/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const result = await db.run('DELETE FROM tasks WHERE id = ? AND admin_id = ?', [req.params.id, adminId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found or you do not have permission' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ==================== DASHBOARD ENDPOINT ====================

// GET dashboard statistics (requires authentication)
app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // If user is admin, return all stats for their employees/tasks only
    if (userRole === 'admin') {
      const stats = await db.get(`
        SELECT 
          COALESCE(COUNT(*), 0) as total_tasks,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed_tasks,
          COALESCE(SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END), 0) as in_progress_tasks,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_tasks,
          COALESCE(SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END), 0) as high_priority_tasks,
          (SELECT COALESCE(COUNT(*), 0) FROM employees WHERE admin_id = ?) as total_employees
        FROM tasks
        WHERE admin_id = ?
      `, [userId, userId]);

      const completionRate = stats.total_tasks > 0 
        ? ((stats.completed_tasks / stats.total_tasks) * 100).toFixed(2)
        : 0;

      const tasksByEmployee = await db.all(`
        SELECT 
          employees.name,
          COALESCE(COUNT(tasks.id), 0) as task_count,
          COALESCE(SUM(CASE WHEN tasks.status = 'completed' THEN 1 ELSE 0 END), 0) as completed
        FROM employees
        LEFT JOIN tasks ON employees.id = tasks.employee_id AND tasks.admin_id = ?
        WHERE employees.admin_id = ?
        GROUP BY employees.id, employees.name
        ORDER BY task_count DESC
        LIMIT 5
      `, [userId, userId]);

      return res.json({
        ...stats,
        completion_rate: parseFloat(completionRate),
        tasks_by_employee: tasksByEmployee
      });
    }

    // For regular users, return only their stats
    const employee = await db.get(
      'SELECT * FROM employees WHERE user_id = ?',
      [userId]
    );

    if (!employee) {
      // User registered but not yet added as employee by admin
      return res.json({
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        pending_tasks: 0,
        high_priority_tasks: 0,
        medium_priority_tasks: 0,
        low_priority_tasks: 0,
        completion_rate: 0,
        employee_name: req.user.username,
        employee_email: req.user.email,
        employee_department: null,
        recent_tasks: []
      });
    }

    const stats = await db.get(`
      SELECT 
        COALESCE(COUNT(*), 0) as total_tasks,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed_tasks,
        COALESCE(SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END), 0) as in_progress_tasks,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_tasks,
        COALESCE(SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END), 0) as high_priority_tasks,
        COALESCE(SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END), 0) as medium_priority_tasks,
        COALESCE(SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END), 0) as low_priority_tasks
      FROM tasks
      WHERE employee_id = ?
    `, [employee.id]);

    const completionRate = stats.total_tasks > 0 
      ? ((stats.completed_tasks / stats.total_tasks) * 100).toFixed(2)
      : 0;

    // Get recent tasks
    const recentTasks = await db.all(`
      SELECT * FROM tasks
      WHERE employee_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [employee.id]);

    res.json({
      ...stats,
      completion_rate: parseFloat(completionRate),
      employee_name: employee.name,
      employee_email: employee.email,
      employee_department: employee.department,
      recent_tasks: recentTasks
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
