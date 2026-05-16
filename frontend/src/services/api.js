import axios from 'axios';

/**
 * Axios instance pre-configured for Finora API.
 * Automatically attaches JWT token to every request.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// ── Request interceptor: attach token ─────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finora_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('finora_token');
      localStorage.removeItem('finora_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  signup:  (data) => api.post('/auth/signup', data),
  login:   (data) => api.post('/auth/login',  data),
  getMe:   ()     => api.get('/auth/me'),
};

// ── Expenses ──────────────────────────────────────────────
export const expensesAPI = {
  getAll:   (params) => api.get('/expenses', { params }),
  getStats: ()       => api.get('/expenses/stats'),
  create:   (data)   => api.post('/expenses', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:   (id, data) => api.put(`/expenses/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:   (id)     => api.delete(`/expenses/${id}`),
};

// ── Analytics ─────────────────────────────────────────────
export const analyticsAPI = {
  getMonthlyTrend:     ()       => api.get('/analytics/monthly'),
  getCategoryBreakdown:(params) => api.get('/analytics/categories', { params }),
  getDailyBreakdown:   (params) => api.get('/analytics/daily', { params }),
  getInsights:         ()       => api.get('/analytics/insights'),
};

// ── Savings Goals ─────────────────────────────────────────
export const goalsAPI = {
  getAll:  ()         => api.get('/goals'),
  create:  (data)     => api.post('/goals', data),
  update:  (id, data) => api.put(`/goals/${id}`, data),
  delete:  (id)       => api.delete(`/goals/${id}`),
};

// ── User ─────────────────────────────────────────────────
export const userAPI = {
  getProfile:        ()     => api.get('/user/profile'),
  updateProfile:     (data) => api.put('/user/profile', data),
  updateSettings:    (data) => api.put('/user/settings', data),
  changePassword:    (data) => api.put('/user/password', data),
  completeOnboarding:()     => api.put('/user/onboarding'),
};

export default api;
