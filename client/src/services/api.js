import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  // Fallback to current host but port 5000 for local network mobile testing
  const hostname = window.location.hostname;
  return `http://${hostname}:5000/api`;
};

const API_URL = getBaseUrl();


const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crimelens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const analysisService = {
  analyze: (formData) => api.post('/analysis/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  monitor: (formData) => api.post('/analysis/monitor', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/analysis', { params }),

  getById: (id) => api.get(`/analysis/${id}`),
  getStats: () => api.get('/analysis/stats'),
  getPatterns: () => api.get('/analysis/patterns'),
};

export const caseService = {
  getAll: (params) => api.get('/cases', { params }),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data) => {
    const isFormData = data && typeof data.append === 'function';
    if (isFormData) {
      return api.post('/cases', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/cases', data);
  },
  update: (id, data) => {
    const isFormData = data && typeof data.append === 'function';
    if (isFormData) {
      return api.put(`/cases/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put(`/cases/${id}`, data);
  },
  delete: (id) => api.delete(`/cases/${id}`),
  addEvidence: (id, analysisId) => api.post(`/cases/${id}/evidence`, { analysisId }),
  addNote: (id, content) => api.post(`/cases/${id}/notes`, { content }),
};

export default api;
