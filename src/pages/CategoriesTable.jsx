import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';

export default function CategoriesTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // {id,name} или null
  const [name, setName] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await getCategories();
    setRows(res.data.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (editing) {
      await updateCategory(editing.id, { name: trimmed });
    } else {
      await createCategory({ name: trimmed });
    }
    setName('');
    setEditing(null);
    await load();
  };

  const onEdit = (row) => {
    setEditing(row);
    setName(row.name);
  };

  const onDelete = async (row) => {
    if (!confirm(`Изтриване на "${row.name}"?`)) return;
    await deleteCategory(row.id);
    await load();
  };

  return (
    <div>
      <h1>Категории</h1>

      <div className="toolbar">
        <div className="form-row" style={{ alignItems: 'center' }}>
          <input
            placeholder="Име на категория"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
          />
          <button className="add" onClick={onSave} disabled={!name.trim()}>
            {editing ? 'Запази' : 'Добави'}
          </button>
          {editing && (
            <button
              className="secondary"
              onClick={() => { setEditing(null); setName(''); }}
            >
              Откажи
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p>Зареждане...</p>
      ) : (
        <div className="table-wrapper">
          <table className="table categories">
            <thead>
              <tr>
                <th>ID</th>
                <th>Име</th>
                <th>Брой ястия</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td data-label="ID">{r.id}</td>
                  <td data-label="Име">{r.name}</td>
                  <td data-label="Брой ястия">{r.dishes_count ?? r.dishes?.length ?? r.count ?? 0}</td>
                  <td className="actions" data-label="Действия">
                    <button className="secondary" onClick={() => onEdit(r)}>Редакция</button>{' '}
                    <button className="danger" onClick={() => onDelete(r)}>Изтрий</button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={4}>Няма записи.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
