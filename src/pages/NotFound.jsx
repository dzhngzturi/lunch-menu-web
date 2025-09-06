// src/pages/NotFound.jsx

export default function NotFound() {
  return (
    <div className="notfound-wrapper">
      <div className="notfound-card">
        <h1>404 — Страницата не е намерена</h1>
        <p>Няма резултат за този адрес. Върнете се към началото на админ панела.</p>
        <a href="/admin" className="btn primary">Към началото</a>
      </div>
    </div>
  );
}
