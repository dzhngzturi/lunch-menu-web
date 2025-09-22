// src/LoaderBridges.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useLoading } from "./loading";

// Loader при смяна на route
export function RouteChangeLoader() {
  const { setLoading } = useLoading();
  const loc = useLocation();

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350); // кратко „озаряване“
    return () => clearTimeout(t);
  }, [loc.pathname, setLoading]);

  return null;
}

// Loader за всички axios заявки
export function AxiosLoader() {
  const { setLoading } = useLoading();

  useEffect(() => {
    const reqId = axios.interceptors.request.use((cfg) => {
      setLoading(true);
      return cfg;
    }, (err) => {
      setLoading(false);
      return Promise.reject(err);
    });

    const resId = axios.interceptors.response.use((res) => {
      setLoading(false);
      return res;
    }, (err) => {
      setLoading(false);
      return Promise.reject(err);
    });

    return () => {
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
    };
  }, [setLoading]);

  return null;
}
