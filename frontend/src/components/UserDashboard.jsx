import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

function UserDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">Error loading dashboard: {error}</div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'in-progress':
        return 'badge-warning';
      case 'pending':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'badge-danger';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div>
      <div className="card">
        <h2 className="card-title">My Dashboard</h2>
        <p className="text-secondary">Welcome back, {stats.employee_name}!</p>
        <div style={{ marginTop: '0.75rem' }}>
          <p><strong>Email:</strong> {stats.employee_email}</p>
          <p><strong>Department:</strong> {stats.employee_department}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">My Total Tasks</div>
          <div className="stat-value">{stats.total_tasks}</div>
        </div>

        <div className="stat-card green">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats.completed_tasks}</div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats.in_progress_tasks}</div>
        </div>

        <div className="stat-card red">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending_tasks}</div>
        </div>

        <div className="stat-card red">
          <div className="stat-label">High Priority</div>
          <div className="stat-value">{stats.high_priority_tasks}</div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-label">Medium Priority</div>
          <div className="stat-value">{stats.medium_priority_tasks}</div>
        </div>

        <div className="stat-card green">
          <div className="stat-label">Low Priority</div>
          <div className="stat-value">{stats.low_priority_tasks}</div>
        </div>

        <div className="stat-card green">
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">{stats.completion_rate}%</div>
        </div>
      </div>

      {stats.recent_tasks && stats.recent_tasks.length > 0 && (
        <div className="card">
          <h3 className="card-title">Recent Tasks</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>{new Date(task.due_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!stats.recent_tasks || stats.recent_tasks.length === 0) && (
        <div className="card">
          <h3 className="card-title">Welcome</h3>
          <p className="text-secondary">
            Hi {stats.employee_name}, your dashboard is ready. You'll see your tasks and progress here as soon as your admin assigns tasks to you.
          </p>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
