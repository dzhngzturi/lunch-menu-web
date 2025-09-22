// src/loading.js
import { createContext, useContext, useMemo, useState } from "react";

const LoadingCtx = createContext({ loading: false, setLoading: () => {} });

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const value = useMemo(() => ({ loading, setLoading }), [loading]);
  return <LoadingCtx.Provider value={value}>{children}</LoadingCtx.Provider>;
}

export function useLoading() {
  return useContext(LoadingCtx);
}
