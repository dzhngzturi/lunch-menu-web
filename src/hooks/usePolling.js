import { useEffect, useRef } from "react";

/**
 * Полинг с внимание към видимостта на таба.
 * usage:
 * usePolling(fn, { delay: 6000, enabled: true, deps: [a,b] })
 */
export default function usePolling(fn, { delay = 6000, enabled = true, deps = [] } = {}) {
  const savedFn = useRef(fn);

  // запази последната версия на fn
  useEffect(() => { savedFn.current = fn; }, [fn]);

  useEffect(() => {
    if (!enabled) return;

    let t = null;

    const tick = () => {
      // не пулва, ако табът е скрит
      if (document.visibilityState === "visible") {
        Promise.resolve(savedFn.current()).finally(() => {
          t = setTimeout(tick, delay);
        });
      } else {
        t = setTimeout(tick, delay);
      }
    };

    t = setTimeout(tick, delay);
    return () => { if (t) clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, delay, ...deps]);
}
