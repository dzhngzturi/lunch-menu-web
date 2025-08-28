// src/pages/Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../js/apis"; // или "../api" според проекта

export default function Logout() {
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // POST /api/logout → 204 (инвалидира текущия токен на сървъра)
        await logout();
      } finally {
        // редирект към login (или "/" ако предпочиташ)
        nav("/login", { replace: true });
      }
    })();
  }, [nav]);

  return null;
}
