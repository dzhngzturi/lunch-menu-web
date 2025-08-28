import { useState } from "react";
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
    message: "Ще излезеш от всички устройства. Можеш да влезеш отново по всяко време.",
    confirm: "Излез навсякъде",
    cancel: "Отказ",
  },
};

export default function Admin() {
  const nav = useNavigate();
  const [modal, setModal] = useState(null); // null | 'logout' | 'logoutAll'
  const openLogout = (e) => { e.preventDefault(); setModal("logout"); };
  const openLogoutAll = (e) => { e.preventDefault(); setModal("logoutAll"); };
  const closeModal = () => setModal(null);

  async function confirmModal() {
    try {
      if (modal === "logout")    await logout();     // POST /logout → 204
      if (modal === "logoutAll") await logoutAll();  // POST /logout-all → 204
    } finally {
      setModal(null);
      nav("/login", { replace: true });
    }
  }

  const c = modal ? COPY[modal] : COPY.logout;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h2 className="admin-title">Админ панел</h2>

        <nav className="admin-nav">
          <NavLink to="categories">Категории</NavLink>
          <NavLink to="dishes">Ястия</NavLink>
          <a href="/">← Към сайта</a>
        </nav>

        <button type="button" onClick={openLogout} className="admin-logout">
          🚪 Изход
        </button>
        <button type="button" onClick={openLogoutAll} className="admin-logout admin-logout--all">
          🔒 Изход навсякъде
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      {/* Централен, по-дружелюбен модал */}
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
