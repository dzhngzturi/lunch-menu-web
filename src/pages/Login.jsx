import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../api"; // пътят ти

export default function Login() {
  const nav = useNavigate();
  const { state } = useLocation();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState(""); // нека е празно (или "secret123" за локално)
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const user = await login(email, password); // <-- вече връща user
      // ако си искал да пазиш редирект към предишна страница
      const to = state?.from?.pathname || (user?.is_admin ? "/admin" : "/");
      nav(to, { replace: true });
    } catch (error) {
      const msg = error?.response?.data?.message || "Невалидни данни за вход.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Админ вход</h1>
        <p className="auth-sub">Влезте, за да управлявате менюто.</p>

        {err && <div className="alert error">{err}</div>}

        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <label className="field">
            <span>Имейл</span>
            <div className="input">
              <i className="i i-mail" aria-hidden />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Парола</span>
            <div className="input">
              <i className="i i-lock" aria-hidden />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="eye"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Скрий парола" : "Покажи парола"}
                title={showPwd ? "Скрий парола" : "Покажи парола"}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <button className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : "Влез"}
          </button>
        </form>
      </div>
    </div>
  );
}
