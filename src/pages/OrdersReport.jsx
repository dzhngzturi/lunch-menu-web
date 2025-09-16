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
  return new Date(s);
}

export default function OrdersReport() {
  const [dateFrom, setDateFrom]     = useState(""); 
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
      const baseFilters = {
        ...(station.value ? { station: station.value } : {}),
        ...(status.value   ? { status: status.value }   : {}),
      };
      const all = await listOrdersAll(baseFilters);

      const from = dateFrom ? parseDate(dateFrom + "T00:00:00") : null;
      const to   = dateTo   ? parseDate(dateTo   + "T23:59:59") : null;

      const filtered = all.filter(o => {
        if (tableNo && String(o.table_no || "").trim() !== String(tableNo).trim()) return false;
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


    function fmtDateBG(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

  const summary = useMemo(() => {
    const sum = {
      totalOrders: 0,
      totalItems: 0,
      revenue: 0,
      byStatus: {},
      topDishes: {}, 
    };

    for (const o of orders) {
      sum.totalOrders += 1;
      if (typeof o.total_cents === "number") {
        sum.revenue += o.total_cents / 100;
      } else if (Array.isArray(o.items)) {
        for (const it of o.items) {
          const price = (it.price_cents ?? 0) / 100;
          sum.revenue += price * (it.qty ?? 1);
        }
      }
      const st = o.status || "unknown";
      sum.byStatus[st] = (sum.byStatus[st] || 0) + 1;

      if (Array.isArray(o.items)) {
        sum.totalItems += o.items.length;
        for (const it of o.items) {
          const key = it.name || `#${it.dish_id}`;
          sum.topDishes[key] = (sum.topDishes[key] || 0) + (it.qty ?? 1);
        }
      }
    }

    const topDishesArr = Object.entries(sum.topDishes)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return { ...sum, topDishesArr };
  }, [orders]);

  const exportCSV = () => {
  if (!orders.length) return;

  const header = ["ID","Дата","Маса","Клиент","Сервитьор","Статус","Редове","Общо"];

  const rows = orders.map(o => {
    const total =
      typeof o.total_cents === "number"
        ? o.total_cents / 100
        : (o.items || []).reduce((s, it) => s + ((it.price_cents || 0) / 100) * (it.qty || 1), 0);
    
    const staffName = o.staff_name ?? o.staff?.name ?? "";
    return [
      o.id ?? "",
      fmtDateBG(o.created_at || o.updated_at || ""),
      o.table_no ?? "",
      o.customer_name ?? "",
      staffName,  
      STATUS_BG[o.status] || o.status || "",
      (o.items || []).length,
      Number(total.toFixed(2))
    ];
  });

  const delimiter = ";";
  const totalColIndex = header.indexOf("Общо");
  const cell = (v, colIdx) => {
    if (colIdx === totalColIndex && typeof v === "number") {
      return String(v).replace(".", ","); 
    }
    return `"${String(v).replace(/"/g, '""')}"`;
  };

  const body = [header, ...rows]
    .map(r => r.map(cell).join(delimiter))
    .join("\n");

  const csv = "\uFEFF" + body;

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

      {!!orders.length && (
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Дата</th>
                <th>Маса</th>
                <th>Клиент</th>
                <th>Сервитьор</th>
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
                    const staffName = o.staff_name ?? o.staff?.name ?? "";

                return (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{fmtDateBG(o.created_at || o.updated_at || "")}</td>
                    <td>{o.table_no || "—"}</td>
                    <td>{o.customer_name || "—"}</td>
                    <td>{staffName || "—"}</td>
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
