import { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
import EmployeeModal from './EmployeeModal';
import EmployeeTasksModal from './EmployeeTasksModal';

function EmployeeList({ onUpdate }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee? All their tasks will also be deleted.')) {
      return;
    }

    try {
      await employeeAPI.delete(id);
      await fetchEmployees();
      onUpdate();
    } catch (err) {
      alert('Error deleting employee: ' + err.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleModalSuccess = async () => {
    await fetchEmployees();
    onUpdate();
    handleModalClose();
  };

  const handleViewTasks = (employee) => {
    setSelectedEmployee(employee);
    setShowTasksModal(true);
  };

  const handleTasksModalClose = () => {
    setShowTasksModal(false);
    setSelectedEmployee(null);
  };

  const filteredEmployees = employees.filter(employee => {
    const query = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.position.toLowerCase().includes(query) ||
      employee.department.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">Error loading employees: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Employees</h2>
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ Add Employee
          </button>
        </div>

        <div style={{ padding: '0 1.5rem 1rem' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, position, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">
              {employees.length === 0 ? 'No employees found' : 'No matching employees found'}
            </div>
            <p>
              {employees.length === 0 
                ? 'Click "Add Employee" to create your first employee'
                : 'Try adjusting your search query'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleViewTasks(employee)}
                    title="Click to view tasks"
                  >
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department}</td>
                    <td>{employee.position}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(employee.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {showTasksModal && selectedEmployee && (
        <EmployeeTasksModal
          employee={selectedEmployee}
          onClose={handleTasksModalClose}
        />
      )}
    </div>
  );
}

export default EmployeeList;
