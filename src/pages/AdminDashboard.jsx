import { NavLink } from "react-router-dom";
import { useMemo } from "react";

export default function AdminDashboard() {
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}

  const isAdmin = user?.role === "admin";

  return (
    <div className="dashboard">
      <h1>{isAdmin ? "Admin Dashboard" : "Staff Dashboard"}</h1>
      <p>Добре дошли! Изберете секция:</p>

      {isAdmin ? (
        <>
          <div className="card">
            <h2>Нова поръчка</h2>
            <p>Бързо създаване на поръчка.</p>
            <NavLink to="/admin/orders/create" className="btn primary">Създай</NavLink>
          </div>

          <div className="card">
            <h2>Поръчки</h2>
            <p>Кухня / Бар, активни поръчки.</p>
            <NavLink to="/admin/orders/kitchen" className="btn secondary">Кухня</NavLink>
            <NavLink to="/admin/orders/bar" className="btn secondary">Бар</NavLink>
          </div>

          <div className="card">
            <h2>Ястия</h2>
            <p>Управление на ястията в менюто.</p>
            <NavLink to="/admin/dishes" className="btn primary">Списък</NavLink>
          </div>

          <div className="card">
            <h2>Категории</h2>
            <p>Категории за менюто.</p>
            <NavLink to="/admin/categories" className="btn primary">Списък</NavLink>
          </div>

          <div className="card">
            <h2>Отчет</h2>
            <p>Справки и статистики.</p>
            <NavLink to="/admin/orders/report" className="btn primary">Към отчета</NavLink>
          </div>
        </>
      ) : (
        <>
          {/* Staff dashboard тук */}
                    <div className="card">
            <h2>Нова поръчка</h2>
            <p>Бързо създаване на поръчка.</p>
            <NavLink to="/admin/orders/create" className="btn primary">Създай</NavLink>
          </div>

          <div className="card">
            <h2>Поръчки</h2>
            <p>Кухня / Бар, активни поръчки.</p>
            <NavLink to="/admin/orders/kitchen" className="btn secondary">Кухня</NavLink>
            <NavLink to="/admin/orders/bar" className="btn secondary">Бар</NavLink>
          </div>

        </>
      )}
    </div>
  );
}
