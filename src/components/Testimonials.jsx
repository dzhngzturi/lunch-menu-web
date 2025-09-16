import { useCallback, useEffect, useRef, useState } from "react";

export default function Testimonials({
  items = [],                // [{ quote, author, bg }]
  autoPlay = true,
  interval = 6000,
  fullBleed = true,          // 100vw по подразбиране
  height = "min(70vh, 640px)",
  bgPosition = "center 65%",
  
}) {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const count = items.length || 0;
  const goTo = useCallback((i) => {
    if (!count) return;
    setIndex((i + count) % count);
  }, [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!autoPlay || count <= 1) return;
    timer.current = setInterval(next, interval);
    return () => clearInterval(timer.current);
  }, [next, interval, autoPlay, count]);

  const pause = () => timer.current && clearInterval(timer.current);
  const resume = () => {
    if (!autoPlay || count <= 1) return;
    pause(); timer.current = setInterval(next, interval);
  };

  if (!count) return null;

  return (
    <section
      className={`testimonials ${fullBleed ? "full-bleed" : ""}`}
      style={{ ["--t-h"]: height, backgroundPosition:bgPosition }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      aria-roledescription="carousel"
      aria-label="Отзиви"
    >
      <div className="t-viewport">
        <div
          className="t-track"
          style={{ transform: `translate3d(${-index * 100}%,0,0)` }}
        >
          {items.map((it, i) => (
            <figure key={i} className="t-slide" aria-hidden={i !== index}>
              {it.bg && <img className="t-bg" src={it.bg} alt="" />}
              <span className="t-overlay" />
              <figcaption className="t-body">
                <div className="t-kicker">— Отзиви —</div>
                <h2 className="t-title">Какво казват клиентите ни</h2>
                <blockquote className="t-quote">“{it.quote}”</blockquote>
                <div className="t-author">{it.author}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button className="t-arrow left" onClick={prev} aria-label="Назад">‹</button>
          <button className="t-arrow right" onClick={next} aria-label="Напред">›</button>
          <div className="t-dots" role="tablist">
            {items.map((_, i) => (
              <button
                key={i}
                role="tab"
                className={`dot ${i === index ? "active" : ""}`}
                aria-label={`Слайд ${i + 1}`}
                aria-selected={i === index}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
