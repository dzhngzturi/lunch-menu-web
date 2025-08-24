import { useEffect, useMemo, useRef, useState } from "react";

export default function MultiCarousel({
  items = [],                // масив с данни
  renderItem,                // (item) => JSX на картата
  interval = 4500,
  autoPlay = true,
  gap = 24,
  breakpoints = { 1280: 3, 900: 2, 0: 1 }, // ширина => брой видими
  title, subtitle,           // по желание заглавие над карусела
}) {
  const [perView, setPerView] = useState(3);
  const [page, setPage] = useState(0);
  const timer = useRef(null);

  // колко карти да се виждат според ширината
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      const sorted = Object.entries(breakpoints)
        .map(([bp, v]) => [Number(bp), v])
        .sort((a, b) => b[0] - a[0]);
      const found = sorted.find(([bp]) => w >= bp) || sorted.at(-1);
      setPerView(found[1]);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [breakpoints]);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(items.length / perView)),
    [items.length, perView]
  );

  // autoplay
  useEffect(() => {
    if (!autoPlay || pages <= 1) return;
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(
      () => setPage((p) => (p + 1) % pages),
      interval
    );
    return () => timer.current && clearInterval(timer.current);
  }, [pages, interval, autoPlay]);

  const prev = () => setPage((p) => (p - 1 + pages) % pages);
  const next = () => setPage((p) => (p + 1) % pages);

  const offsetPct = -(page * 100);

  return (
    <section className="mc">
      {(title || subtitle) && (
        <header className="mc-head">
          {subtitle && <div className="mc-kicker">{subtitle}</div>}
          {title && <h2 className="mc-title">{title}</h2>}
          <div className="mc-rule" />
        </header>
      )}

      <div
        className="mc-wrap"
        onMouseEnter={() => timer.current && clearInterval(timer.current)}
        onMouseLeave={() => {
          if (autoPlay && pages > 1) {
            timer.current = setInterval(() => setPage((p) => (p + 1) % pages), interval);
          }
        }}
      >
        {pages > 1 && (
          <button className="mc-arrow left" onClick={prev} aria-label="Назад">‹</button>
        )}

        <div className="mc-viewport">
          <div className="mc-track" style={{ transform: `translate3d(${offsetPct}%,0,0)` }}>
            {items.map((it, i) => (
              <div
                className="mc-item"
                key={i}
                style={{
                  flex: `0 0 calc(${100 / perView}% - ${(gap * (perView - 1)) / perView}px)`,
                  marginRight: i % perView === perView - 1 ? 0 : gap,
                }}
              >
                {renderItem ? renderItem(it) : it}
              </div>
            ))}
          </div>
        </div>

        {pages > 1 && (
          <button className="mc-arrow right" onClick={next} aria-label="Напред">›</button>
        )}
      </div>

      {pages > 1 && (
        <div className="mc-dots">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              className={`dot ${i === page ? "active" : ""}`}
              onClick={() => setPage(i)}
              aria-label={`Страница ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
