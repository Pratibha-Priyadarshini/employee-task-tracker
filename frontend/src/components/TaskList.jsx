import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI, employeeAPI } from '../services/api';
import TaskModal from './TaskModal';

function TaskList({ onUpdate }) {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    employee_id: '',
    priority: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tasksData = await taskAPI.getAll(filters);
      setTasks(tasksData);
      
      // Only fetch employees list for admin
      if (isAdmin) {
        const employeesData = await employeeAPI.getAll();
        setEmployees(employeesData);
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskAPI.delete(id);
      await fetchData();
      onUpdate();
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleModalSuccess = async () => {
    await fetchData();
    onUpdate();
    handleModalClose();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus(taskId, newStatus);
      await fetchData();
      onUpdate();
    } catch (err) {
      alert('Error updating task status: ' + err.message);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      employee_id: '',
      priority: '',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading && tasks.length === 0) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{isAdmin ? 'Tasks' : 'My Tasks'}</h2>
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleAdd}>
              ➕ Add Task
            </button>
          )}
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {isAdmin && (
            <div className="filter-group">
              <label>Employee</label>
              <select
                name="employee_id"
                value={filters.employee_id}
                onChange={handleFilterChange}
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <label>Priority</label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {(filters.status || filters.employee_id || filters.priority) && (
            <div className="filter-group">
              <label>&nbsp;</label>
              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {error && <div className="form-error">{error}</div>}

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No tasks found</div>
            <p>
              {filters.status || filters.employee_id || filters.priority
                ? 'Try adjusting your filters'
                : (isAdmin ? 'Click "Add Task" to create your first task' : 'Ask admin to create your first task')}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Task</th>
                  {isAdmin && <th>Assigned To</th>}
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>
                      <strong>{task.title}</strong>
                      {task.description && (
                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                          {task.description.substring(0, 50)}
                          {task.description.length > 50 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    {isAdmin && <td>{task.employee_name}</td>}
                    <td>
                      <select
                        className={`status-select status-${task.status}`}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>{formatDate(task.due_date)}</td>
                    {isAdmin && (
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEdit(task)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(task.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          employees={employees}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

export default TaskList;
