import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "../components/Modal.jsx";   // <-- твоя модал
import { logout } from "../api";
import "../pages/admin.css";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);       // sidebar
  const [askLogout, setAskLogout] = useState(false); // модала
  const navigate = useNavigate();

  const doLogout = async () => {
    try {
      await logout();
    } catch {}
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new Event("auth-changed"));
    setAskLogout(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      {/* TOPBAR */}
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-burger"
          aria-label="Меню"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`}></i>
        </button>


        <div className="admin-brand">Admin Dashboard</div>

        <div style={{ marginLeft: "auto" }}>
          <button className="admin-logout" onClick={() => setAskLogout(true)}>Изход</button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <nav className="admin-menu">
    
          <NavLink to="/admin/orders/create">Нова поръчка</NavLink>
          <NavLink to="/admin/orders/kitchen">Поръчки (Кухня)</NavLink>
          <NavLink to="/admin/orders/bar">Поръчки (Бар)</NavLink>
          <NavLink to="/admin/orders/report">Отчет</NavLink>
          <div className="admin-menu-sep" />
          <NavLink to="/admin/categories">Категории</NavLink>
          <NavLink to="/admin/dishes">Ястия</NavLink>

          <div className="admin-actions">
            <button className="admin-logout" onClick={() => setAskLogout(true)}>Изход</button>
          </div>
        </nav>
      </aside>

      <div className={`admin-overlay ${open ? "show" : ""}`} onClick={() => setOpen(false)} />

      <main className="admin-main">
        <div className="admin-container">
          <Outlet />
        </div>
      </main>

      {/* === Modal за изход === */}
      <Modal
        open={askLogout}
        title="Изход"
        message="Сигурни ли сте, че искате да излезете?"
        confirmText="Да, излез"
        cancelText="Отказ"
        danger={true}
        onConfirm={doLogout}
        onCancel={() => setAskLogout(false)}
      />
    </div>
  );
}
