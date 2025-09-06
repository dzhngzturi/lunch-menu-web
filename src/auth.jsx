// src/auth.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const AuthCtx = createContext({ token: null, user: null, setAuth: () => {}, logout: () => {} });

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  // слушаме външни промени (напр. от api.login/logout)
  useEffect(() => {
    const onChange = () => {
      setToken(localStorage.getItem('token'));
      try { setUser(JSON.parse(localStorage.getItem('user'))); } catch { setUser(null); }
    };
    window.addEventListener('auth-changed', onChange);
    return () => window.removeEventListener('auth-changed', onChange);
  }, []);

  const setAuth = (t, u) => {
    if (t) localStorage.setItem('token', t); else localStorage.removeItem('token');
    if (u) localStorage.setItem('user', JSON.stringify(u)); else localStorage.removeItem('user');
    setToken(t || null);
    setUser(u || null);
    window.dispatchEvent(new Event('auth-changed'));
  };

  const logout = () => setAuth(null, null);

  return (
    <AuthCtx.Provider value={{ token, user, setAuth, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
