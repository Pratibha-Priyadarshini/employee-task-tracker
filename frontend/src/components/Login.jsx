import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    adminCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(true);
  const [alertBanner, setAlertBanner] = useState(null); // { type: 'success'|'info'|'error', message }
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        if (!formData.email) {
          setError('Email is required for registration');
          setLoading(false);
          return;
        }
        
        if (formData.role === 'user' && !formData.adminCode) {
          setError('Admin code is required for user registration');
          setLoading(false);
          return;
        }
        
        const result = await register(formData.username, formData.email, formData.password, formData.role, formData.adminCode);
        
        // If admin registration, show a theme-aware banner with the generated admin code
        if (result.adminCode) {
          setAlertBanner({
            type: 'success',
            message: `Registration successful! Your Admin Code is: ${result.adminCode}. Please save this code; users will need it to register under you.`
          });
          setTimeout(() => setAlertBanner(null), 6000);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {alertBanner && (
          <div
            role="alert"
            style={{
              background: alertBanner.type === 'success' ? 'var(--green-soft, rgba(0,200,120,0.12))' : alertBanner.type === 'error' ? 'var(--red-soft, rgba(250,60,60,0.12))' : 'var(--primary-soft, rgba(80,120,255,0.12))',
              border: '1px solid',
              borderColor: alertBanner.type === 'success' ? 'var(--green, #0abf53)' : alertBanner.type === 'error' ? 'var(--red, #e44)' : 'var(--primary, #4a6cff)',
              color: 'var(--text-strong, #111)',
              padding: '10px 12px',
              borderRadius: '12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-sm, 0 2px 6px rgba(0,0,0,0.15))'
            }}
          >
            <span style={{ fontWeight: 600 }}>{alertBanner.type === 'success' ? 'Success' : alertBanner.type === 'error' ? 'Error' : 'Info'}:</span>
            <span>{alertBanner.message}</span>
          </div>
        )}
        <div className="login-header">
          <h1>Employee Task Tracker</h1>
          <p>{isLogin ? 'Login to your account' : 'Create a new account'}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Register as</label>
                <select
                  id="role"
                  name="role"
                  className="form-input"
                  value={formData.role}
                  onChange={(e) => {
                    handleChange(e);
                    setShowAdminCode(e.target.value === 'user');
                  }}
                  required
                >
                  <option value="user">User (Employee)</option>
                  <option value="admin">Admin (Manager)</option>
                </select>
              </div>

              {showAdminCode && (
                <div className="form-group">
                  <label htmlFor="adminCode">Admin Code</label>
                  <input
                    type="text"
                    id="adminCode"
                    name="adminCode"
                    className="form-input"
                    value={formData.adminCode}
                    onChange={handleChange}
                    placeholder="Enter your admin's code"
                    required
                  />
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    Get this code from your manager/admin
                  </small>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="btn-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', email: '', password: '', role: 'user', adminCode: '' });
              // If switching to Register (isLogin was true), show Admin Code by default for User role
              setShowAdminCode(isLogin ? true : false);
            }}
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>

        {isLogin && (
          <div className="demo-credentials">
            <p><strong>Info:</strong></p>
            <p>To register, you can register as an Admin (Manager) or as a User (Employee).</p>
            <p>Users need an admin code from their manager to register.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
