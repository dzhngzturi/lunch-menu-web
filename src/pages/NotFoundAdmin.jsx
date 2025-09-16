import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFoundAdmin() {
  const { pathname } = useLocation();
  useEffect(() => { document.title = "404 — Admin"; }, []);

  return (
    <div className="card" style={{ margin: "24px 0" }}>
      <div className="card-header">
        <h1 style={{ margin: 0 }}>404 — Страницата не е намерена</h1>
      </div>
      <div style={{ padding: 16 }}>
        <p className="muted" style={{ marginBottom: 12 }}>
          Липсва ресурс за <code>{pathname}</code> в админ панела.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/admin" className="btn btn-primary">Към таблото</Link>
        </div>
      </div>
    </div>
  );
}
