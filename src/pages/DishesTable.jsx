// src/pages/DishesTable.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { getDishes, updateDish, createDish, deleteDish, reorderDishes } from "../api";
import { Link } from "react-router-dom";
import DishForm from "./DishForm";
import { buildStorageUrl } from "../api";
import LoaderOverlay from "../components/LoaderOverlay";
import Modal from "../components/Modal";
import { toastSuccess, toastError } from "../utils/toast";
import Sortable from "sortablejs";

/* ---- нормализиране на отговор от API ---- */
function normalizeDishesResponse(resp) {
  const payload = resp && typeof resp === "object" && "data" in resp ? resp.data : resp;

  const meta =
    (payload && payload.meta) ||
    (resp && resp.meta) ||
    { current_page: 1, last_page: 1, total: 0 };

  let items = [];
  if (Array.isArray(payload)) items = payload;
  else if (Array.isArray(payload?.items)) items = payload.items;
  else if (Array.isArray(payload?.data)) items = payload.data;
  else if (Array.isArray(payload?.results)) items = payload.results;

  return { items, meta };
}

const EMPTY_FORM = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  image: null,
  menu_type: "regular",
  station: "kitchen",
  image_url: "",
};

export default function DishesTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);

  // debounced search
  const [search, setSearch] = useState("");  // input value
  const [q, setQ] = useState("");            // debounced value (към API)

  const [menuType, setMenuType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // tbody реф за Sortable
  const tbodyRef = useRef(null);

  // ---- DEBOUNCE за търсене
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQ(search.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Параметри към API -> използваме q (НЕ search)
  const params = useMemo(() => {
    const p = { page };
    if (q) p.search = q;
    if (menuType !== "all") p.menu_type = menuType;
    return p;
  }, [page, q, menuType]);

  // Зареждане
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const resp = await getDishes(params);
        const { items, meta } = normalizeDishesResponse(resp);
        if (!ignore) {
          setRows(items);
          setMeta(meta || { current_page: page, last_page: page, total: items.length });
        }
      } catch (e) {
        if (!ignore) {
          setErr(e?.response?.data?.message || e?.message || "Грешка при зареждане.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [params, page, refresh]);

  // SortableJS – инициализация върху <tbody>
  useEffect(() => {
    if (!tbodyRef.current) return;

    const sortable = Sortable.create(tbodyRef.current, {
      handle: ".drag-handle",
      animation: 150,
      ghostClass: "drag-ghost",
      onEnd: async () => {
        // нов ред според DOM
        const ids = Array.from(tbodyRef.current.querySelectorAll("tr"))
          .map(tr => Number(tr.dataset.id));

        // локално пренареждане (визуално)
        setRows(prev => {
          const byId = new Map(prev.map(x => [Number(x.id), x]));
          return ids.map(id => byId.get(id)).filter(Boolean);
        });

        // бекенд
        try {
          await reorderDishes(ids);
          toastSuccess("Редът на ястията е обновен.");
        } catch (e) {
          toastError(e?.response?.data?.message || e?.message || "Грешка при запис на реда.");
        }
      },
    });

    return () => sortable.destroy();
  }, [rows.length]);

  // helper за снимка (cache-buster)
  const getImg = (d) => {
    const raw = d.image_url || (d.image ? buildStorageUrl(d.image) : null);
    if (!raw) return null;
    const v = d.updated_at ? new Date(d.updated_at).getTime() : Date.now();
    return `${raw}${raw.includes("?") ? "&" : "?"}v=${v}`;
  };

  // модал – отваряне за редакция
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const onEdit = (d) => {
    setEditing(d);
    setForm({
      category_id: d.category_id ?? "",
      name: d.name ?? "",
      description: d.description ?? "",
      price: d.price ?? "",
      image: null,
      menu_type: d.menu_type ?? "regular",
      station: d.station ?? "kitchen",
      image_url: getImg(d) || d.image_url || (d.image ? buildStorageUrl(d.image) : ""),
    });
    setShowModal(true);
  };

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = async () => {
    const fd = new FormData();
    fd.append("category_id", form.category_id);
    fd.append("name", form.name);
    fd.append("description", form.description || "");
    fd.append("price", form.price);
    fd.append("menu_type", form.menu_type);
    fd.append("station", form.station);

    if (form.image_existing) {
      fd.append("image_existing", form.image_existing);
    } else if (form.image instanceof File) {
      fd.append("image", form.image);
    }

    try {
      if (editing) {
        await updateDish(editing.id, fd);
        toastSuccess("Запазено успешно.");
      } else {
        await createDish(fd);
        toastSuccess("Добавено успешно.");
      }
      setShowModal(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setRefresh((x) => x + 1);
    } catch (e) {
      toastError(e?.response?.data?.message || e?.message || "Грешка при запис.");
    }
  };

  const onCancel = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  // delete flow
  const confirmDelete = (dish) => setToDelete(dish);
  const doDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteDish(toDelete.id);
      toastSuccess("Изтрито успешно.");
      setToDelete(null);
      setRefresh((x) => x + 1);
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
          onClick={() => { setPage(1); setQ(search.trim()); }} // незабавно търсене
        >
          Търси
        </button>

        <div className="spacer" />
        <Link to="/admin/dishes/new" className="btn primary">+ Ново ястие</Link>
      </div>

      {/* Филтри */}
      <div className="filter-bar">
        <div className="pill-tabs" role="tablist" aria-label="Филтър по тип меню">
          <button
            role="tab"
            aria-selected={menuType === "all"}
            className={`pill ${menuType === "all" ? "active" : ""}`}
            onClick={() => { setPage(1); setMenuType("all"); }}
          >
            Всички
          </button>
          <button
            role="tab"
            aria-selected={menuType === "lunch"}
            className={`pill ${menuType === "lunch" ? "active" : ""}`}
            onClick={() => { setPage(1); setMenuType("lunch"); }}
          >
            Обедно
          </button>
          <button
            role="tab"
            aria-selected={menuType === "regular"}
            className={`pill ${menuType === "regular" ? "active" : ""}`}
            onClick={() => { setPage(1); setMenuType("regular"); }}
          >
            Редовно
          </button>
        </div>
      </div>

      {err && <div className="alert error">{err}</div>}

      {/* CONTENT */}
      <div className="table-area" style={{ position: "relative", minHeight: 200 }}>
        {loading && <LoaderOverlay text="Зареждам ястията…" color="#3b82f6" size={54} />}

        {!loading && (
          <>
            <div className="table-responsive">
              <table className="admin-table dishes">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th style={{ width: 72 }}>Снимка</th>
                    <th>Име</th>
                    <th>Категория</th>
                    <th>Тип меню</th>
                    <th>Станция</th>
                    <th className="right">Цена</th>
                    <th className="actions"></th>
                  </tr>
                </thead>
                <tbody ref={tbodyRef}>
                  {rows.map((d) => (
                    <tr key={d.id} data-id={d.id}>
                      <td className="drag-cell"><span className="drag-handle">⋮⋮</span></td>

                      <td className="thumb-cell" data-label="Снимка">
                        {getImg(d) ? (
                          <img
                            className="thumb"
                            src={getImg(d)}
                            alt={d.name}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : <span className="noimg">без снимка</span>}
                      </td>

                      <td data-label="Име">{d.name}</td>
                      <td data-label="Категория">{d.category_name || d.category?.name || "-"}</td>
                      <td data-label="Тип меню">
                        {d.menu_type === "lunch" ? "Обедно"
                          : d.menu_type === "both" ? "И двете"
                          : "Редовно"}
                      </td>
                      <td data-label="Станция">
                        {d.station === "bar" ? "Бар"
                          : d.station === "kitchen" ? "Кухня"
                          : "-"}
                      </td>
                      <td data-label="Цена" className="right price">
                        {Number(d.price ?? 0).toFixed(2)} лв
                      </td>
                      <td className="actions" data-label="Действия">
                        <button className="btn secondary sm" onClick={() => onEdit(d)}>Редакция</button>
                        <button className="btn danger" onClick={() => confirmDelete(d)}>Изтрий</button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: 16 }}>Няма резултати</td></tr>
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
          </>
        )}
      </div>

      {/* Модали */}
      <Modal
        open={!!toDelete}
        title="Изтриване на ястие"
        message={toDelete ? `Сигурни ли сте, че искате да изтриете „${toDelete.name}“?` : ""}
        confirmText={deleting ? "Изтриване…" : "Изтрий"}
        cancelText="Отказ"
        danger
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
      />

      {showModal && (
        <div className="modal-backdrop" onClick={onCancel}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <DishForm
              form={form}
              onChange={onChange}
              onSave={onSave}
              onCancel={onCancel}
              editing={Boolean(editing)}
              saving={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
