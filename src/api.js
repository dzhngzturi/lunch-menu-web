// src/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, ''),
  // ако ти трябва сесия/cookies:
  // withCredentials: true,
});

// ------- Категории -------
export const getCategories   = () => api.get('/api/categories');
export const createCategory  = (payload) => api.post('/api/categories', payload);
export const updateCategory  = (id, payload) => api.put(`/api/categories/${id}`, payload);
export const deleteCategory  = (id) => api.delete(`/api/categories/${id}`);

// ------- Ястия -------
export const getDishes = (params = {}) =>
  api.get('/api/dishes', { params });

export const getDish = (id) =>
  api.get(`/api/dishes/${id}`);

export const createDish = (formData) =>
  api.post('/api/dishes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateDish = (id, formData) =>
  api.post(`/api/dishes/${id}?_method=PUT`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteDish = (id) =>
  api.delete(`/api/dishes/${id}`);

// По избор: помощни обвивки
export const getLunchDishes   = () => getDishes({ menu_type: 'lunch' });
export const getRegularDishes = () => getDishes({ menu_type: 'regular' });
