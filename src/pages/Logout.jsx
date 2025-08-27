// src/pages/Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Изчистваме данните за сесията (ако ползваш други ключове – добави ги тук)
    const keys = ["token", "access_token", "refresh_token", "user"];
    try {
      keys.forEach(k => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    } catch {}

    // Редирект към началото (или "/login" ако предпочиташ)
    navigate("/", { replace: true });

    // По желание – твърд рефреш:
    // window.location.reload();
  }, [navigate]);

  return null; // няма UI – само чисти и пренасочва
}
