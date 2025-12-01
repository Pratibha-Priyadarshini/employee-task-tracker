import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

function Dashboard() {
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

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Dashboard Overview</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{stats.total_tasks}</div>
        </div>

        <div className="stat-card green">
          <div className="stat-label">Completed Tasks</div>
          <div className="stat-value">{stats.completed_tasks}</div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats.in_progress_tasks}</div>
        </div>

        <div className="stat-card red">
          <div className="stat-label">Pending Tasks</div>
          <div className="stat-value">{stats.pending_tasks}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{stats.total_employees}</div>
        </div>

        <div className="stat-card green">
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">{stats.completion_rate}%</div>
        </div>

        <div className="stat-card red">
          <div className="stat-label">High Priority</div>
          <div className="stat-value">{stats.high_priority_tasks}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Tasks by Employee</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Total Tasks</th>
                <th>Completed</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.tasks_by_employee.map((emp, index) => (
                <tr key={index}>
                  <td>{emp.name}</td>
                  <td>{emp.task_count}</td>
                  <td>{emp.completed}</td>
                  <td>
                    {emp.task_count > 0
                      ? `${((emp.completed / emp.task_count) * 100).toFixed(1)}%`
                      : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
