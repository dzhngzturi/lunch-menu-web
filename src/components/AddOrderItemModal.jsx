// src/components/AddOrderItemModal.jsx
import { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { getDishes } from "../api";

/**
 * Props:
 *  - open: boolean
 *  - onClose(): void
 *  - onSubmit({ dish_id, dish_name, qty, note }): Promise<void>
 *  - station: "kitchen" | "bar"
 */
export default function AddOrderItemModal({ open, onClose, onSubmit, station }) {
  const [dish, setDish] = useState(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // дърпаме ястия, филтрирани по station
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getDishes({ station })
      .then(({ data }) => {
        const list = data?.data || data || [];
        setOptions(list.map(d => ({ value: d.id, label: d.name })));
      })
      .finally(() => setLoading(false));
  }, [open, station]);

  // нулирай формата при отваряне/затваряне
  useEffect(() => {
    if (!open) {
      setDish(null);
      setQty(1);
      setNote("");
    }
  }, [open]);

  const handleKeydown = useCallback((e) => {
    if (e.key === "Escape") onClose?.();
    if (e.key === "Enter") {
      e.preventDefault();
      if (dish && qty > 0) {
        onSubmit?.({
          dish_id: dish.value,
          dish_name: dish.label,
          qty,
          note: note?.trim() || undefined,
        });
      }
    }
  }, [dish, qty, note, onClose, onSubmit]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [open, handleKeydown]);

  if (!open) return null;

  const canSubmit = !!dish && qty > 0;

  const selectStyles = {
    control: (base) => ({ ...base, minHeight: 42, borderRadius: 10 }),
    menu: (base) => ({ ...base, zIndex: 40 }),
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card small">
        <h3 className="modal-title">Добави ред</h3>

        <div className="modal-body grid gap-12">
          <label className="field">
            <span className="field-label">Ястие</span>
            <Select
              styles={selectStyles}
              options={options}
              isLoading={loading}
              placeholder="Избери ястие..."
              value={dish}
              onChange={setDish}
            />
          </label>

          <div className="grid grid-2 gap-12">
            <label className="field">
              <span className="field-label">Количество</span>
              <input
                type="number"
                min={1}
                step={1}
                className="input"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>

            <label className="field">
              <span className="field-label">Бележка</span>
              <input
                type="text"
                className="input"
                placeholder="напр. без лук"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Отказ</button>
          <button
            className="btn btn-primary"
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                dish_id: dish.value,
                dish_name: dish.label,
                qty,
                note: note?.trim() || undefined,
              })
            }
          >
            Добави
          </button>
        </div>
      </div>
    </div>
  );
}
