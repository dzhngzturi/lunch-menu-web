import { useEffect, useState } from "react";
export default function useMedia(query = "(max-width: 768px)") {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = e => setMatch(e.matches);
    m.addEventListener?.("change", onChange) || m.addListener(onChange);
    return () => m.removeEventListener?.("change", onChange) || m.removeListener(onChange);
  }, [query]);
  return match;
}
