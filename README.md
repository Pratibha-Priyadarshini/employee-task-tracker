# Employee Task Tracker 📊

A full-stack web application for managing employees and their tasks within an organization. Built with React, Node.js/Express, and SQLite.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue)
![Tech Stack](https://img.shields.io/badge/Node.js-Express-green)
![Tech Stack](https://img.shields.io/badge/Database-SQLite-orange)

## 🚀 Features

### Core Features
- **Dashboard Overview**: View real-time statistics including total tasks, completion rates, and employee workload
- **Employee Management**: Full CRUD operations for employee records
- **Task Management**: Create, update, and track tasks with status, priority, and due dates
- **Advanced Filtering**: Filter tasks by status, employee, and priority
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **REST API**: Well-structured API endpoints with proper error handling
- **Data Persistence**: SQLite database with proper relationships and foreign keys

### Bonus Features (Multi-Tenant Architecture)
- **User Authentication**: JWT-based authentication with httpOnly cookies
- **Role-Based Access Control**: Admin and User roles with distinct permissions
- **Multi-Tenant Support**: Each admin manages their own employees and tasks
- **Admin Codes**: Unique codes for user registration under specific admins
- **Scoped Data**: Admins see only their data; users see only their assigned tasks
- **User Dashboard**: Personalized dashboard for regular users showing their task stats

## 🏗️ Architecture

```
employee-task-tracker/
├── backend/                 # Node.js + Express API Server
│   ├── server.js           # Main server file with all routes
│   ├── database.js         # Database connection & query helpers
│   ├── initDb.js           # Database initialization & sample data
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables
│
├── frontend/               # React + Vite Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EmployeeList.jsx
│   │   │   ├── EmployeeModal.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskModal.jsx
│   │   ├── services/
│   │   │   └── api.js     # API service layer
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # App entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
└── README.md              # This file
```

## 📋 Database Schema

### Users Table (Multi-Tenant)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
  admin_code TEXT UNIQUE,
  admin_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Employees Table
```sql
CREATE TABLE employees (
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
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
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
);
```

## 🔧 Tech Stack

### Frontend
- **React 18.2**: UI library
- **Vite**: Build tool and dev server
- **CSS3**: Styling with custom responsive design
- **Fetch API**: HTTP client for API calls

### Backend
- **Node.js**: Runtime environment
- **Express 4.x**: Web framework
- **SQLite3**: Database
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **cookie-parser**: Cookie handling
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd employee-task-tracker
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Initialize database with multi-tenant schema (optional, runs on startup)
npm run init-mt

# Start the server (auto-initializes DB if missing)
npm start

# For development with auto-reload
npm run dev
```

The backend server will start on **http://localhost:5000**

**Note**: The database initializes automatically on server start with multi-tenant schema and two sample admin accounts.

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:3000**

### 4. Access the Application

Open your browser and go to: **http://localhost:3000**

**Sample Login Credentials** (created on first startup):
- **Admin**: `admin1` / `password123` (Admin Code displayed in server logs)
- **Admin**: `admin2` / `password123` (Admin Code displayed in server logs)

**To test multi-tenant features**:
1. Register as Admin → note your admin code
2. Register as User → provide the admin code
3. Admin adds the user as an employee
4. Admin creates tasks for that employee
5. User logs in and sees only their tasks

## 🌐 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user (admin or user) | No |
| POST | `/auth/login` | Login and receive JWT token | No |
| POST | `/auth/logout` | Logout and clear token | Yes |
| GET | `/auth/me` | Get current user info | Yes |

#### Register User Example
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "adminCode": "ABC12345"
}

Response (user):
{
  "id": 3,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Register Admin Example
```json
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}

Response (admin):
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "adminCode": "A1B2C3D4",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login Example
```json
POST /api/auth/login
{
  "username": "johndoe",
  "password": "password123"
}

Response:
{
  "id": 3,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "user",
  "admin_id": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```json
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "id": 3,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "user",
  "admin_code": null,
  "admin_id": 1,
  "created_at": "2025-12-02T10:00:00.000Z",
  "employee": {
    "id": 5,
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "position": "Developer"
  }
}
```

### Employees Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/employees` | Get all employees (admin: their employees; user: self) | Yes |
| GET | `/employees/:id` | Get single employee by ID | Yes |
| POST | `/employees` | Create new employee (admin only) | Yes (Admin) |
| PUT | `/employees/:id` | Update employee (admin only) | Yes (Admin) |
| DELETE | `/employees/:id` | Delete employee (admin only) | Yes (Admin) |

