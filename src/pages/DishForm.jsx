// src/pages/DishForm.jsx
import { useEffect, useMemo, useState } from "react";
import { api, getCategories } from "../api";
import { buildStorageUrl } from "../api";

export default function DishForm({ form, onChange, onSave, onCancel, editing }) {
  const [cats, setCats] = useState([]);
  const [imgMode, setImgMode] = useState("upload"); // 'upload' | 'existing'
  const [existing, setExisting] = useState([]);      // ['meals/a.jpg', 'meals/b.png', ...]

  // категории
  useEffect(() => {
    let ignore = false;
    (async () => {
      const res = await getCategories();
      const list = res.data?.data ?? [];
      if (!ignore) {
        setCats(list);
        if (!form.category_id && list.length) {
          onChange("category_id", String(list[0].id));
        }
      }
    })();
    return () => { ignore = true; };
  }, []); // mount

  // налични снимки (само веднъж)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await api.get("/images/meals"); // <- масив от относителни пътища
        if (!ignore) setExisting(res.data ?? []);
      } catch {}
    })();
    return () => { ignore = true; };
  }, []);

  const onSubmit = (e) => { e.preventDefault(); onSave(); };

  // Смяна към качване на файл → чистим image_existing
  const switchToUpload = () => {
    setImgMode("upload");
    if (form.image_existing) onChange("image_existing", "");
  };
  // Смяна към избор от налични → чистим image (File)
  const switchToExisting = () => {
    setImgMode("existing");
    if (form.image instanceof File) onChange("image", null);
  };

  const onFile = (e) => onChange("image", e.target.files?.[0] ?? null);

  // preview на избраната снимка
  const previewUrl = useMemo(() => {
    if (form.image instanceof File) return URL.createObjectURL(form.image);
    if (form.image_existing) return buildStorageUrl(form.image_existing);
    // ако редактираме и имаме текуща снимка в record-а (можеш да подадеш от родителя form.image_url или form.image_path)
    if (form.image_url) return form.image_url;
    if (form.image) return buildStorageUrl(form.image); // когато id запис вече има image път (string)
    return null;
  }, [form.image, form.image_existing, form.image_url]);

  return (
    <form className="dish-form" onSubmit={onSubmit}>
      <h3>{editing ? "Редакция на ястие" : "Ново ястие"}</h3>

      {/* --- СКРОЛИРУЕМО ТЯЛО --- */}
      <div className="form-body">
        {/* Категория */}
        <div className="field">
          <label>Категория</label>
          <select
            value={form.category_id ?? ""}
            onChange={(e) => onChange("category_id", e.target.value)}
            required
          >
            {cats.map(c => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Име</label>
          <input
            value={form.name ?? ""}
            onChange={(e) => onChange("name", e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Описание</label>
          <textarea
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </div>

        <div className="field">
          <label>Цена</label>
          <input
            type="number"
            step="0.01"
            value={form.price ?? ""}
            onChange={(e) => onChange("price", e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Тип меню</label>
          <select
            value={form.menu_type ?? "regular"}
            onChange={(e) => onChange("menu_type", e.target.value)}
          >
            <option value="regular">Редовно</option>
            <option value="lunch">Обедно</option>
            <option value="both">И двете</option>
          </select>
        </div>

        <div className="field">
          <label>Станция</label>
          <select
            value={form.station ?? "kitchen"}
            onChange={(e) => onChange("station", e.target.value)}
          >
            <option value="kitchen">Кухня</option>
            <option value="bar">Бар</option>
          </select>
        </div>

        {/* ---- СНИМКИ ---- */}
        <div className="field">
          <label>Снимка</label>

          <div className="tabs">
            <button
              type="button"
              className={`tab ${imgMode === "upload" ? "active" : ""}`}
              onClick={switchToUpload}
            >
              Качи нова
            </button>
            <button
              type="button"
              className={`tab ${imgMode === "existing" ? "active" : ""}`}
              onClick={switchToExisting}
            >
              Провери налични
            </button>
          </div>

          {imgMode === "upload" && (
            <div className="mt-2">
              <input type="file" accept="image/*" onChange={onFile} />
            </div>
          )}

          {imgMode === "existing" && (
            <div className="existing-grid">
              {existing.length === 0 && (
                <p className="muted">Няма налични снимки.</p>
              )}
              {existing.map((path) => {
                const selected = form.image_existing === path;
                return (
                  <button
                    key={path}
                    type="button"
                    className={`existing-item ${selected ? "selected" : ""}`}
                    onClick={() => onChange("image_existing", path)}
                    title={path}
                  >
                    <img src={buildStorageUrl(path)} alt="" />
                  </button>
                );
              })}
            </div>
          )}

          {previewUrl && (
            <div className="preview">
              <img src={previewUrl} alt="Преглед" />
            </div>
          )}
        </div>
      </div>

      {/* --- ФУТЪР С БУТОНИ (sticky) --- */}
      <div className="actions">
        <button type="submit" className="btn-save">
          {editing ? "Запази" : "Добави"}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Отказ
        </button>
      </div>
    </form>
  );
}
