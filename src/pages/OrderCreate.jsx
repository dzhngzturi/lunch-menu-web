// src/pages/CreateOrder.jsx
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { getDishes } from "../api";          // вече го имаш: getDishes(params)
import { api } from "../api";                // за POST /orders
import { useNavigate } from "react-router-dom";

const stationOptions = [
  { value: "kitchen", label: "Кухня" },
  { value: "bar",     label: "Бар" },
];

const selectStyles = {
  control: (base, s) => ({
    ...base,
    minHeight: 44,
    borderColor: s.isFocused ? "#2563eb" : "#d1d5db",
    boxShadow: "none",
    ":hover": { borderColor: "#9ca3af" }
  }),
  valueContainer: (b) => ({ ...b, padding: "4px 10px" }),
   indicatorsContainer: (b) => ({ ...b, height: 44 }),
   dropdownIndicator: (b) => ({ ...b, padding: "0 8px" }),
   clearIndicator: (b) => ({ ...b, padding: "0 6px" }),
  menu: (b) => ({ ...b, zIndex: 25 }),
};

export default function CreateOrder() {
  const nav = useNavigate();

  // header полета
  const [tableNo, setTableNo] = useState("");
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");

  // избор на станция → филтрира ястията
  const [station, setStation] = useState("kitchen");

  // ястия (заредени по станция)
  const [dishes, setDishes] = useState([]);
  const dishOptions = useMemo(
    () => dishes.map(d => ({ value: d.id, label: `${d.name} — ${Number(d.price).toFixed(2)} лв.` })),
    [dishes]
  );

  // текущ ред за добавяне
  const [pickedDish, setPickedDish] = useState(null);
  const [qty, setQty] = useState(1);
  const [itemNote, setItemNote] = useState("");

  // кошница
  const [items, setItems] = useState([]);
  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // зареди ястия при смяна на станция
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getDishes({ station });
        if (!cancelled) setDishes(data?.data || data || []);
      } catch (e) {
        if (!cancelled) setDishes([]);
      }
      // reset на избора при смяна
      setPickedDish(null);
      setQty(1);
      setItemNote("");
    })();
    return () => { cancelled = true; };
  }, [station]);

  const addItem = () => {
    setErr("");
    if (!pickedDish) return setErr("Избери ястие.");
    if (!qty || qty < 1) return setErr("Количество трябва да е поне 1.");

    const dish = dishes.find(d => d.id === pickedDish.value);
    if (!dish) return;

    setItems(prev => [
      ...prev,
      {
        dish_id: dish.id,
        name: dish.name,
        price: Number(dish.price || 0),
        qty: Number(qty),
        note: itemNote?.trim() || "",
        station: dish.station, // за инфо
      }
    ]);

    // изчистване на реда
    setPickedDish(null);
    setQty(1);
    setItemNote("");
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const submitOrder = async () => {
    setErr("");
    if (!items.length) return setErr("Добави поне 1 ред.");
    setSaving(true);
    try {
      const payload = {
        table_no: tableNo || null,
        customer_name: customer || null,
        notes: notes || null,
        items: items.map(it => ({
          dish_id: it.dish_id,
          qty: it.qty,
          note: it.note || null
        }))
      };
      const { data } = await api.post("/orders", payload);
      // готово → към таблото за съответната станция
      nav(`/admin/orders/${station}`, { replace: true, state: { createdOrder: data?.data?.id } });
    } catch (e) {
      const msg = e?.response?.data?.message || "Неуспешно създаване на поръчка.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card create-order">
      <div className="card-header">
        <h1>Нова поръчка</h1>
      </div>

      <div className="co-row">
        {/* 1) Станция */}
        <div className="co-col">
          <label className="co-label">Станция</label>
          <div className="seg">
            {stationOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`seg-btn ${station === opt.value ? "active" : ""}`}
                onClick={() => setStation(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2) Маса и Клиент */}
        <div className="co-col">
          <label className="co-label">Маса</label>
          <input className="co-input" value={tableNo} onChange={e => setTableNo(e.target.value)} placeholder="напр. 12" />
        </div>
        <div className="co-col">
          <label className="co-label">Клиент</label>
          <input className="co-input" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="име или телефон (по избор)" />
        </div>
      </div>

      {/* 3) Избор на ястие по станция */}
      <div className="co-row">
        <div className="co-col grow">
          <label className="co-label">Ястие ({station === "kitchen" ? "Кухня" : "Бар"})</label>
          <Select
            styles={selectStyles}
            options={dishOptions}
            value={pickedDish}
            onChange={setPickedDish}
            placeholder="Избери ястие…"
            classNamePrefix="rs"
          />
        </div>
        <div className="co-col" style={{ maxWidth: 120 }}>
          <label className="co-label">Кол.</label>
          <input
            type="number"
            min="1"
            className="co-input"
            value={qty}
            onChange={e => setQty(Math.max(1, Number(e.target.value || 1)))}
          />
        </div>
        <div className="co-col grow">
          <label className="co-label">Бележка към реда</label>
          <input
            className="co-input"
            value={itemNote}
            onChange={e => setItemNote(e.target.value)}
            placeholder="без лук, без майо…"
          />
        </div>
        <div className="co-col" style={{ alignSelf: "end" }}>
          <button className="btn btn-primary" onClick={addItem}>Добави</button>
        </div>
      </div>

      {/* 4) Кошница / избрани редове */}
      <div className="co-basket">
        {items.length === 0 ? (
          <div className="empty">Няма добавени редове.</div>
        ) : (
           <table className="co-table">
            <colgroup>
              <col style={{ width: "52%" }} />         {/* Ястие */}
              <col style={{ width: "10%" }} />         {/* Кол. */}
              <col style={{ width: "18%" }} />         {/* Бележка */}
              <col style={{ width: "18%" }} />         {/* Цена */}
              <col style={{ width: "40px" }} />        {/* Х бутон (фиксирана) */}
            </colgroup>
            <thead>
              <tr>
                <th>Ястие</th>
                <th>Кол.</th>           {/* премахнах a-right */}
                <th>Бележка</th>
                <th>Цена</th>          {/* премахнах a-right */}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>{it.name}</td>
                  <td>{it.qty}</td>                 {/* без a-right */}
                  <td className="muted">{it.note || "—"}</td>
                  <td>{(it.price * it.qty).toFixed(2)} лв.</td>  {/* без a-right */}
                  <td className="a-right">
                    <button className="btn btn-small" onClick={() => removeItem(i)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="a-right strong">Общо:</td>
                <td className="strong">{total.toFixed(2)} лв.</td> {/* само strong */}
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* 5) Бележка за поръчката */}
      <div className="co-row">
        <div className="co-col grow">
          <label className="co-label">Бележка към поръчката</label>
          <textarea
            className="co-textarea"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="обща бележка към поръчката (по избор)"
          />
        </div>
      </div>

      {err && <div className="alert error" style={{ marginTop: 8 }}>{err}</div>}

      {/* 6) Действие */}
      <div className="co-actions">
        <button className="btn" onClick={() => nav(-1)}>Отказ</button>
        <button
          className="btn btn-primary btn-lg"
          disabled={saving || items.length === 0}
          onClick={submitOrder}
        >
          {saving ? "Запис…" : "Създай поръчка"}
        </button>
      </div>
    </div>
  );
}
