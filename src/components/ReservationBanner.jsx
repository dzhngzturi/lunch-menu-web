// ReservationBanner.jsx
import { Mail, Phone } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ReservationBanner({
  email = "book@bistro.bg",
  phone = "+359 88 123 4567",
  bleed = true,        // ⬅️ full-width by default
  raise = 24,          // ⬅️ pull it up a bit
}) {
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;
  const mailHref = `mailto:${email}?subject=Резервация`;

  const innerRef = useRef(null);
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && el.classList.add("in-view"),
      { rootMargin: "0px 0px -15% 0px", threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
  className={`rb-strip ${bleed ? "rb-strip--bleed" : ""}`}
  aria-label="Резервации"
  style={bleed ? { ["--rb-raise"]: `${raise}px` } : undefined}
>

 
      <div className="rb-container">
        <div className="rb-inner" ref={innerRef}>
          <div className="rb-text">
            <h2 className="rb-title">Резервирайте маса</h2>
            <p className="rb-sub">Уютна обстановка и вкусна храна — запазете сега.</p>
          </div>

          <div className="rb-actions">
            <a className="rb-btn rb-btn--light" href={mailHref}>
              <Mail size={18} />
              <span>Email резервация</span>
            </a>
            <a className="rb-btn rb-btn--ghost" href={telHref}>
              <Phone size={18} />
              <span>{phone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
