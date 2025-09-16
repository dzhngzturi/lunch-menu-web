import { useEffect, useMemo, useState } from "react";
import { getDishes, updateDish, createDish, deleteDish } from "../api";
import { Link } from "react-router-dom";
import DishForm from "./DishForm";
// ако имаш helper:
import { buildStorageUrl } from "../api";

// нормализиране на отговор от API
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
};

export default function DishesTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [menuType, setMenuType] = useState("all"); // 'all' | 'lunch' | 'regular'
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // модал
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // параметри за API (едно място)
  const params = useMemo(() => {
    const p = { page };
    if (search.trim()) p.search = search.trim();
    if (menuType !== "all") p.menu_type = menuType;
    return p;
  }, [page, search, menuType]);

  // едно зареждане според params
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
  }, [params, page]);

  // helper за снимка
  const getImg = (d) => d.image_url || (d.image ? buildStorageUrl(d.image) : null);

  // модал – отваряне за редакция
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
    fd.append("image_existing", form.image_existing); // ← важно
  } else if (form.image instanceof File) {
    fd.append("image", form.image);
  }

  if (editing) await updateDish(editing.id, fd);
  else await createDish(fd);

  setShowModal(false);
  setEditing(null);
  setForm(EMPTY_FORM);
  setPage(p => p); // рефреш
};



  const onCancel = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const onDelete = async (id) => {
    if (!confirm("Да изтрия ли това ястие?")) return;
    await deleteDish(id);
    setPage((p) => p); // тригър за презареждане
  };

  return (
    <div className="dishes-page">

      {/* Toolbar (само бутонът за ново ястие) */}
      <div className="toolbar">
        <div className="spacer" />
        <Link to="/admin/dishes/new" className="btn primary">+ Ново ястие</Link>
      </div>

      {/* Филтър бар */}
      {/* Филтрите като "таблетки" */}
      <div className="filter-bar">
        <div
          className="pill-tabs"
          role="tablist"
          aria-label="Филтър по тип меню"
        >
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

        <div className="search-side">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            placeholder="Търси по име"
            onKeyDown={(e) => e.key === "Enter" && setPage(1)}
          />
          <button className="btn" onClick={() => setPage(1)}>Търси</button>
        </div>
      </div>



      {err && <div className="alert error">{err}</div>}
      {loading && <div className="alert">Зареждане…</div>}

      <div className="table-responsive">
        <table className="admin-table dishes">
          <thead>
            <tr>
              <th style={{ width: 72 }}>Снимка</th>
              <th>Име</th>
              <th>Категория</th>
              <th>Тип меню</th>
              <th>Станция</th>
              <th className="right">Цена</th>
              <th className="actions"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td className="thumb-cell" data-label="Снимка">
                  {getImg(d) ? (
                    <img
                      className="thumb"
                      src={getImg(d)}
                      alt={d.name}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <span className="noimg">без снимка</span>
                  )}
                </td>

                <td data-label="Име">{d.name}</td>
                <td data-label="Категория">{d.category_name || d.category?.name || "-"}</td>
                <td data-label="Тип меню">
                  {d.menu_type === "lunch"
                    ? "Обедно"
                    : d.menu_type === "both"
                      ? "И двете"
                      : "Редовно"}
                </td>
                <td data-label="Станция">
                  {d.station === "bar"
                    ? "Бар"
                    : d.station === "kitchen"
                      ? "Кухня"
                      : "-"}
                </td>
                <td data-label="Цена" className="right price">
                  {Number(d.price ?? 0).toFixed(2)} лв
                </td>
                <td className="actions" data-label="Действия">
                  <button className="btn secondary sm" onClick={() => onEdit(d)}>Редакция</button>
                  <button className="btn danger" onClick={() => onDelete(d.id)}>Изтрий</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={7} style={{ padding: 16 }}>Няма резултати</td></tr>
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

      {/* Модал */}
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
