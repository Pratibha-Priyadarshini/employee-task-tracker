import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserDashboard from './components/UserDashboard';
import EmployeeList from './components/EmployeeList';
import TaskList from './components/TaskList';

function App() {
  const { user, loading, logout, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [copyBanner, setCopyBanner] = useState(null); // { type, message }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          {copyBanner && (
            <div
              role="status"
              style={{
                background: copyBanner.type === 'success' ? 'var(--green-soft, rgba(0,200,120,0.12))' : copyBanner.type === 'error' ? 'var(--red-soft, rgba(250,60,60,0.12))' : 'var(--primary-soft, rgba(80,120,255,0.12))',
                border: '1px solid',
                borderColor: copyBanner.type === 'success' ? 'var(--green, #0abf53)' : copyBanner.type === 'error' ? 'var(--red, #e44)' : 'var(--primary, #4a6cff)',
                color: 'var(--text-strong, #111)',
                padding: '8px 10px',
                borderRadius: '10px',
                marginBottom: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-sm, 0 2px 6px rgba(0,0,0,0.15))'
              }}
            >
              <span style={{ fontWeight: 600 }}>{copyBanner.type === 'success' ? 'Success' : copyBanner.type === 'error' ? 'Error' : 'Notice'}:</span>
              <span>{copyBanner.message}</span>
            </div>
          )}
          <h1>📊 Employee Task Tracker</h1>
          <nav className="nav">
            <button
              className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-btn ${currentView === 'tasks' ? 'active' : ''}`}
              onClick={() => setCurrentView('tasks')}
            >
              {isAdmin ? 'Tasks' : 'My Tasks'}
            </button>
            {isAdmin && (
              <button
                className={`nav-btn ${currentView === 'employees' ? 'active' : ''}`}
                onClick={() => setCurrentView('employees')}
              >
                Employees
              </button>
            )}
          </nav>
          <div className="user-info">
            <span className="user-badge">
              {user.username} ({user.role})
              {isAdmin && user.admin_code && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', opacity: 0.9, display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  | Code: <strong>{user.admin_code}</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    title="Copy admin code"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(user.admin_code);
                        setCopyBanner({ type: 'info', message: 'Admin code copied to clipboard' });
                        setTimeout(() => setCopyBanner(null), 3000);
                      } catch (e) {
                        console.error('Copy failed', e);
                      }
                    }}
                  >
                    Copy
                  </button>
                </span>
              )}
            </span>
            <button className="btn btn-sm btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {currentView === 'dashboard' && isAdmin && <Dashboard key={refreshTrigger} />}
        {currentView === 'dashboard' && !isAdmin && <UserDashboard key={refreshTrigger} />}
        {currentView === 'tasks' && <TaskList key={refreshTrigger} onUpdate={handleRefresh} />}
        {currentView === 'employees' && isAdmin && <EmployeeList key={refreshTrigger} onUpdate={handleRefresh} />}
      </main>
    </div>
  );
}

export default App;
