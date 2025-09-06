// src/staffApi.js
import { api } from "./api";


const RAW = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000').toString().trim();
const BASE = (RAW || 'http://127.0.0.1:8000').replace(/\/+$/, ''); // гарантира абсолютен base
const API  = `${BASE}/api`;

function authHeaders() {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  };
}

function q(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.trim() !== '') usp.set(k, v);
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export async function listStaff(q = "", page = 1) {
  const { data } = await api.get("/staff", { params: { q, page } });

  // Laravel paginator: { data: [...], meta: {...} }
  if (data && (Array.isArray(data.data) || data.meta)) {
    return {
      items: Array.isArray(data.data) ? data.data : (data.items || []),
      meta: data.meta || { current_page: 1, last_page: 1, total: (data.items || []).length },
    };
  }

  // plain масив
  if (Array.isArray(data)) {
    return { items: data, meta: { current_page: 1, last_page: 1, total: data.length } };
  }

  // fallback
  const items = data?.items || data?.users || [];
  return { items, meta: data?.meta || { current_page: 1, last_page: 1, total: items.length } };
}

export async function createStaff(payload) {
  const res = await fetch(`${API}/staff`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create staff');
  return res.json();
}

export async function updateStaff(id, payload) {
  const res = await fetch(`${API}/staff/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update staff');
  return res.json();
}

export async function deactivateStaff(id) {
  const res = await fetch(`${API}/staff/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to deactivate staff');
  return res.json();
}
