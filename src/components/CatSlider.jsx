import { useEffect, useMemo, useRef } from "react";

/**
 * CatSlider – хоризонтален „пил“ слайдер за мобилен изглед.
 *
 * Props:
 *  - options:  [{ value: "12", label: "Салати" }, ...]
 *  - activeId: string|number (id на избраната категория)
 *  - onPick:   (id) => void
 */
export default function CatSlider({ options = [], activeId = null, onPick }) {
  const wrapRef = useRef(null);

  // осигуряваме стабилен shape за items
  const items = useMemo(
    () => options.map(o => ({ id: String(o.value), name: o.label })),
    [options]
  );

  // центрира активния елемент, когато activeId се промени
  useEffect(() => {
    if (!wrapRef.current) return;
    const wrap = wrapRef.current;
    const el = wrap.querySelector(`[data-id="${String(activeId)}"]`);
    if (el) {
      const wrapMid = wrap.clientWidth / 2;
      const elMid = el.offsetLeft + el.clientWidth / 2;
      wrap.scrollTo({ left: Math.max(0, elMid - wrapMid), behavior: "smooth" });
    }
  }, [activeId]);

  // скрол с бутоните
  const scrollBy = (dx) => {
    if (!wrapRef.current) return;
    wrapRef.current.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <div className="cat-slider">
      <button
        className="cat-slider-nav left"
        aria-label="Назад"
        onClick={() => scrollBy(-240)}
        type="button"
      >
        ‹
      </button>

      <div className="cat-slider-track" ref={wrapRef}>
        {items.map((c) => {
          const active = String(activeId) === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={`cat-pill ${active ? "active" : ""}`}
              data-id={c.id}
              onClick={() => onPick?.(Number.isNaN(+c.id) ? c.id : +c.id)}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <button
        className="cat-slider-nav right"
        aria-label="Напред"
        onClick={() => scrollBy(240)}
        type="button"
      >
        ›
      </button>
    </div>
  );
}
