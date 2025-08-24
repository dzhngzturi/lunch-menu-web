import { NavLink, Outlet } from 'react-router-dom';
import './admin.css';

export default function Admin() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h2>Админ панел</h2>
        <nav>
          <NavLink to="categories">Категории</NavLink>
          <NavLink to="dishes">Ястия</NavLink>
          <a href="/">← Към сайта</a>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
