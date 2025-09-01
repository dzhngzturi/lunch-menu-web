// src/routes/RoleRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function RoleRoute({ roles = [], children }) {
  const location = useLocation();

  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}

  if (!user) {
    // пазим „откъде дойде“, за да се върне след login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
