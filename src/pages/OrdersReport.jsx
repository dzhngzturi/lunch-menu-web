// src/pages/OrdersReport.jsx
import { useMemo, useState } from "react";
import Select from "react-select";
import { listOrdersAll } from "../api";

const STATIONS = [
  { value: "", label: "Всички станции" },
  { value: "kitchen", label: "Кухня" },
  { value: "bar",     label: "Бар" },
];

const STATUSES = [
  { value: "", label: "Всички статуси" },
  { value: "new",         label: "Нова" },
  { value: "in_progress", label: "В процес" },
  { value: "ready",       label: "Готово" },
  { value: "done",        label: "Приключена" },
  { value: "cancel",      label: "Отказана" },
];

const selectStyles = {
  control: (base, s) => ({
    ...base,
    minHeight: 44,
    borderColor: s.isFocused ? "#2563eb" : "#d1d5db",
    boxShadow: "none",
    ":hover": { borderColor: "#9ca3af" },
  }),
  valueContainer: (b) => ({ ...b, padding: "4px 10px" }),
  menu: (b) => ({ ...b, zIndex: 25 }),
};

// преводи на статусите
const STATUS_BG = {
  new: "Нова",
  in_progress: "В процес",
  ready: "Готово",
  done: "Приключена",
  cancel: "Отказана",
};


function fmtMoney(v) {
  return (Number(v) || 0).toFixed(2) + " лв.";
}
function parseDate(s) {
  // s може да е "2025-03-20" или пълно ISO от бекенда
  return new Date(s);
}

