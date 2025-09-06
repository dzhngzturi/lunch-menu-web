// src/layout/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "../components/Modal.jsx";
import { logout } from "../api";
import "../pages/admin.css";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [askLogout, setAskLogout] = useState(false);
  const navigate = useNavigate();

  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}
  const isAdmin = user?.role === "admin";    

  const doLogout = async () => {
    try { await logout(); } catch {}
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new Event("auth-changed"));
    setAskLogout(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-burger"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
        </button>

        {/* 👇 заменяме статичния текст с динамичен NavLink */}
        <NavLink to="/admin" className="admin-brand">
          {isAdmin ? "Admin Dashboard" : "Staff Dashboard"}
        </NavLink>

        <div style={{ marginLeft: "auto" }}>
          <button
            className="admin-logout"
            onClick={() => setAskLogout(true)}
          >
            Изход
          </button>
        </div>
      </header>
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        {/* 👇 Менюто зависи от ролята */}
        {isAdmin ? (
          <nav className="admin-menu">
            <NavLink to="/admin" end>Dashboard</NavLink>
            <NavLink to="/admin/orders/create">Нова поръчка</NavLink>
            <NavLink to="/admin/orders/kitchen">Поръчки (Кухня)</NavLink>
            <NavLink to="/admin/orders/bar">Поръчки (Бар)</NavLink>
            <NavLink to="/admin/orders/report">Отчет</NavLink>
            <div className="admin-menu-sep" />
            <NavLink to="/admin/categories">Категории</NavLink>
            <NavLink to="/admin/dishes">Ястия</NavLink>
            <div className="admin-menu-sep" />
            <NavLink to="/admin/staff">Staff</NavLink>
          </nav>
        ) : (
          <nav className="admin-menu">
            {/* само поръчките за staff */}
             <NavLink to="/admin" end>Dashboard</NavLink>
            <NavLink to="/admin/orders/create">Нова поръчка</NavLink>
            <NavLink to="/admin/orders/kitchen">Поръчки (Кухня)</NavLink>
            <NavLink to="/admin/orders/bar">Поръчки (Бар)</NavLink>
            {/* ако искаш да виждат и отчета, махни този коментар: */}
            {/* <NavLink to="/admin/orders/report">Отчет</NavLink> */}
          </nav>
        )}
      </aside>

      <div className={`admin-overlay ${open ? "show" : ""}`} onClick={() => setOpen(false)} />

      <main className="admin-main">
        <div className="admin-container">
          <Outlet />
        </div>
      </main>

      <Modal
        open={askLogout}
        title="Изход"
        message="Сигурни ли сте, че искате да излезете?"
        confirmText="Да, излез"
        cancelText="Отказ"
        danger
        onConfirm={doLogout}
        onCancel={() => setAskLogout(false)}
      />
    </div>
  );
}
