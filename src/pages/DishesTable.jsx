// src/pages/DishesTable.jsx
import { useEffect, useState } from "react";
import { getDishes } from "../api";
import { Link } from "react-router-dom";

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

export default function DishesTable() {
  const [rows, setRows]   = useState([]);
  const [meta, setMeta]   = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      // ако бекендът филтрира по station, остави "kitchen"; ако не – махни го
      const resp = await getDishes({ page, search, station: "kitchen" });
      const { items, meta } = normalizeDishesResponse(resp);
      setRows(items);
      setMeta(meta || { current_page: page, last_page: page, total: items.length });
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Грешка при зареждане.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page]);

  // ако имаш onEdit/onDelete в този компонент, добави ги тук
  const onEdit = (d) => {
    // отвори форма/модал или навигирай към /admin/dishes/new?id=...
    console.log("edit", d);
  };
  const onDelete = (id) => {
    console.log("delete", id);
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
        <Link to="/admin/dishes/new" className="btn primary">+ Ново ястие</Link>
      </div>

      {err && <div className="alert error">{err}</div>}
      {loading && <div className="alert">Зареждане…</div>}

      <div className="table-responsive">
        <table className="admin-table dishes">
          <thead>
            <tr>
              <th>Име</th>
              <th>Категория</th>
              <th>Тип меню</th>
              <th>Станция</th>
              <th className="right">Цена</th>
              <th className="actions"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(d => (
              <tr key={d.id}>
                <td data-label="Име">{d.name}</td>
                <td data-label="Категория">{d.category_name || d.category?.name || "-"}</td>
                <td data-label="Тип меню">{d.menu_type === "daily" ? "Дневно" : "Редовно"}</td>
                <td data-label="Станция">{d.station || "-"}</td>
                <td data-label="Цена" className="right price">
                  {Number(d.price ?? 0).toFixed(2)} лв
                </td>
                <td className="actions" data-label="Действия">
                  <button className="btn secondary sm" onClick={() => onEdit(d)}>Редакция</button>
                  <button className="btn danger sm" onClick={() => onDelete(d.id)}>Изтрий</button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && !loading && (
              <tr><td colSpan={6} style={{ padding: 16 }}>Няма резултати</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="pager center">
        <button className="btn primary"
                disabled={meta.current_page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Предишна</button>
        <span className="muted">стр. {meta.current_page} от {meta.last_page}</span>
        <button className="btn primary"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage(p => p + 1)}>Следваща ›</button>
      </div>
    </div>
  );
}
