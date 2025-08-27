// src/layout/SiteLayout.jsx
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "../components/footer";
import useMedia from "../hooks/useMedia";

export default function SiteLayout() {
  const isMobile = useMedia("(max-width: 768px)");
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  // прост “auth” чек – само за показване на Вход/Изход
  const loggedIn = useMemo(() => {
    try {
      return Boolean(
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("user") ||
        sessionStorage.getItem("user")
      );
    } catch { return false; }
  }, []);

  const location = useLocation();

  // Затваряме менюто при смяна на страница / режим
  useEffect(() => { setOpen(false); }, [location.pathname, isMobile]);

  // Заключваме скрола, докато менюто е отворено
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Подаваме реалната височина на header към CSS (за да започва drawer-ът под него)
  useEffect(() => {
    const setH = () => {
      const h = headerRef.current?.offsetHeight || 56;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };
    setH();
    window.addEventListener("resize", setH);
    return () => window.removeEventListener("resize", setH);
  }, []);

  return (
    <div className="site-shell">
      <header ref={headerRef} className="site-header">
        <div className="container header-row">
          <Link to="/" className="brand">Relax</Link>

          {/* Desktop навигация */}
          {!isMobile && (
            <nav className="nav nav-center">
              <NavLink to="/"        end className={({isActive}) => isActive ? "active" : ""}>Начало</NavLink>
              <NavLink to="/menu"    className={({isActive}) => isActive ? "active" : ""}>Меню</NavLink>
              <NavLink to="/about"   className={({isActive}) => isActive ? "active" : ""}>За нас</NavLink>
              <NavLink to="/contact" className={({isActive}) => isActive ? "active" : ""}>Контакти</NavLink>
            </nav>
          )}

          {/* Mobile: burger бутон */}
          {isMobile && (
            <button
              className="nav-toggle"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(v => !v)}
            >
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
            </button>
          )}
        </div>

        {/* Mobile drawer */}
        {isMobile && (
          <div
            id="mobile-nav"
            className={`mobile-drawer ${open ? "open" : ""}`}
            onClick={() => setOpen(false)}                 // клик върху тъмната зона -> затваря
          >
            <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
              <NavLink to="/"        end onClick={() => setOpen(false)}>Начало</NavLink>
              <NavLink to="/menu"    onClick={() => setOpen(false)}>Меню</NavLink>
              <NavLink to="/about"   onClick={() => setOpen(false)}>За нас</NavLink>
              <NavLink to="/contact" onClick={() => setOpen(false)}>Контакти</NavLink>
            </nav>
          </div>
        )}
      </header>

      <main className="site-main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
