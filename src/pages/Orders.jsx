// src/pages/Orders.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function Orders() {
  return (
    <div className="container" style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Поръчки</h1>

      {/* Табове за станции */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <NavLink
          to="kitchen"
          className={({ isActive }) => (isActive ? "btn btn-primary" : "btn")}
        >
          Кухня
        </NavLink>
        <NavLink
          to="bar"
          className={({ isActive }) => (isActive ? "btn btn-primary" : "btn")}
        >
          Бар
        </NavLink>
      </div>

      {/* Тук се визуализира дъщерния екран (OrdersBoard) */}
      <Outlet />
    </div>
  );
}
