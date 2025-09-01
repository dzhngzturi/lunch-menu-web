// src/pages/Admin.jsx
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout, logoutAll } from "../api";
import Modal from "../components/Modal";
import "./admin.css";

// дружелюбно copy
const COPY = {
  logout: {
    title: "Потвърди изход",
    message: "Сигурен ли си? Това ще затвори текущата ти сесия.",
    confirm: "Да, излизам",
    cancel: "Отказ",
  },
  logoutAll: {
    title: "Потвърди изход навсякъде",
    message:
      "Ще излезеш от всички устройства. Можеш да влезеш отново по всяко време.",
    confirm: "Излез навсякъде",
    cancel: "Отказ",
  },
};

export default function Admin() {
  const nav = useNavigate();

  // ---- Drawer state (мобилно меню)
  const [navOpen, setNavOpen] = useState(false);
  const openNav = () => setNavOpen(true);
  const closeNav = () => setNavOpen(false);
  const toggleNav = () => setNavOpen((v) => !v);

  // добавя/махa клас към body + listeners за Esc/resize
  useEffect(() => {
    const cls = "sidebar-open";
    if (navOpen) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
    const onKey = (e) => e.key === "Escape" && closeNav();
    const onResize = () => window.innerWidth >= 1025 && closeNav();
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove(cls);
    };
  }, [navOpen]);

  // ---- Modals (logout)
  const [modal, setModal] = useState(null); // null | 'logout' | 'logoutAll'
  const openLogout = (e) => {
    e.preventDefault();
    setModal("logout");
    closeNav();
  };
  const openLogoutAll = (e) => {
    e.preventDefault();
    setModal("logoutAll");
    closeNav();
  };
  const closeModal = () => setModal(null);

  async function confirmModal() {
    try {
      if (modal === "logout") await logout();
      if (modal === "logoutAll") await logoutAll();
    } finally {
      setModal(null);
      nav("/login", { replace: true });
    }
  }

  const c = modal ? COPY[modal] : COPY.logout;

  return (
    <div className="admin-shell">
      {/* Topbar за мобилно: хамбургер + заглавие */}
      <header className="admin-topbar">
       <button
        className="admin-burger"
        aria-label="Меню"
        aria-expanded={navOpen}
        aria-controls="admin-sidebar"
        onClick={toggleNav}
        type="button"
      >
        <i className={`fa-solid ${navOpen ? "fa-xmark" : "fa-bars"}`}></i>
      </button>
        <h1 className="admin-topbar-title">Админ панел</h1>
      </header>

      {/* Sidebar */}
      <aside id="admin-sidebar" className={`admin-sidebar ${navOpen ? "open" : ""}`} onClick={(e) => {
        // затваряне при клик по линк в менюто (на мобилно е удобно)
        const a = e.target.closest("a");
        if (a && window.innerWidth < 1025) closeNav();
      }}>
        <h2 className="admin-title">Админ панел</h2>

        <nav className="admin-nav">
          <NavLink to="categories">Категории</NavLink>
          <NavLink to="dishes">Ястия</NavLink>
          <NavLink to="/admin/orders/kitchen" className="admin-link">
            Поръчки
          </NavLink>
          <a href="/">← Към сайта</a>
        </nav>

        <button type="button" onClick={openLogout} className="admin-logout">
          🚪 Изход
        </button>
        <button
          type="button"
          onClick={openLogoutAll}
          className="admin-logout admin-logout--all"
        >
          🔒 Изход навсякъде
        </button>
      </aside>

      {/* Бекдроп за мобилно меню */}
      <div className={`admin-backdrop ${navOpen ? "show" : ""}`} onClick={closeNav} />

      {/* Съдържание */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      {/* Централен модал */}
      <Modal
        open={!!modal}
        title={c.title}
        message={c.message}
        confirmText={c.confirm}
        cancelText={c.cancel}
        danger={modal === "logoutAll"}
        onConfirm={confirmModal}
        onCancel={closeModal}
      />
    </div>
  );
}
