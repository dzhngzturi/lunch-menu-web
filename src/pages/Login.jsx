import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { login } from "../api";

export default function Login() {
  const nav = useNavigate();
  const { state } = useLocation();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await login(email, password); // { token, user }
      localStorage.setItem("token", data.token);
      nav(state?.from?.pathname || "/admin", { replace: true });
    } catch {
      setErr("Невалидни данни за вход.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Админ вход</h1>
        <p className="auth-sub">Влезте, за да управлявате менюто.</p>

        {err && (
          <div className="alert error" role="alert">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <label className="field">
            <span>Имейл</span>
            <div className="input">
              <i className="i i-mail" aria-hidden />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                autoComplete="username"
                autoFocus
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

          <div className="login-row">
            <span className="spacer" />
          </div>

          <button className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <span className="spinner" aria-label="Зареждане" /> : "Влез"}
          </button>
        </form>
      </div>
    </div>
  );
}
