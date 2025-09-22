// src/pages/CategoriesTable.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "../api";

import Modal from "../components/Modal";
import CategoryForm from "../pages/CategoryForm";
import LoaderOverlay from "../components/LoaderOverlay";
import { buildStorageUrl } from "../api";
import { toastSuccess, toastError } from "../utils/toast";
import Sortable from "sortablejs";

/* -------- нормализиране на отговор -------- */
function normalizeCatsResponse(resp) {
  const payload =
    resp && typeof resp === "object" && "data" in resp ? resp.data : resp;

  const meta =
    (payload && payload.meta) ||
    (resp && resp.meta) || {
      current_page: 1,
      last_page: 1,
      total: Array.isArray(payload) ? payload.length : 0,
    };

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

  // debounced search
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // форма / модали
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", image: null, image_url: "" });

  // confirm delete
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // tbody реф за Sortable
  const tbodyRef = useRef(null);

  // ---- DEBOUNCE за търсене (400 ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQ(search.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // helper за снимка
  const getImg = (c) => c.image_url || (c.image ? buildStorageUrl(c.image) : null);

  // зареждане
  async function load() {
    setLoading(true);
    setErr("");
    try {
      // използваме q (debounced)
      const resp = await getCategories({ page, search: q });
      const { items, meta } = normalizeCatsResponse(resp);

      // запази sort_order
      items.sort((a, b) => (a.sort_order ?? 999999) - (b.sort_order ?? 999999));

      setRows(items);
      setMeta(meta || { current_page: page, last_page: page, total: items.length });
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Грешка при зареждане.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, q]); // слушаме page и q (не search)

  // SortableJS – drag/drop върху tbody
  useEffect(() => {
    if (!tbodyRef.current) return;

    const sortable = Sortable.create(tbodyRef.current, {
      handle: ".drag-handle",
      animation: 150,
      ghostClass: "drag-ghost",
      onEnd: async () => {
        // прочети id-тата по новия DOM ред
        const ids = Array.from(tbodyRef.current.querySelectorAll("tr"))
          .map((tr) => Number(tr.dataset.id));

        // локално подреждане (визуално)
        setRows((prev) => {
          const byId = new Map(prev.map((x) => [Number(x.id), x]));
          return ids.map((id) => byId.get(id)).filter(Boolean);
        });

        // бекенд
        try {
          await reorderCategories(ids);
          toastSuccess("Редът на категориите е обновен.");
        } catch (e) {
          toastError(
            e?.response?.data?.message || e?.message || "Грешка при запис на реда."
          );
        }
      },
    });

    return () => sortable.destroy();
  }, [rows.length]);

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

  // ---------- SAVE ----------
  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Въведи име на категория.");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name.trim());
    if (form.image instanceof File) fd.append("image", form.image);

    try {
      if (editing) {
        await updateCategory(editing.id, fd);
        toastSuccess("Категорията е обновена.");
      } else {
        await createCategory(fd);
        toastSuccess("Категорията е създадена.");
      }
      setShowForm(false);
      await load();
    } catch (e) {
      toastError(e?.response?.data?.message || e?.message || "Грешка при запис.");
    }
  };

  // ---------- DELETE ----------
  const confirmDelete = (cat) => setToDelete(cat);

  const doDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(toDelete.id);
      toastSuccess("Категорията е изтрита.");
      setToDelete(null);
      await load();
    } catch (e) {
      toastError(e?.response?.data?.message || e?.message || "Грешка при изтриване.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dishes-page">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-side">
          <input
            placeholder="Търси по име"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                setQ(search.trim()); // незабавно търсене
              }
            }}
          />
        </div>
        <button
          className="btn"
          onClick={() => {
            setPage(1);
            setQ(search.trim()); // незабавно търсене
          }}
          disabled={loading}
        >
          Търси
        </button>

        <div className="spacer" />
        <button className="btn-lg" onClick={openCreate} disabled={loading}>
          + Нова категория
        </button>
      </div>

      {err && <div className="alert error">{err}</div>}

      {/* CONTENT */}
      <div className="table-area" style={{ position: "relative", minHeight: 160 }}>
        {loading && (
          <LoaderOverlay text="Зареждам категориите…" color="#3b82f6" size={54} />
        )}

        {!loading && (
          <div className="table-responsive">
            <table className="items">
              <colgroup>
                <col className="col-drag" />
                <col className="col-thumb" />
                <col className="col-name" />
                <col className="col-count" />
                <col className="col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Снимка</th>
                  <th>Име</th>
                  <th>Брой ястия</th>
                  <th className="actions"></th>
                </tr>
              </thead>
              <tbody ref={tbodyRef}>
                {rows.map((c) => (
                  <tr key={c.id} data-id={c.id}>
                    <td className="drag-cell">
                      <span className="drag-handle">⋮⋮</span>
                    </td>
                    <td className="thumb-cell">
                      {getImg(c) ? (
                        <img
                          className="thumb"
                          src={getImg(c)}
                          alt={c.name}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="noimg">без снимка</span>
                      )}
                    </td>
                    <td className="cell-name">{c.name}</td>
                    <td className="cell-count">
                      {Number(c.dishes_count ?? c.count ?? 0)}
                    </td>
                    <td className="actions">
                      <button className="btn secondary sm" onClick={() => openEdit(c)}>
                        Редакция
                      </button>
                      <button className="btn danger" onClick={() => confirmDelete(c)}>
                        Изтрий
                      </button>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 16 }}>
                      Няма резултати
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Пагинация */}
      {!loading && (
        <div className="pager center">
          <button
            className="btn primary"
            disabled={meta.current_page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹ Предишна
          </button>
          <span className="muted">
            стр. {meta.current_page} от {meta.last_page}
          </span>
          <button
            className="btn primary"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Следваща ›
          </button>
        </div>
      )}

      {/* Modals */}
      <CategoryForm
        open={showForm}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onCancel={() => setShowForm(false)}
        editing={!!editing}
      />
      <Modal
        open={!!toDelete}
        title="Изтриване на категория"
        message={toDelete ? `Сигурни ли сте, че искате да изтриете „${toDelete.name}“?` : ""}
        confirmText={deleting ? "Изтриване..." : "Изтрий"}
        cancelText="Отказ"
        danger
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
