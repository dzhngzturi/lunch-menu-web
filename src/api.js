import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout при 401/419
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 419) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-changed'));
      if (!location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (email, password) => api.post('/login', { email, password });
export const logout = () => api.post('/logout');

// Категории
export const getCategories = () => api.get('/categories');
export const createCategory = (payload) => api.post('/categories', payload);
export const updateCategory = (id, payload) => api.put(`/categories/${id}`, payload);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Ястия
export const getDishes = (params = {}) => api.get('/dishes', { params });
export const createDish = (formData) => api.post('/dishes', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateDish = (id, formData) => api.post(`/dishes/${id}?_method=PUT`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteDish = (id) => api.delete(`/dishes/${id}`);
