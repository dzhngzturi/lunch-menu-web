import axios from 'axios';

const FALLBACK = 'http://127.0.0.1:8000/api';
const ENV_BASE = import.meta.env.VITE_API_BASE_URL;
const baseURL = ENV_BASE && ENV_BASE.trim() ? ENV_BASE.trim() : FALLBACK;

console.log('[API] VITE_API_BASE_URL =', ENV_BASE);
console.log('[API] using baseURL     =', baseURL);

export const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json' }
});
// ── Bearer за всяка заявка
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Авто-logout при 401/419
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

/* ===================== AUTH ===================== */

// Login → очакваме 201 + { access_token, token_type:'Bearer', user }
export async function login(email, password) {
  const { data, status } = await api.post('/login', { email, password });
  if (status !== 201) throw new Error('Unexpected login status');
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  window.dispatchEvent(new Event('auth-changed'));
  return data.user;
}

export async function me() {
  const { data } = await api.get('/me');
  return data.data; // { id, name, email, is_admin }
}

export async function logout() {
  try { await api.post('/logout'); } catch {}
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-changed'));
}

export async function logoutAll() {
  try { await api.post('/logout-all'); } catch {}
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-changed'));
}

/* ================== PUBLIC ================== */

export const getCategories = () => api.get('/categories');
export const getDishes = (params = {}) => api.get('/dishes', { params });
export const getMenu = () => api.get('/menu');

/* ================== ADMIN ================== */

export const createCategory = (payload) => api.post('/categories', payload);
// (PATCH е по-типично за частичен update; PUT също ще работи)
export const updateCategory = (id, payload) => api.patch(`/categories/${id}`, payload);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const createDish = (formData) =>
  api.post('/dishes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateDish = (id, formData) =>
  api.post(`/dishes/${id}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteDish = (id) => api.delete(`/dishes/${id}`);

/* ================== ORDERS ================== */

// Списък с филтри и пагинация
// params: { station?, status?, page?, per_page?, updated_after? }
export const listOrders = (params = {}) => {
  const { signal, ...query } = params;        // всичко без signal → към params
  return api.get('/orders', { params: query, signal });
};

// Смяна на статус на ПОРЪЧКА
export const updateOrderStatus = (orderId, status) =>
  api.patch(`/orders/${orderId}/status`, { status });

// Смяна на статус на РЕД (item)
export const updateOrderItemStatus = (itemId, status) =>
  api.patch(`/orders/items/${itemId}/status`, { status });

// Изтегля всички страници според подадените филтри
export async function listOrdersAll(params = {}) {
  const per_page = 100; // голяма страница за по-малко заявки
  let page = 1;
  let all = [];
  for (;;) {
    const { data } = await listOrders({ ...params, page, per_page });
    const chunk = data?.data || [];
    all = all.concat(chunk);
    const meta = data?.meta;
    if (!meta || page >= meta.last_page) break;
    page++;
  }
  return all;
}

// ➕ Добавяне на ред към поръчка
export const createOrderItem = (orderId, payload) =>
  api.post(`/orders/${orderId}/items`, payload); // { dish_id, qty, note? }

// ✏️ Редакция на ред
export const updateOrderItem = (orderId, itemId, payload) =>
  api.patch(`/orders/${orderId}/items/${itemId}`, payload); // { qty?, note? }

// 🗑 Премахване на ред
export const deleteOrderItem = (orderId, itemId) =>
  api.delete(`/orders/${orderId}/items/${itemId}`);