#### Create Employee Example
```json
POST /api/employees
Authorization: Bearer <admin-token>
{
  "email": "john@company.com",
  "department": "Engineering",
  "position": "Developer"
}

Note: User must be registered with your admin code before adding as employee
```

### Tasks Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | Get all tasks (admin: their tasks; user: their own) | Yes |
| GET | `/tasks/:id` | Get single task by ID | Yes |
| POST | `/tasks` | Create new task (admin only) | Yes (Admin) |
| PUT | `/tasks/:id` | Update task (admin only) | Yes (Admin) |
| PATCH | `/tasks/:id/status` | Update task status (users can update their own) | Yes |
| DELETE | `/tasks/:id` | Delete task (admin only) | Yes (Admin) |

#### Query Parameters for GET /tasks
- `status`: Filter by status (pending, in-progress, completed)
- `employee_id`: Filter by employee ID
- `priority`: Filter by priority (low, medium, high)

#### Create Task Example
```json
POST /api/tasks
Authorization: Bearer <admin-token>
{
  "title": "Implement Login Feature",
  "description": "Add JWT authentication",
  "status": "pending",
  "priority": "high",
  "employee_id": 1,
  "due_date": "2025-12-31"
}
```

#### Update Task Status (User or Admin)
```json
PATCH /api/tasks/5/status
Authorization: Bearer <token>
{
  "status": "in-progress"
}
```

### Dashboard Endpoint

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get dashboard statistics (role-specific) | Yes |

#### Dashboard Response Example
```json
{
  "total_tasks": 10,
  "completed_tasks": 3,
  "in_progress_tasks": 4,
  "pending_tasks": 3,
  "high_priority_tasks": 2,
  "total_employees": 5,
  "completion_rate": 30.00,
  "tasks_by_employee": [
    {
      "name": "John Doe",
      "task_count": 4,
      "completed": 2
    }
  ]
}
```

## 🎨 Screenshots

### Login and Register
- User authentication and role-based access (Admin/User)
- Admin can add/update/delete tasks and employees
- Regular users can view their assigned tasks only 
<img width="1859" height="1079" alt="image" src="https://github.com/user-attachments/assets/e71dd159-c357-4833-82e3-520efabd9f7c" />
<img width="1858" height="1385" alt="image" src="https://github.com/user-attachments/assets/106daeab-6bcb-431b-83d6-f5abde5ba81e" />

### Dashboard View (Admin)
The dashboard displays:
- Total tasks, completed tasks, in-progress, and pending
- Total employees
- Completion rate percentage
- High priority task count
- Tasks breakdown by employee
<img width="1856" height="1479" alt="image" src="https://github.com/user-attachments/assets/7b417e05-b4d4-4e56-8573-85d28deda92f" />

### Task Management (Admin)
- View all tasks in a table format
- Filter by status, employee, and priority
- Add new tasks with full details
- Edit existing tasks
- Delete tasks with confirmation
<img width="1847" height="1344" alt="image" src="https://github.com/user-attachments/assets/3eddf864-904b-4d67-a3d6-84b94c7367c1" />
<img width="1844" height="842" alt="image" src="https://github.com/user-attachments/assets/61bc88ab-2fae-4ac6-b29a-58f12d9a738d" />

### Employee Management (Admin)
- View all employees with their details
- Add new employees
- Edit employee information
- Delete employees (cascades to their tasks)
<img width="1855" height="1045" alt="image" src="https://github.com/user-attachments/assets/d1fae015-63a6-4415-bf10-ab23eebe45aa" />
<img width="1848" height="853" alt="image" src="https://github.com/user-attachments/assets/f2beb464-2d2d-4844-8782-9e43b61cea96" />

