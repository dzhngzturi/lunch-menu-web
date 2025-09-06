// src/components/RequireRole.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth";

export default function RequireRole({ roles = [], children }) {
  const { user } = useAuth();
  const location = useLocation();

  // ако още няма user (или не е логнат) – пази поведение на RequireAuth
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // пусни само ако ролята е разрешена
  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
