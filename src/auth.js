import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, logout as apiLogout } from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser]   = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const isAuthed = !!token;

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    return u;
  };

  const logout = async () => {
    try { await apiLogout(); } catch(_) {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // (по желание) автологин ако имаме token – в момента не викаме /me, а директно приемаме
  useEffect(() => {}, [token]);

  return (
    <AuthCtx.Provider value={{ token, user, isAuthed, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
