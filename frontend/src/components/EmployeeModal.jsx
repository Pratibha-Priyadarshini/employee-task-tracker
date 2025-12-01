import { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

function EmployeeModal({ employee, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    department: '',
    position: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        email: employee.email,
        department: employee.department,
        position: employee.position,
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (employee) {
        await employeeAPI.update(employee.id, formData);
      } else {
        await employeeAPI.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {employee ? 'Edit Employee' : 'Add Registered User as Employee'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}

            {!employee && (
              <div className="alert alert-info" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 'var(--radius)', color: '#1565c0' }}>
                <strong>Note:</strong> The user must be registered with your admin code first. Enter their registered email address below.
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder={employee ? '' : 'Enter registered user email'}
                required
                disabled={employee}
              />
              {employee && (
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Email cannot be changed</small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <input
                type="text"
                name="department"
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Position *</label>
              <input
                type="text"
                name="position"
                className="form-input"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : employee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeModal;