export default function OrdersReport() {
  const [dateFrom, setDateFrom]     = useState(""); // "YYYY-MM-DD"
  const [dateTo, setDateTo]         = useState("");
  const [station, setStation]       = useState(STATIONS[0]);
  const [status, setStatus]         = useState(STATUSES[0]);
  const [tableNo, setTableNo]       = useState("");

  const [loading, setLoading]       = useState(false);
  const [orders, setOrders]         = useState([]);
  const [error, setError]           = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    setOrders([]);
    try {
      // 1) Взимаме всички поръчки по филтрите, които бекендът разпознава
      const baseFilters = {
        ...(station.value ? { station: station.value } : {}),
        ...(status.value   ? { status: status.value }   : {}),
      };
      const all = await listOrdersAll(baseFilters);

      // 2) Допълнителни филтри от клиента (дата, маса)
      const from = dateFrom ? parseDate(dateFrom + "T00:00:00") : null;
      const to   = dateTo   ? parseDate(dateTo   + "T23:59:59") : null;

      const filtered = all.filter(o => {
        // по маса
        if (tableNo && String(o.table_no || "").trim() !== String(tableNo).trim()) return false;
        // по дата (created_at)
        if (from || to) {
          const created = parseDate(o.created_at || o.updated_at || o.date || 0);
          if (from && created < from) return false;
          if (to   && created > to)   return false;
        }
        return true;
      });

      setOrders(filtered);
    } catch (e) {
      console.error(e);
      setError("Неуспешно зареждане на данни.");
    } finally {
      setLoading(false);
    }
  };


    // формат дати "ДД.ММ.ГГГГ ЧЧ:ММ"
    function fmtDateBG(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

  // Агрегации
  const summary = useMemo(() => {
    const sum = {
      totalOrders: 0,
      totalItems: 0,
      revenue: 0,
      byStatus: {},
      topDishes: {}, // име -> общо количество
    };

    for (const o of orders) {
      sum.totalOrders += 1;
      // оборот
      if (typeof o.total_cents === "number") {
        sum.revenue += o.total_cents / 100;
      } else if (Array.isArray(o.items)) {
        // fallback ако total_cents го няма
        for (const it of o.items) {
          const price = (it.price_cents ?? 0) / 100;
          sum.revenue += price * (it.qty ?? 1);
        }
      }
      // статуси
      const st = o.status || "unknown";
      sum.byStatus[st] = (sum.byStatus[st] || 0) + 1;

      // брой ястия + топ ястия
      if (Array.isArray(o.items)) {
        sum.totalItems += o.items.length;
        for (const it of o.items) {
          const key = it.name || `#${it.dish_id}`;
          sum.topDishes[key] = (sum.topDishes[key] || 0) + (it.qty ?? 1);
        }
      }
    }

    // подреден топ 10 ястия
    const topDishesArr = Object.entries(sum.topDishes)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return { ...sum, topDishesArr };
  }, [orders]);

  const exportCSV = () => {
    const rows = [
      ["ID", "Дата", "Маса", "Клиент", "Статус", "Редове", "Общо(лв.)"],
      ...orders.map(o => {
        const total =
          typeof o.total_cents === "number"
            ? (o.total_cents / 100).toFixed(2)
            : ( (o.items || []).reduce((s, it) => s + ((it.price_cents||0)/100) * (it.qty||1), 0).toFixed(2) );
        const date = o.created_at || o.updated_at || "";
        return [
          o.id,
          date,
          o.table_no ?? "",
          o.customer_name ?? "",
          o.status ?? "",
          (o.items || []).length,
          total
        ];
      })
    ];
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = "orders-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card report-card">
      <div className="card-header">
        <h1>Отчет по поръчки</h1>
      </div>

      {/* Филтри */}
      <div className="report-filters">
        <div className="rf-row">
          <div className="rf-col">
            <label className="rf-label">От дата</label>
            <input type="date" className="rf-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="rf-col">
            <label className="rf-label">До дата</label>
            <input type="date" className="rf-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="rf-col">
            <label className="rf-label">Станция</label>
            <Select
              styles={selectStyles}
              options={STATIONS}
              value={station}
              onChange={setStation}
            />
          </div>
          <div className="rf-col">
            <label className="rf-label">Статус</label>
            <Select
              styles={selectStyles}
              options={STATUSES}
              value={status}
              onChange={setStatus}
            />
          </div>
          <div className="rf-col">
            <label className="rf-label">Маса</label>
            <input className="rf-input" placeholder="напр. 12" value={tableNo} onChange={e => setTableNo(e.target.value)} />
          </div>
          <div className="rf-col rf-actions">
            <button className="btn btn-primary" onClick={generate} disabled={loading}>
              {loading ? "Зареждане…" : "Генерирай"}
            </button>
            <button className="btn" onClick={exportCSV} disabled={!orders.length}>Експорт CSV</button>
          </div>
        </div>
      </div>

      {/* Обобщение */}
      {!!orders.length && (
        <div className="report-stats">
          <div className="stat-card">
            <div className="stat-label">Поръчки</div>
            <div className="stat-value">{summary.totalOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Редове</div>
            <div className="stat-value">{summary.totalItems}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Оборот</div>
            <div className="stat-value">{fmtMoney(summary.revenue)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">По статус</div>
            <div className="stat-note">
                {Object.entries(summary.byStatus).map(([k,v]) => (
                <span key={k} className="chip">{STATUS_BG[k] || k}: {v}</span>
                ))}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Топ ястия</div>
            <div className="stat-note">
              {summary.topDishesArr.map(d => <span key={d.name} className="chip">{d.name}: {d.qty}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* Таблица */}
      {!!orders.length && (
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Дата</th>
                <th>Маса</th>
                <th>Клиент</th>
                <th>Статус</th>
                <th>Редове</th>
                <th className="a-right">Общо</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const total =
                  typeof o.total_cents === "number"
                    ? (o.total_cents / 100)
                    : ((o.items || []).reduce((s, it) => s + ((it.price_cents||0)/100) * (it.qty||1), 0));
                return (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{fmtDateBG(o.created_at || o.updated_at || "")}</td>
                    <td>{o.table_no || "—"}</td>
                    <td>{o.customer_name || "—"}</td>
                    <td>{STATUS_BG[o.status] || o.status}</td>
                    <td>{(o.items || []).length}</td>
                    <td className="a-right">{fmtMoney(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(!orders.length && !loading && !error) ? (
        <div className="empty" style={{ marginTop: 16 }}>Няма данни за показване.</div>
      ) : null}
      {error ? <div className="alert error" style={{ marginTop: 12 }}>{error}</div> : null}
    </div>
  );
}
