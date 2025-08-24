// src/layout/SiteLayout.jsx
import { NavLink, Link, Outlet } from "react-router-dom";

export default function SiteLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-row">
          <Link to="/" className="brand">Relax</Link>
         <nav className="nav">
        <NavLink to="/"      className={({isActive}) => isActive ? "active" : ""}>Начало</NavLink>
        <NavLink to="/menu"  className={({isActive}) => isActive ? "active" : ""}>Меню</NavLink>
        <NavLink to="/contact" className={({isActive}) => isActive ? "active" : ""}>Контакти</NavLink>
        <NavLink to="/admin" className={({isActive}) => "nav-admin" + (isActive ? " active" : "")}>Админ</NavLink>
        </nav>
        </div>
      </header>

      <main className="site-main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <p>© {new Date().getFullYear()} Relax</p>
          <p>ул. Пример 1 · +359 88 123 4567</p>
        </div>
      </footer>
    </div>
  );
}
