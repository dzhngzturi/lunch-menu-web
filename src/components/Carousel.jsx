import { useEffect, useRef, useState, useCallback } from "react";

export default function Carousel({
  images = [],
  interval = 5000,
  showIndicators = true,
  showArrows = true,
  autoPlay = true,
  // НОВО:
  fullBleed = false,
  hero = false,
  height = "min(85vh, 780px)",
  className = "",            // <- НОВО
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);
  const touch = useRef({ x: 0, y: 0, dragging: false });

  const count = images.length || 0;

  const goTo = useCallback((i) => {
    if (!count) return;
    const next = (i + count) % count;
    setIndex(next);
  }, [count]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!autoPlay || count <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [next, interval, autoPlay, count]);

  const pause = () => timerRef.current && clearInterval(timerRef.current);
  const resume = () => {
    if (!autoPlay || count <= 1) return;
    pause();
    timerRef.current = setInterval(next, interval);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onTouchStart = (e) => {
    touch.current.dragging = true;
    touch.current.x = e.touches[0].clientX;
    touch.current.y = e.touches[0].clientY;
    pause();
  };
  const onTouchMove = (e) => {
    if (!touch.current.dragging) return;
    const dx = e.touches[0].clientX - touch.current.x;
    const dy = e.touches[0].clientY - touch.current.y;
    if (Math.abs(dy) > Math.abs(dx)) return;
    e.preventDefault();
  };
  const onTouchEnd = (e) => {
    if (!touch.current.dragging) return;
    const dx = (e.changedTouches?.[0]?.clientX ?? touch.current.x) - touch.current.x;
    touch.current.dragging = false;
    const TH = 50;
    if (dx < -TH) next();
    else if (dx > TH) prev();
    resume();
  };

  if (!count) return null;

  const rootClass =
    `carousel ${fullBleed ? "full-bleed" : ""} ${hero ? "carousel-hero" : ""} ${className}`.trim();

  return (
    <section
      className={rootClass}
      role="region"
      aria-roledescription="carousel"
      aria-label="Галерия"
      onMouseEnter={pause}
      onMouseLeave={resume}
      style={hero ? { ["--hero-h"]: height } : undefined}
    >
      {showArrows && count > 1 && (
        <>
          <button className="carousel-arrow left" aria-label="Предишна" onClick={prev}>‹</button>
          <button className="carousel-arrow right" aria-label="Следваща" onClick={next}>›</button>
        </>
      )}

      <div
        ref={wrapRef}
        className="carousel-viewport"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="carousel-track" style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}>
          {images.map((img, i) => (
            <figure className="carousel-slide" key={i} aria-hidden={i !== index}>
              <img loading="lazy" src={img.src} alt={img.alt || ""} />
              {(img.title || img.caption) && (
                <figcaption className="carousel-caption">
                  {img.title && <h3>{img.title}</h3>}
                  {img.caption && <p>{img.caption}</p>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>

      {showIndicators && count > 1 && (
        <div className="carousel-dots" role="tablist" aria-label="Слайдове">
          {images.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === index ? "active" : ""}`}
              aria-label={`Към слайд ${i + 1}`}
              aria-selected={i === index}
              role="tab"
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
