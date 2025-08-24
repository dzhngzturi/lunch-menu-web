import { useEffect, useMemo, useState } from 'react';
import { getCategories, getDishes, createDish, updateDish, deleteDish } from '../api';

export default function DishesTable() {
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const emptyForm = {
    category_id: '',
    name: '',
    description: '',
    price: '',
    image: null,
    menu_type: 'regular',        // ← default
  };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    const [cRes, dRes] = await Promise.all([getCategories(), getDishes()]); // админът вижда всичко
    setCats(cRes.data.data ?? []);
    setRows(dRes.data.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const onSave = async () => {
    const fd = new FormData();
    fd.append('category_id', form.category_id);
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('menu_type', form.menu_type);   // ← ВАЖНО
    if (form.image instanceof File) fd.append('image', form.image);

    if (editing) {
      await updateDish(editing.id, fd);
    } else {
      await createDish(fd);
    }
    setForm(emptyForm);
    setEditing(null);
    await load();
  };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      category_id: row.category_id,
      name: row.name,
      description: row.description || '',
      price: row.price,
      image: null,
      menu_type: row.menu_type || 'regular', // ← зареждаме текущия тип
    });
  };

  const onDelete = async (row) => {
    if (!confirm(`Изтриване на "${row.name}"?`)) return;
    await deleteDish(row.id);
    await load();
  };

  const storageUrl = useMemo(() => `${import.meta.env.VITE_API_URL}/storage/`, []);

  return (
    <div>
      <h1>Ястия</h1>

      {/* Форма */}
      <div className="toolbar">
        <div className="form-row" style={{ alignItems: 'center' }}>
          <select
            value={form.category_id}
            onChange={(e) => onChange('category_id', e.target.value)}
          >
            <option value="">-- Категория --</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <input
            placeholder="Име"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
          />

          <input
            placeholder="Описание"
            value={form.description}
            onChange={(e) => onChange('description', e.target.value)}
          />

          <input
            placeholder="Цена"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => onChange('price', e.target.value)}
          />

          {/* НОВО: Тип меню */}
          <select
            value={form.menu_type}
            onChange={(e) => onChange('menu_type', e.target.value)}
            title="Тип меню"
          >
            <option value="regular">Стандартно</option>
            <option value="lunch">Обедно меню</option>
            <option value="both">И двете</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => onChange('image', e.target.files[0])}
          />

          <button className="add" onClick={onSave}>
            {editing ? 'Запази' : 'Добави'}
          </button>

          {editing && (
            <button
              className="secondary"
              onClick={() => { setEditing(null); setForm(emptyForm); }}
            >
              Откажи
            </button>
          )}
        </div>
      </div>

      {loading ? <p>Зареждане...</p> : (
        <div className="table-wrapper">
          <table className="table dishes">
            <thead>
              <tr>
                <th>ID</th>
                <th>Категория</th>
                <th>Име</th>
                <th>Описание</th>
                <th>Цена</th>
                <th>Тип</th>
                <th>Снимка</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td data-label="ID">{r.id}</td>
                  <td data-label="Категория">{r.category?.name ?? r.category_id}</td>
                  <td data-label="Име">{r.name}</td>
                  <td data-label="Описание">{r.description}</td>
                  <td data-label="Цена">{Number(r.price).toFixed(2)} лв.</td>
                  <td data-label="Тип">
                    {/* показваме превод/текст */}
                    {r.menu_type === 'lunch' ? 'Обедно' :
                     r.menu_type === 'both'  ? 'И двете' : 'Стандартно'}
                  </td>
                  <td data-label="Снимка">
                    {r.image ? (
                      <img className="thumb" src={storageUrl + r.image} alt={r.name} />
                    ) : '—'}
                  </td>
                  <td className="actions" data-label="Действия">
                    <button className="secondary" onClick={() => onEdit(r)}>Редакция</button>{' '}
                    <button className="danger" onClick={() => onDelete(r)}>Изтрий</button>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan="8">Няма записи.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
