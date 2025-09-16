// src/api.js
import axios from "axios";

/* ===== BASE URL ===== */
const FALLBACK = 'http://127.0.0.1:8000/api';
const ENV_BASE = import.meta.env.VITE_API_BASE_URL;
export const baseURL = (ENV_BASE && ENV_BASE.trim()) ? ENV_BASE.trim() : FALLBACK;

console.log("[API] VITE_API_BASE_URL =", ENV_BASE);
console.log("[API] using baseURL     =", baseURL);


// <-- ДОБАВЕНО: origin без /api
export const API_ORIGIN = baseURL.replace(/\/api\/?$/, '');

// по желание: helper за снимки
export const buildStorageUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;         // вече е абсолютен
  return `${API_ORIGIN}/storage/${path}`;              // относителен от БД
};


/* ===== AXIOS INSTANCE ===== */
export const api = axios.create({
  baseURL,
  headers: { Accept: "application/json" },
});

// Bearer token на всяка заявка
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Авто-logout при 401/419
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 419) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));
      if (!location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

/* ===================== AUTH ===================== */

// Login → очакваме { access_token, user }
export async function login(email, password) {
  const res = await api.post("/login", { email, password });
  const data = res.data || {};
  if (!data.access_token || !data.user) {
    throw new Error("Unexpected login response");
  }

  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
  window.dispatchEvent(new Event("auth-changed"));
  return data.user;
}

export async function me() {
  const { data } = await api.get("/me");
  return data.data; // { id, name, email, is_admin ... }
}

export async function logout() {
  try {
    await api.post("/logout");
  } catch {}
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-changed"));
}

export async function logoutAll() {
  try {
    await api.post("/logout-all");
  } catch {}
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-changed"));
}

/* ================== PUBLIC ================== */

export const getCategories = (params = {}) => api.get("/categories", { params });
export const getDishes = (params = {}) => api.get("/dishes", { params });
export const getDish = (id) => api.get(`/dishes/${id}`);
export const getMenu = () => api.get("/menu");

/* ================== ADMIN ================== */
/* ВАЖНО: НЕ слагай ръчно 'Content-Type: multipart/form-data'.
   Браузърът сам добавя правилния boundary, иначе често идват 500/CORS грешки.
*/

// CREATE category (FormData: name, image?)
export const createCategory = (formData) => api.post("/categories", formData);

// UPDATE category (може FormData или обект)
export const updateCategory = (id, formData) => {
  // ако е plain object → превръщаме в FormData
  if (!(formData instanceof FormData)) {
    const fd = new FormData();
    Object.entries(formData || {}).forEach(([k, v]) => fd.append(k, v));
    formData = fd;
  }
  formData.append("_method", "PUT"); // Laravel friendly
  return api.post(`/categories/${id}`, formData);
};

export const deleteCategory = (id) => api.delete(`/categories/${id}`);

/* Dishes (същата логика за файлове) */
export const createDish = (formData) => api.post("/dishes", formData);

export const updateDish = (id, formData) => {
  if (!(formData instanceof FormData)) {
    const fd = new FormData();
    Object.entries(formData || {}).forEach(([k, v]) => fd.append(k, v));
    formData = fd;
  }
  formData.append("_method", "PUT");
  return api.post(`/dishes/${id}`, formData);
};

export const deleteDish = (id) => api.delete(`/dishes/${id}`);

export const listMealImages = (params = {}) =>
  api.get('/images/meals', { params });


/* ================== ORDERS ================== */

export const listOrders = (params = {}) => {
  const { signal, ...query } = params;
  return api.get("/orders", { params: query, signal });
};

export const updateOrderStatus = (orderId, status) =>
  api.patch(`/orders/${orderId}/status`, { status });

export const updateOrderItemStatus = (itemId, status) =>
  api.patch(`/orders/items/${itemId}/status`, { status });

export async function listOrdersAll(params = {}) {
  const per_page = 100;
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

export const createOrderItem = (orderId, payload) =>
  api.post(`/orders/${orderId}/items`, payload);

export const updateOrderItem = (orderId, itemId, payload) =>
  api.patch(`/orders/${orderId}/items/${itemId}`, payload);

export const deleteOrderItem = (orderId, itemId) =>
  api.delete(`/orders/${orderId}/items/${itemId}`);
