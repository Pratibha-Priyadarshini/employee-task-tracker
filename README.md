# Employee Task Tracker 📊

A full-stack web application for managing employees and their tasks within an organization. Built with React, Node.js/Express, and SQLite.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue)
![Tech Stack](https://img.shields.io/badge/Node.js-Express-green)
![Tech Stack](https://img.shields.io/badge/Database-SQLite-orange)

## 🚀 Features

- **Dashboard Overview**: View real-time statistics including total tasks, completion rates, and employee workload
- **Employee Management**: Full CRUD operations for employee records
- **Task Management**: Create, update, and track tasks with status, priority, and due dates
- **Advanced Filtering**: Filter tasks by status, employee, and priority
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **REST API**: Well-structured API endpoints with proper error handling
- **Data Persistence**: SQLite database with proper relationships and foreign keys

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

### Employees Table
```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
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

# Initialize database with sample data
npm run init-db

# Start the server
npm start

# For development with auto-reload
npm run dev
```

The backend server will start on **http://localhost:5000**

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

## 🌐 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Employees Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | Get all employees |
| GET | `/employees/:id` | Get single employee by ID |
| POST | `/employees` | Create new employee |
| PUT | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Delete employee |

#### Create Employee Example
```json
POST /api/employees
{
  "name": "John Doe",
  "email": "john@company.com",
  "department": "Engineering",
  "position": "Developer"
}
```

### Tasks Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks (supports filters) |
| GET | `/tasks/:id` | Get single task by ID |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

#### Query Parameters for GET /tasks
- `status`: Filter by status (pending, in-progress, completed)
- `employee_id`: Filter by employee ID
- `priority`: Filter by priority (low, medium, high)

#### Create Task Example
```json
POST /api/tasks
{
  "title": "Implement Login Feature",
  "description": "Add JWT authentication",
  "status": "pending",
  "priority": "high",
  "employee_id": 1,
  "due_date": "2025-12-31"
}
```

### Dashboard Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get dashboard statistics |

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

### Dashboard View
The dashboard displays:
- Total tasks, completed tasks, in-progress, and pending
- Total employees
- Completion rate percentage
- High priority task count
- Tasks breakdown by employee

### Task Management
- View all tasks in a table format
- Filter by status, employee, and priority
- Add new tasks with full details
- Edit existing tasks
- Delete tasks with confirmation

### Employee Management
- View all employees with their details
- Add new employees
- Edit employee information
- Delete employees (cascades to their tasks)

## 🔒 Environment Variables

### Backend (.env)
```env
PORT=5000
DB_PATH=./database.db
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
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

The application comes with pre-populated sample data:
- **5 Employees** across different departments
- **10 Tasks** with various statuses and priorities

To reset the database:
```bash
cd backend
rm database.db
npm run init-db
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

## 🚧 Known Limitations & Assumptions

1. **Authentication**: No user authentication implemented (can be added as bonus feature)
2. **Database**: Using SQLite for simplicity (can be replaced with PostgreSQL/MySQL)
3. **File Uploads**: No file attachment support for tasks
4. **Notifications**: No email/push notifications for task updates
5. **Pagination**: All records loaded at once (suitable for small-medium datasets)
6. **Time Zones**: All dates stored in UTC

## 🎯 Future Enhancements

- [ ] User authentication and authorization
- [ ] Role-based access control (Admin vs Regular User)
- [ ] Task comments and activity history
- [ ] File attachments for tasks
- [ ] Email notifications
- [ ] Task search functionality
- [ ] Pagination for large datasets
- [ ] Data export (CSV/PDF)
- [ ] Dark mode
- [ ] Task analytics and reporting

## 🤝 Contributing

This is an internship assignment project. For any questions or clarifications, please contact the development team.

## 📄 License

This project is created as part of the ProU Technology internship assignment.

## 👨‍💻 Author

**Internship Candidate** - Track 3: Fullstack Developer

---

## 📞 Support

For any issues or questions:
1. Check the API endpoint documentation above
2. Verify environment variables are set correctly
3. Ensure both frontend and backend servers are running
4. Check browser console and server logs for errors

---

**Built with ❤️ for ProU Technology Internship Assignment**
