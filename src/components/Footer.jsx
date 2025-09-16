import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

export default function Footer() {
  const [showTop, setShowTop] = useState(false);

  // прост чек за сесия/роля от storage (без hook)
  const { loggedIn, isAdmin } = useMemo(() => {
    let logged = false;
    let admin = false;
    try {
      logged =
        !!localStorage.getItem("token") ||
        !!sessionStorage.getItem("token") ||
        !!localStorage.getItem("user") ||
        !!sessionStorage.getItem("user");

      const raw =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (raw) admin = !!JSON.parse(raw)?.isAdmin;
    } catch {}
    return { loggedIn: logged, isAdmin: admin };
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Дясна колона: навигация */}
        <div className="footer-nav">
          <nav>
            <NavLink to="/" end>Начало</NavLink>
            <NavLink to="/menu">Меню</NavLink>
            <NavLink to="/about">За нас</NavLink>
            <NavLink to="/contact">Контакти</NavLink>

            {/* НЕ показваме публично „Админ“ */}
            {/* Ако искаш да е видим само за логнат админ – разкоментирай: */}
            {/* {loggedIn && isAdmin && (
              <NavLink to="/admin" className="admin-link">Админ</NavLink>
            )} */}
          </nav>
        </div>


        {/* Клон Бургас */}
        <div className="footer-branch">
          <h3>Bistro bar&dinner</h3>
          <p className="footer-line">
            <span className="ico"></span>
            <a
              href="https://www.google.com/maps?q=ул.+Цар+Симеон+I,+Бургас"
              target="_blank"
              rel="noreferrer"
            >
              ул. „Хан Аспарух“ 34, Тервел, България
            </a>
          </p>
          <p className="footer-line">
            <span className="ico"></span>
          </p>
          <p className="footer-line">
            <span className="ico"></span> Понеделник–Неделя · 11:00 – 00:00 ч.
          </p>
          <p className="footer-line">
            <span className="ico"></span> За доставка:{" "}
            <a href="tel:+35987620061">+359 89 538 8692</a>
          </p>

          <div className="footer-social">
            <a href="#" aria-label="Facebook" title="Facebook">
              <svg viewBox="0 0 24 24">
                <path
                  d="M13 3h4v4h-4v3h3v4h-3v7h-4v-7H7v-4h2V7a4 4 0 0 1 4-4z"
                  fill="currentColor"
                />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24">
                <path
                  d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>


         {/* Лого + копирайт */}
        <div className="footer-logo">
          <img src="/banners/logo-underground.png" alt="Bistro" />
          <div className="footer-copy">2025 © Bistro Designed with ❤ by Dzhengiz Turhan</div>
        </div>

      </div>

      {/* Бутон нагоре */}
      {showTop && (
        <button className="to-top" onClick={scrollTop} aria-label="Към началото">
          ↑
        </button>
      )}
    </footer>
  );
}
