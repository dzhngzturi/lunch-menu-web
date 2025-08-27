import { NavLink, Outlet, Link } from "react-router-dom";
import "./admin.css";

export default function Admin() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h2 className="admin-title">Админ панел</h2>

        <nav className="admin-nav">
          <NavLink to="categories">Категории</NavLink>
          <NavLink to="dishes">Ястия</NavLink>
          <a href="/">← Към сайта</a>
        </nav>

        {/* единствен бутон за изход, най-долу */}
        <Link to="/logout" className="admin-logout">Изход</Link>
      </aside>

      <main className="admin-main">
        {/* НЯМА втори header/Изход тук */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
