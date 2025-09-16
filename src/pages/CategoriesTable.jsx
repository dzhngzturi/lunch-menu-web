// src/pages/CategoriesTable.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api";

import Modal from "../components/Modal";          // твоят confirm модал (червен при danger)
import CategoryForm from "../pages/CategoryForm"; // твоята форма

// нормализатор на отговора (оставяме го както беше)
function normalizeCatsResponse(resp) {
  const payload = resp && typeof resp === "object" && "data" in resp ? resp.data : resp;

  const meta =
    (payload && payload.meta) ||
    (resp && resp.meta) ||
    { current_page: 1, last_page: 1, total: Array.isArray(payload) ? payload.length : 0 };

  let items = [];
  if (Array.isArray(payload)) items = payload;
  else if (Array.isArray(payload?.items)) items = payload.items;
  else if (Array.isArray(payload?.data)) items = payload.data;
  else if (Array.isArray(payload?.results)) items = payload.results;

  return { items, meta };
}

export default function CategoriesTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // --- форма / модали ---
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);          // null = нова, иначе {id,name,image,...}
  const [form, setForm] = useState({ name: "", image: null, image_url: "" });

  // --- confirm за Delete ---
  const [toDelete, setToDelete] = useState(null);        // {id, name} или null
  const [deleting, setDeleting] = useState(false);

  const storageUrl = useMemo(
    () => `${import.meta.env.VITE_API_URL}/storage/`,
    []
  );
  const getImg = (c) => c.image_url || (c.image ? storageUrl + c.image : null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      // ако имаш бекенд филтри/страници – подай {page, search}
      const resp = await getCategories({ page, search });
      const { items, meta } = normalizeCatsResponse(resp);

      // възходящо по ID
      items.sort((a, b) => Number(a.id) - Number(b.id));

      setRows(items);
      setMeta(meta || { current_page: page, last_page: page, total: items.length });
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Грешка при зареждане.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page]);

  // ---------- CREATE ----------
  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", image: null, image_url: "" });
    setShowForm(true);
  };

  // ---------- EDIT ----------
  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name || "", image: null, image_url: getImg(cat) || "" });
    setShowForm(true);
  };

  // ---------- SAVE (create or update) ----------
  const handleSave = async () => {
    // валидираме
    if (!form.name.trim()) {
      alert("Въведи име на категория.");
      return;
    }

    // форматираме formData (multipart)
    const fd = new FormData();
    fd.append("name", form.name.trim());
    if (form.image instanceof File) {
      fd.append("image", form.image);
    }

    try {
      if (editing) {
        await updateCategory(editing.id, fd);
      } else {
        await createCategory(fd);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Грешка при запис.");
    }
  };

  // ---------- DELETE ----------
  const confirmDelete = (cat) => {
    setToDelete(cat);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(toDelete.id);
      setToDelete(null);
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Грешка при изтриване.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dishes-page">
      {/* Toolbar */}
      <div className="toolbar">
        <input
          placeholder="Търси по име"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button className="btn primary" onClick={load} disabled={loading}>Търси</button>
        <div className="spacer" />
        <button className="btn primary" onClick={openCreate}>+ Нова категория</button>
      </div>

      {err && <div className="alert error">{err}</div>}
      {loading && <div className="alert">Зареждане…</div>}

      {/* Таблица */}
      <div className="table-responsive">
        <table className="admin-table dishes">
          <thead>
            <tr>
              <th style={{ width: 20 }}>Снимка</th>
              <th>Име</th>
              <th style={{ width: 90, textAlign: "left" }}>Брой ястия</th>
              <th className="actions"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="thumb-cell" data-label="Снимка">
                  {getImg(c) ? (
                    <img
                      className="thumb"
                      src={getImg(c)}
                      alt={c.name}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <span className="noimg">без снимка</span>
                  )}
                </td>

                <td data-label="Име">{c.name}</td>

                <td data-label="Брой" className="count-cell center">
                  {Number(c.dishes_count ?? c.count ?? 0)}
                </td>

                <td className="actions" data-label="Действия">
                  <button className="btn secondary" onClick={() => openEdit(c)}>Редакция</button>
                  <button className="btn danger" onClick={() => confirmDelete(c)}>Изтрий</button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && !loading && (
              <tr><td colSpan={4} style={{ padding: 16 }}>Няма резултати</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="pager center">
        <button
          className="btn primary"
          disabled={meta.current_page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ‹ Предишна
        </button>
        <span className="muted">стр. {meta.current_page} от {meta.last_page}</span>
        <button
          className="btn primary"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => setPage((p) => p + 1)}
        >
          Следваща ›
        </button>
      </div>

      {/* --- Modal: Create / Edit (твоята форма) --- */}
      <CategoryForm
        open={showForm}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onCancel={() => setShowForm(false)}
        editing={!!editing}
        storageUrl={storageUrl}
      />

      {/* --- Modal: Delete confirm (червен) --- */}
      <Modal
        open={!!toDelete}
        title="Изтриване на категория"
        message={
          toDelete
            ? `Сигурни ли сте, че искате да изтриете „${toDelete.name}“?`
            : ""
        }
        confirmText={deleting ? "Изтриване..." : "Изтрий"}
        cancelText="Отказ"
        danger
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
