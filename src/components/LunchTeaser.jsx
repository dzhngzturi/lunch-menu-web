// src/components/LunchTeaser.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDishes, buildStorageUrl } from "../api";
import MultiCarousel from "./MultiCarousel";

export default function LunchTeaser() {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const res = await getDishes({ menu_type: "lunch" });
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      if (!ignore) setDishes(items);
    })();
    return () => { ignore = true; };
  }, []);

  const getImg = (d) => d?.image_url || (d?.image ? buildStorageUrl(d.image) : null);

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
        renderItem={(item) => {
          const img = getImg(item);
          return (
            <article className="dish-card">
              <div className="dish-media">
                {img && (
                  <img
                    src={img}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
              </div>
              <div className="dish-body">
                <h3 className="dish-title">{item.name}</h3>
                {item.description && <p className="dish-desc">{item.description}</p>}
                <div className="dish-footer">
                  <span className="price">{Number(item.price ?? 0).toFixed(2)} лв.</span>
                </div>
              </div>
            </article>
          );
        }}
      />

      <div style={{ textAlign: "center", margin: 22 }}>
        <Link to="/menu?type=lunch" className="btn btn-outline">Виж обедно меню</Link>
      </div>
    </section>
  );
}