### Dashboard View (User)
- Total tasks, completed tasks, in-progress, and pending
- Completion rate percentage
- High priority task count
<img width="1841" height="1535" alt="image" src="https://github.com/user-attachments/assets/f650a6f5-cbd0-4012-bfdd-cf02d7fcb786" />

### Task Management (User)
- View all tasks in a table format
- Filter by status and priority
- Update status of existing tasks
<img width="1843" height="1073" alt="image" src="https://github.com/user-attachments/assets/b2817f65-88da-450b-a75c-fbe49ef7b6ed" />

## 🔒 Environment Variables

### Backend (.env)
```env
PORT=5000
DB_PATH=./database.db
NODE_ENV=development
JWT_SECRET=changeme-dev-secret-please-replace
CORS_ORIGINS=http://localhost:3000,https://employee-task-tracker-psi.vercel.app
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

**Production Environment (Render)**:
```env
NODE_ENV=production
DB_PATH=./database.db
JWT_SECRET=<strong-random-secret>
CORS_ORIGINS=https://employee-task-tracker-psi.vercel.app
```

**Production Environment (Vercel)**:
```env
VITE_API_URL=https://<your-render-service>.onrender.com/api
```

## 🧪 Testing the Application

### Manual Testing Steps

1. **Test Dashboard**
   - Navigate to Dashboard
   - Verify all statistics are displayed correctly
   - Check that employee task breakdown is shown

2. **Test Employee Management**
   - Add a new employee
   - Edit an existing employee
   - Delete an employee
   - Verify email uniqueness constraint

3. **Test Task Management**
   - Create a new task
   - Update task status (pending → in-progress → completed)
   - Update task priority
   - Delete a task
   - Test filters (status, employee, priority)

4. **Test Data Relationships**
   - Delete an employee with tasks
   - Verify their tasks are also deleted (cascade)

## 📝 Sample Data

The application initializes with:
- **2 Admin accounts** with unique admin codes (printed in server logs on first start)
- **No employees or tasks** initially (you create them after registration)

To reset the database:
```bash
cd backend
rm database.db
npm run init-mt
# or just restart the server (auto-initializes)
node server.js
```

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite hot module replacement
```

### Build for Production

#### Frontend Build
```bash
cd frontend
npm run build
# Outputs to frontend/dist
```

## 🚀 Deployment (Render + Vercel)

### Backend (Render)

1. **Create Web Service** from your GitHub repository
   - Root directory: `backend/`
   - Build command: `npm install`
   - Start command: `node server.js`

2. **Environment Variables**:
   ```
   NODE_ENV=production
   DB_PATH=./database.db
   JWT_SECRET=<generate-strong-random-secret>
   CORS_ORIGINS=https://<your-vercel-app>.vercel.app
   ```

3. **Database**: SQLite runs on ephemeral filesystem (data resets on redeploy). For persistence, consider upgrading to a managed DB (PostgreSQL/MySQL) or adding a paid Render Disk.

4. **Deploy**: Render will auto-deploy. Check logs for admin codes.

### Frontend (Vercel)

1. **Import Project** from GitHub
   - Framework preset: Vite
   - Root directory: `frontend/`
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://<your-render-service>.onrender.com/api
   ```

3. **Deploy**: Vercel will auto-build and deploy.

### Post-Deployment

- Visit your Vercel URL
- Check Render logs for admin codes
- Test registration, login, admin code copy, employee/task CRUD
- Verify CORS by checking browser console (no CORS errors)

**Live Demo**: `https://employee-task-tracker-psi.vercel.app`

---

## 🎯 Future Enhancements

- [ ] File attachments for tasks
- [ ] Email notifications
- [ ] Data export (CSV/PDF)
- [ ] Dark mode
- [ ] Task analytics and reporting

## 🤝 Contributing

This is an internship assignment project. For any questions or clarifications, please contact the development team.

## 📄 License

This project is created as part of the ProU Technology internship assignment.

## 👨‍💻 Author

**Pratibha Priyadarshini** - Track 3: Fullstack Developer

---

## 📞 Support

For any issues or questions:
1. Check the API endpoint documentation above
2. Verify environment variables are set correctly
3. Ensure both frontend and backend servers are running
4. Check browser console and server logs for errors

---

**Built with ❤️ for ProU Technology Internship Assignment**
