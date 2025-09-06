// src/pages/OrdersBoard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import {
  listOrders,
  updateOrderItemStatus,
  updateOrderStatus,
  createOrderItem,
} from "../api";
import AddOrderItemModal from "../components/AddOrderItemModal";
import Modal from "../components/Modal";
import {
  printKitchenTicket,
  loadPrintedSet,
  savePrintedSet,
  resetPrintedForOrder,
} from "../utils/print-utils";
import { echo } from "../lib/echo";


const PER_PAGE = 20;

const STATUS_LABEL_BG = {
  new: "Нова",
  in_progress: "В процес",
  ready: "Готово",
  done: "Приключена",
  cancel: "Отказана",
};

// новите най-отгоре: created_at (ако има) или по id
const sortItemsDesc = (items = []) =>
  [...items].sort((a, b) => {
    if (a?.created_at && b?.created_at) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return (b?.id ?? 0) - (a?.id ?? 0);
  });


/* ---------- бутони за статус на ЯСТИЕ ---------- */
function ItemStatusButtons({ value, onPick, disabled = false }) {
  return (
    <div className="item-status-buttons">
      <button
        type="button"
        className={`status-option in_progress ${value === "in_progress" ? "active" : ""}`}
        aria-pressed={value === "in_progress"}
        onClick={() => onPick("in_progress")}
        title="В процес"
        disabled={disabled}
      >
        <i className="fa-solid fa-hourglass-half" />
        <span className="label">В процес</span>
        <i className="fa-solid fa-check tick" aria-hidden="true" />
      </button>

      <button
        type="button"
        className={`status-option ready ${value === "ready" ? "active" : ""}`}
        aria-pressed={value === "ready"}
        onClick={() => onPick("ready")}
        title="Готово"
        disabled={disabled}
      >
        <i className="fa-solid fa-circle-check" />
        <span className="label">Готово</span>
        <i className="fa-solid fa-check tick" aria-hidden="true" />
      </button>
    </div>
  );
}

