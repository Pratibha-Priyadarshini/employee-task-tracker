import { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';

function EmployeeTasksModal({ employee, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employee) {
      fetchEmployeeTasks();
    }
  }, [employee]);

  const fetchEmployeeTasks = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getAll({ employee_id: employee.id });
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Tasks for {employee.name}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              {employee.position} - {employee.department}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Loading tasks...
            </div>
          )}

          {error && (
            <div className="form-error">{error}</div>
          )}

          {!loading && !error && tasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📋</div>
              <p>No tasks assigned to this employee</p>
            </div>
          )}

          {!loading && !error && tasks.length > 0 && (
            <div>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Tasks</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{tasks.length}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completed</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {tasks.filter(t => t.status === 'completed').length}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>In Progress</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {tasks.filter(t => t.status === 'in-progress').length}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {tasks.filter(t => t.status === 'pending').length}
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.id}</td>
                        <td>
                          <strong>{task.title}</strong>
                          {task.description && (
                            <div style={{ fontSize: '0.85em', color: '#666', marginTop: '0.25rem' }}>
                              {task.description.substring(0, 60)}
                              {task.description.length > 60 ? '...' : ''}
                            </div>
                          )}
                        </td>
                        <td>
                          <span 
                            className="badge"
                            style={{ 
                              backgroundColor: `${getStatusColor(task.status)}20`,
                              color: getStatusColor(task.status),
                              border: `1px solid ${getStatusColor(task.status)}40`
                            }}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="badge"
                            style={{ 
                              backgroundColor: `${getPriorityColor(task.priority)}20`,
                              color: getPriorityColor(task.priority),
                              border: `1px solid ${getPriorityColor(task.priority)}40`
                            }}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td>{formatDate(task.due_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeTasksModal;
