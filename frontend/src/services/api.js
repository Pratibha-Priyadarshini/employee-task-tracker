const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls with authentication
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers,
      credentials: 'include',
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Employee API
export const employeeAPI = {
  getAll: () => fetchAPI('/employees'),
  getById: (id) => fetchAPI(`/employees/${id}`),
  create: (data) => fetchAPI('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/employees/${id}`, {
    method: 'DELETE',
  }),
};

// Task API
export const taskAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.employee_id) params.append('employee_id', filters.employee_id);
    if (filters.priority) params.append('priority', filters.priority);
    
    const queryString = params.toString();
    return fetchAPI(`/tasks${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => fetchAPI(`/tasks/${id}`),
  create: (data) => fetchAPI('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updateStatus: (id, status) => fetchAPI(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  delete: (id) => fetchAPI(`/tasks/${id}`, {
    method: 'DELETE',
  }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => fetchAPI('/dashboard'),
};