/* ---------- бутони за статус на ПОРЪЧКА ---------- */
function OrderStatusPicker({ value, onChange, disabled = false }) {
  const options = ["new", "done", "cancel"];
  return (
    <div className="order-status-options">
      {options.map((s) => (
        <button
          key={s}
          type="button"
          className={`status-option ${s} ${value === s ? "active" : ""}`}
          aria-pressed={value === s}
          onClick={() => onChange(s)}
          title={STATUS_LABEL_BG[s]}
          disabled={disabled}
        >
          <i
            className={
              s === "new"
                ? "fa-solid fa-star"
                : s === "done"
                ? "fa-solid fa-check"
                : "fa-solid fa-circle-xmark"
            }
          />
          <span className="label">{STATUS_LABEL_BG[s]}</span>
          <i className="fa-solid fa-check tick" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export default function OrdersBoard({ station }) {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const [addItemForOrder, setAddItemForOrder] = useState(null);
  const [msg, setMsg] = useState(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTable, setSelectedTable] = useState("");

  const hydratedRef   = useRef(false);
  const fullCtrlRef   = useRef(null);
  const deltaCtrlRef  = useRef(null);
  const deltaTimerRef = useRef(null);
  const lastSyncRef   = useRef(null);

  // 🔔 звук (файл: /public/bell-notification.mp3)
  const soundRef = useRef(null);
  const soundArmedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio('/bell-notification.mp3');
    audio.preload = 'auto';
    audio.volume = 1.0;
    soundRef.current = audio;

    // auto-unlock при първото взаимодействие/фокус
    const unlock = async () => {
      if (!soundRef.current || soundArmedRef.current) return;
      try {
        soundRef.current.muted = true;
        await soundRef.current.play();
        soundRef.current.pause();
        soundRef.current.currentTime = 0;
        soundRef.current.muted = false;
        soundArmedRef.current = true;
        removeListeners();
      } catch {}
    };
    const events = ['pointerdown', 'keydown', 'touchstart'];
    const addListeners = () => events.forEach(ev => window.addEventListener(ev, unlock, { passive: true }));
    const removeListeners = () => events.forEach(ev => window.removeEventListener(ev, unlock));
    addListeners();
    const onVisible = () => { if (document.visibilityState === 'visible') unlock(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      removeListeners();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // списък маси за филтър
  const tables = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => o.table_no && set.add(String(o.table_no)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "bg"));
  }, [orders]);

  const statusOptions = useMemo(
    () => [
      { value: "",       label: "Всички" },
      { value: "new",    label: "Нова" },
      { value: "done",   label: "Приключена" },
      { value: "cancel", label: "Отказана" },
    ],
    []
  );

  const tableOptions = useMemo(
    () => [{ value: "", label: "Всички маси" }, ...tables.map((t) => ({ value: t, label: `Маса ${t}` }))],
    [tables]
  );

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 42,
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: "none",
      ":hover": { borderColor: "#9ca3af" },
    }),
    valueContainer: (base) => ({ ...base, padding: "4px 10px" }),
    menu: (base) => ({ ...base, zIndex: 25 }),
  };

  // --------- зареждане ---------
  const fetchOrders = async ({ onlyDelta = false } = {}) => {
    const params = {
      station,
      page,
      per_page: PER_PAGE,
      ...(statusFilter  ? { status: statusFilter }    : {}),
      ...(selectedTable ? { table_no: selectedTable } : {}),
      ...(onlyDelta && lastSyncRef.current ? { updated_after: lastSyncRef.current } : {}),
    };

    // ---- DELTA ----
    if (onlyDelta) {
      if (fullCtrlRef.current) return;
      if (deltaCtrlRef.current) return;

      const ctrl = new AbortController();
      deltaCtrlRef.current = ctrl;

      try {
        const baseParams = {
          station,
          page: 1,
          per_page: PER_PAGE,
          ...(statusFilter  ? { status: statusFilter }    : {}),
          ...(selectedTable ? { table_no: selectedTable } : {}),
        };

        const { data } = await listOrders({ ...baseParams, signal: ctrl.signal });
        const chunk = Array.isArray(data?.data) ? data.data : [];

        setOrders(prev => {
          const byId = new Map(prev.map(o => [o.id, o]));
          let isNew = false;
          for (const o of chunk) {
            if (!byId.has(o.id)) isNew = true; // има нова поръчка
            byId.set(o.id, o);
          }
          if (isNew && soundArmedRef.current && soundRef.current) {
            try { soundRef.current.currentTime = 0; soundRef.current.play(); } catch {}
          }
           const normalized = Array.from(byId.values())
           .map(o => ({ ...o, items: sortItemsDesc(o.items) }))
           .sort((a, b) => b.id - a.id);
           return normalized.slice(0, PER_PAGE);
        });

        lastSyncRef.current = new Date().toISOString();
      } catch (e) {
        if (e.code !== 'ERR_CANCELED' && e.name !== 'CanceledError') console.error(e);
      } finally {
        deltaCtrlRef.current = null;
      }
      return;
    }

    // ---- FULL ----
    if (fullCtrlRef.current) fullCtrlRef.current.abort();
    const ctrl = new AbortController();
    fullCtrlRef.current = ctrl;
    setLoading(true);

    try {
      const { data } = await listOrders({ ...params, signal: ctrl.signal });
      const chunk = Array.isArray(data?.data) ? data.data : [];
      const normalized = chunk
      .map(o => ({ ...o, items: sortItemsDesc(o.items) }))
      .sort((a, b) => b.id - a.id);
      setOrders(normalized);
      if (data?.meta) setMeta(data.meta);
      hydratedRef.current = true;
      lastSyncRef.current = new Date().toISOString();
    } catch (e) {
      if (e.code !== 'ERR_CANCELED' && e.name !== 'CanceledError') console.error(e);
    } finally {
      if (fullCtrlRef.current === ctrl) fullCtrlRef.current = null;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders({ onlyDelta: false });
    return () => { if (fullCtrlRef.current) fullCtrlRef.current.abort(); };
  }, [station, statusFilter, selectedTable, page]);

  useEffect(() => {
    const ch = echo.channel('orders');
    const onUpdated = () => {
      if (!hydratedRef.current) return;
      if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
      deltaTimerRef.current = setTimeout(() => {
        fetchOrders({ onlyDelta: true });
      }, 600);
    };
    ch.listen('.order.updated', onUpdated);
    return () => {
      ch.stopListening('.order.updated', onUpdated);
      if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
    };
  }, [station]);

  // -------- помощни --------
  const showMsg = (title, message) => setMsg({ title, message });
  const closeMsg = () => setMsg(null);

  const getItemsToPrint = (order) => {
    const printed = loadPrintedSet(station);
    return (order.items || []).filter(
      (i) => i.station === station && i.status === "new" && !printed.has(i.id)
    );
  };

  const handlePrint = (order) => {
    const items = getItemsToPrint(order);
    if (items.length === 0) {
      showMsg("Печат", "Няма нови редове за печат.");
      return;
    }
    printKitchenTicket(order, station, items);
    savePrintedSet(station, items.map((i) => i.id));
    showMsg("Печат", `Изпратени към принтер: ${items.length} ред(а).`);
  };

  const allowResetReprint = (order) => order.status === "new";

  const setItemStatus = async (item, value) => {
    const prev = item.status;
    setOrders((cur) =>
      cur.map((o) =>
        o.id !== item.order_id
          ? o
          : { ...o, items: o.items.map((it) => (it.id === item.id ? { ...it, status: value } : it)) }
      )
    );
    try {
      await updateOrderItemStatus(item.id, value);
      fetchOrders({ onlyDelta: true });
    } catch {
      setOrders((cur) =>
        cur.map((o) =>
          o.id !== item.order_id
            ? o
            : { ...o, items: o.items.map((it) => (it.id === item.id ? { ...it, status: prev } : it)) }
        )
      );
      showMsg("Грешка", "Неуспешна промяна на статус на ястие.");
    }
  };

  const changeOrderStatus = async (orderId, value) => {
    const prev = orders.find((o) => o.id === orderId)?.status;
    setOrders((cur) => cur.map((o) => (o.id === orderId ? { ...o, status: value } : o)));
    try {
      await updateOrderStatus(orderId, value);
      fetchOrders({ onlyDelta: true });
    } catch {
      setOrders((cur) => cur.map((o) => (o.id === orderId ? { ...o, status: prev } : o)));
      showMsg("Грешка", "Неуспешна промяна на статус на поръчка.");
    }
  };

  return (
    <div className="card">
      {/* Toolbar / Филтри */}
      <div className="toolbar">
        <div className="filters">
          <label className="label-inline strong" htmlFor="status-filter">Статус:</label>
          <Select
            inputId="status-filter"
            styles={selectStyles}
            options={statusOptions}
            value={statusOptions.find((o) => o.value === statusFilter)}
            onChange={(opt) => { setPage(1); setStatusFilter(opt?.value || ""); }}
            isClearable={false}
          />
        </div>

        <div className="filters">
          <label className="label-inline strong" htmlFor="table-filter">Маса:</label>
          <Select
            inputId="table-filter"
            styles={selectStyles}
            options={tableOptions}
            value={tableOptions.find((o) => o.value === selectedTable)}
            onChange={(opt) => { setPage(1); setSelectedTable(opt?.value || ""); }}
            isClearable={false}
          />
        </div>

        <div className="spacer" />
        <button className="btn" onClick={() => fetchOrders()} disabled={loading}>
          ↻ Опресни
        </button>
      </div>

      {loading && !orders.length ? <div className="page-loading">Зареждане…</div> : null}

      {!orders.length && !loading ? (
        <div className="empty">Няма поръчки.</div>
      ) : (
        <ul className="orders-list">
          {orders.map((order) => {
            const isLocked = order.status === "done" || order.status === "cancel";
            const itemsForStation = sortItemsDesc(
            station
            ? (order.items || []).filter((i) => i.station === station)
            : (order.items || [])
          );

            return (
              <li key={order.id} className={`order is-${order.status}`}>
                <div className="order-head">
                  <div className="order-title">
                    <i className="fa-solid fa-receipt" />
                    <span className="order-id">Поръчка #{order.id}</span>
                    {order.table_no && <span className="order-sub"> · Маса <b>{order.table_no}</b></span>}
                    {order.customer_name && <span className="order-sub"> · Клиент <b>{order.customer_name}</b></span>}
                  </div>

                  <div className="order-meta">
                    <>
                      <button
                        className="btn btn-small"
                        onClick={() => setAddItemForOrder(order)}
                        title="Добави ред към тази поръчка"
                        disabled={isLocked}
                      >
                        <i className="fa-solid fa-plus" /> <span className="hide-sm">Добави ред</span>
                      </button>

                      <button
                        className="btn btn-small"
                        onClick={() => handlePrint(order)}
                        title="Печат на кухненски бон"
                        disabled={isLocked || getItemsToPrint(order).length === 0}
                      >
                        <i className="fa-solid fa-print" /> <span className="hide-sm">Печат</span>
                      </button>

                      {allowResetReprint(order) && (
                        <button
                          className="btn btn-small btn-ghost"
                          onClick={() => { resetPrintedForOrder(station, order); showMsg("Печат", "Разрешен е повторен печат за тази поръчка."); }}
                          title="Разреши повторен печат"
                        >
                          <i className="fa-regular fa-clock-rotate-left" />{" "}
                          <span className="hide-sm">Разреши повторен печат</span>
                        </button>
                      )}
                    </>
                  </div>
                </div>

                <table className="items">
                  <thead>
                    <tr>
                      <th>Ястие</th>
                      <th>Кол.</th>
                      <th>Бележка</th>
                      <th>Промени статуса на ястието</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsForStation.map((it) => (
                      <tr key={it.id} className={`item is-${it.status}`}>
                        <td data-th="Ястие">{it.name}</td>
                        <td data-th="Кол.">{it.qty}</td>
                        <td data-th="Бележка" className="muted">{it.note || "—"}</td>
                        <td data-th="Промени статуса на ястието">
                          <div className="a-right">
                            <ItemStatusButtons
                              value={it.status}
                              onPick={(v) => setItemStatus(it, v)}
                              disabled={isLocked}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="order-status-picker">
                  <span className="order-status-label">Промени статус на поръчката:</span>
                  <OrderStatusPicker
                    value={order.status}
                    onChange={(s) => changeOrderStatus(order.id, s)}
                    disabled={isLocked}
                  />
                </div>

                <div className="order-divider" />
              </li>
            );
          })}
        </ul>
      )}

      {meta && (
        <div className="pager">
          <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Назад
          </button>
          <span className="muted">стр. {meta?.current_page ?? 1} от {meta?.last_page ?? 1}</span>
          <button className="btn" disabled={page >= (meta?.last_page ?? 1)} onClick={() => setPage((p) => p + 1)}>
            Напред
          </button>
        </div>
      )}

      <AddOrderItemModal
        open={!!addItemForOrder}
        station={station}
        order={addItemForOrder}
        onClose={() => setAddItemForOrder(null)}
        onSubmit={async (payload) => {
          const order = addItemForOrder;
          if (!order) return;

          const tempId = -Math.floor(Math.random() * 1e9);
          const optimisticItem = {
            id: tempId,
            order_id: order.id,
            name: payload.dish_name || "",
            status: "new",
            qty: payload.qty,
            note: payload.note || null,
          };

          setOrders((cur) =>
            cur.map((o) => (o.id === order.id ? { ...o, items: [optimisticItem, ...(o.items || [])] } : o))
          );

          try {
            const { data } = await createOrderItem(order.id, payload);
            const real = data?.data || data;
            setOrders((cur) =>
              cur.map((o) =>
                o.id !== order.id ? o : { ...o, items: (o.items || []).map((it) => (it.id === tempId ? real : it))}
              )
            );
            setAddItemForOrder(null);
          } catch {
            setOrders((cur) =>
              cur.map((o) => (o.id !== order.id ? o : { ...o, items: o.items.filter((it) => it.id !== tempId) }))
            );
            showMsg("Грешка", "Неуспешно добавяне на ред към поръчката.");
          }
        }}
      />

      {msg && (
        <Modal
          open
          title={msg.title}
          message={msg.message}
          confirmText="OK"
          onConfirm={closeMsg}
          onCancel={closeMsg}
        />
      )}
    </div>
  );
}
