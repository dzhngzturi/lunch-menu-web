// src/components/CategoryForm.jsx
import { useMemo } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api";


export default function CategoryForm({
  open,
  form,
  setForm,
  onSave,
  onCancel,
  editing,
  storageUrl = "",
}) {
  const preview = useMemo(() => {
    if (form.image instanceof File) return URL.createObjectURL(form.image);
    if (form.image_url) return form.image_url;
    if (form.image) return storageUrl + form.image;
    return null;
  }, [form.image, form.image_url, storageUrl]);

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{editing ? "Редакция на категория" : "Нова категория"}</h3>
          <button className="btn ghost" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          <label className="form-row">
            <span>Име</span>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Име на категория"
            />
          </label>

          <label className="form-row">
            <span>Снимка</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setForm((p) => ({ ...p, image: file }));
              }}
            />
          </label>

          <div className="preview">
            {preview ? <img src={preview} alt="Преглед" /> : <div className="noimg">Без снимка</div>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onCancel}>Откажи</button>
          <button className="btn primary" onClick={onSave}>
            {editing ? "Запази" : "Добави"}
          </button>
        </div>
      </div>

      {/* малко базови стилове ако нямаш вече модал */}
      <style>{`
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,.35);
          display: grid; place-items: center; z-index: 60;
        }
        .modal-card {
          width: min(640px, 92vw);
          background: #fff; border-radius: 14px;
          box-shadow: 0 14px 40px rgba(0,0,0,.18);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .modal-header, .modal-footer { padding: 14px 18px; display: flex; align-items: center; gap: 8px; }
        .modal-header { justify-content: space-between; border-bottom: 1px solid #eee; }
        .modal-body { padding: 14px 18px; display: grid; gap: 12px; }
        .form-row { display: grid; gap: 6px; }
        .form-row input[type="file"] { padding: 6px 0; }
        .preview { margin-top: 6px; display: grid; place-items: start; }
        .preview img { max-width: 260px; border-radius: 10px; }
        .noimg { padding: 8px 12px; background: #f5f5f5; border-radius: 8px; color: #888; }
        .btn.ghost { background: transparent; border: 0; font-size: 18px; }
      `}</style>
    </div>
  );
}
