import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFoundPublic() {
  const { pathname } = useLocation();
  useEffect(() => { document.title = "404 — Страницата не е намерена"; }, []);

  return (
      <div className="nf-wrapper">
        <div className="nf-card">
          <h1>404 — Страницата не е намерена</h1>
          <p>Няма резултат за този адрес. Върнете се към началото на сайта.</p>
          <Link to="/" className="nf-btn">Към началото</Link>
        </div>
      </div>
  );
}
