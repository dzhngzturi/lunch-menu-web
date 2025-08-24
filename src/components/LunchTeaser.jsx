// src/components/LunchTeaser.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDishes } from "../api";
import MultiCarousel from "./MultiCarousel";

export default function LunchTeaser() {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    getDishes({ menu_type: "lunch" }).then(res => {
      setDishes(res.data?.data ?? []);
    });
  }, []);

  const storageUrl = useMemo(() => `${import.meta.env.VITE_API_URL}/storage/`, []);

  if (!dishes.length) return null;

  return (
    <section className="section">
      <div className="mc-head">
        <div className="mc-kicker">Обедно меню</div>
        <h2 className="mc-title">Свежи предложения всеки ден</h2>
        <div className="mc-rule" />
      </div>

      <MultiCarousel
        items={dishes}
        renderItem={(item) => (
          <article className="dish-card">
            <div className="dish-media">
              {item.image && <img src={storageUrl + item.image} alt={item.name} />}
            </div>
            <div className="dish-body">
              <h3 className="dish-title">{item.name}</h3>
              {item.description && <p className="dish-desc">{item.description}</p>}
              <div className="dish-footer">
                <span className="price">{Number(item.price).toFixed(2)} лв.</span>
              </div>
            </div>
          </article>
        )}
      />

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Link to="/menu" className="btn btn-outline">Виж цялото меню</Link>
      </div>
    </section>
  );
}
