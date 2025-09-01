// src/pages/DishForm.jsx  (или където го държиш)
export default function DishForm({ form, onChange, onSave, onCancel, editing }) {
  const onSubmit = (e) => { e.preventDefault(); onSave(); };
  const onFile = (e) => onChange("image", e.target.files?.[0] ?? null);

  return (
    <form className="dish-form" onSubmit={onSubmit}>
      <h3>{editing ? "Редакция на ястие" : "Ново ястие"}</h3>

      <div className="field">
        <label>Име</label>
        <input
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label>Описание</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </div>

      <div className="field">
        <label>Цена</label>
        <input
          type="number"
          step="0.01"
          value={form.price}
          onChange={(e) => onChange("price", e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label>Тип меню</label>
        <select
          value={form.menu_type}
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
          value={form.station}
          onChange={(e) => onChange("station", e.target.value)}
        >
          <option value="kitchen">Кухня</option>
          <option value="bar">Бар</option>
        </select>
      </div>

      <div className="field">
        <label>Снимка</label>
        <input type="file" accept="image/*" onChange={onFile} />
        {form.image && form.image instanceof File && (
          <div className="preview">
            <img src={URL.createObjectURL(form.image)} alt="Преглед" />
          </div>
        )}
      </div>

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
