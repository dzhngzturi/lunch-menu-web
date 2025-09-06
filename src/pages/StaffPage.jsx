// src/pages/StaffPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listStaff, createStaff, updateStaff, deactivateStaff } from "../staffApi";
import "./staff.css";


export default function StaffPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta]   = useState({ current_page: 1, last_page: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  
  
async function load() {
  setLoading(true);
  setErr("");
  try {
    const { items: rows, meta } = await listStaff(search, page);

    let normalized = (rows || []).map((u) => ({
      ...u,
      is_active:
        u.is_active === true ||
        u.is_active === 1 ||
        u.is_active === "1" ||
        u.is_active === "true",
    }));

    if (search.trim() !== "") {
      const lower = search.trim().toLowerCase();
      normalized = normalized.filter(
        (u) =>
          (u.name && u.name.toLowerCase() === lower) ||
          (u.email && u.email.toLowerCase() === lower)
      );
    }

    setItems(normalized);
    setMeta(meta || { current_page: page, last_page: page, total: normalized.length });
  } catch (e) {
    setErr(e?.message || "Грешка при зареждане.");
  } finally {
    setLoading(false);
  }
}



  useEffect(() => { load(); }, [page]);
  const title = useMemo(() => (editing ? "Редакция" : "Нов потребител"), [editing]);

  return (
<div className="staff-page">
  <div className="toolbar">
    <input
      placeholder="Търсене по име или email"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && load()}
    />
    <button className="btn primary sm" onClick={load} disabled={loading}>Търси</button>
    
    <div className="spacer" />
    <button className="btn primary sm" onClick={() => { setEditing(null); setModalOpen(true); }}>+ Нов</button>
  </div>

  {err && <div className="alert error">{err}</div>}
  {loading && <div className="alert">Зареждане…</div>}

  <table className="admin-table">
    <thead>
      <tr>
        <th>Име</th>
        <th>Email</th>
        <th>Роля</th>
        <th>Статус</th>
        <th className="actions"></th>
      </tr>
    </thead>
    <tbody>
      {items.map((u) => (
        <tr key={u.id}>
          <td data-label="Име">{u.name}</td>
          <td data-label="Email">{u.email}</td>
          <td data-label="Роля">{u.role}</td>
          <td data-label="Статус">{u.is_active ? "Активен" : "Деактивиран"}</td>
         <td className="actions" data-label="">
            <button
              className="btn secondary sm"
              onClick={() => { setEditing(u); setModalOpen(true); }}
            >
              Редакция
            </button>
            <button
              className="btn danger sm"
              onClick={() => setConfirm({ id: u.id, name: u.name })}
            >
              Деактивирай
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
    <div className="pager pager-center">
      <button className="btn primary sm"
              disabled={meta.current_page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Предишна</button>
      <span className="muted">стр. {meta.current_page} от {meta.last_page}</span>
      <button className="btn primary sm"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage(p => p + 1)}>Следваща ›</button>
    </div>


  {modalOpen && (
    <StaffModal
      title={title}
      initial={editing ?? { name: "", email: "", role: "staff", is_active: true, password: "" }}
      onClose={() => setModalOpen(false)}
      onSave={async (values) => {
        if (editing) {
          await updateStaff(editing.id, values);
        } else {
          await createStaff(values);
        }
        setModalOpen(false);
        setEditing(null);
        setPage(1);
        load();
      }}
    />
  )}

  {confirm && (
    <ConfirmModal
      user={confirm}
      onClose={() => setConfirm(null)}
      onConfirm={async () => {
        try {
          await deactivateStaff(confirm.id);
          setConfirm(null);
          load();
        } catch (e) {
          alert(e?.response?.data?.message || e?.message || "Грешка при деактивиране.");
        }
      }}
    />
  )}
</div>

  );
}

function StaffModal({ title, initial, onClose, onSave }) {
  const [form, setForm] = useState({ ...initial });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal">
      <div className="modal-card">
        <div className="modal-head">
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {err && <div className="alert error">{err}</div>}
          <label>Име <input value={form.name} onChange={(e)=>change("name", e.target.value)} /></label>
          <label>Email <input type="email" value={form.email} onChange={(e)=>change("email", e.target.value)} /></label>
          <label>Роля
            <select value={form.role} onChange={(e)=>change("role", e.target.value)}>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </label>
          <label>Статус
            <select value={form.is_active ? "1" : "0"} onChange={(e)=>change("is_active", e.target.value === "1")}>
              <option value="1">Активен</option>
              <option value="0">Деактивиран</option>
            </select>
          </label>
          <label>Парола (по избор)
            <input type="password" value={form.password || ""} onChange={(e)=>change("password", e.target.value)} placeholder="Остави празно за авто-генерирана"/>
          </label>
        </div>
        <div className="modal-foot">
          <button className="btn secondary sm" onClick={onClose}>Отказ</button>
          <button className="btn primary sm" disabled={saving} onClick={async () => {
            try { setSaving(true); await onSave(form); }
            catch (e) { setErr(e?.response?.data?.message || e?.message || "Неуспешно записване."); }
            finally { setSaving(false); }
          }}>Запази</button>
        </div>
      </div>
      <div className="backdrop" onClick={onClose} />
    </div>
  );
}

function ConfirmModal({ user, onClose, onConfirm }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="backdrop" onClick={onClose} />

      <div className="modal-card">
        <div className="modal-head">
          <div className="icon">!</div>
          <h3 id="confirm-title">Потвърждение</h3>
          <button className="x" aria-label="Затвори" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p>
            Сигурни ли сте, че искате да деактивирате <b>{user.name}</b>?
          </p>
        </div>

        <div className="modal-foot">
          <button className="btn secondary sm" onClick={onClose}>Отказ</button>
          <button className="btn danger sm" onClick={onConfirm}>Деактивирай</button>
        </div>
      </div>
    </div>
  );
}


