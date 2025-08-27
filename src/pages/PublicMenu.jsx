import { useEffect, useMemo, useState } from "react";
import { getCategories, getDishes } from "../api";
import PageHero from "../components/PageHero";

export default function PublicMenu() {
  const [cats, setCats] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [openId, setOpenId] = useState(null); // null = показвай всички

  useEffect(() => {
    Promise.all([
      getCategories(),
      getDishes({ menu_type: "regular" }) // regular + both
    ]).then(([c, d]) => {
      const catsArr = c.data?.data ?? [];
      setCats(catsArr);
      setDishes(d.data?.data ?? []);
      // ако искаш първата да е избрана:
      // if (catsArr.length) setOpenId(catsArr[0].id);
    });
  }, []);

  const storageUrl = useMemo(() => `${import.meta.env.VITE_API_URL}/storage/`, []);

  // ID-та за „таблични“ категории от .env (по избор)
  const tableCatIds = useMemo(() => {
    const raw = import.meta.env.VITE_TABLE_CAT_IDS || ""; // напр. "5,6"
    return raw.split(",").map(s => Number(s.trim())).filter(Boolean);
  }, []);

  const isTableCategory = (cat) => {
    if (tableCatIds.length && tableCatIds.includes(Number(cat.id))) return true;
    const name = (cat?.name || "").toLowerCase();
    return /напит/i.test(name) || /безалкохол/i.test(name);
  };

  const grouped = useMemo(() =>
    cats
      .map(c => ({
        ...c,
        items: dishes.filter(x => Number(x.category_id) === Number(c.id)),
      }))
      .filter(c => c.items.length > 0)
  , [cats, dishes]);

  // ВИДИМИ КАТЕГОРИИ: всички (openId=null) или само избраната
  const visibleCats = useMemo(() => {
    if (openId == null) return grouped;
    const one = grouped.find(c => Number(c.id) === Number(openId));
    return one ? [one] : [];
  }, [grouped, openId]);

  return (
    <>
      <PageHero
        title="Меню"
        subtitle="Всичко, което предлагаме"
        image="/banners/menu.jpg"
        height="min(46vh, 360px)"
      />

      <div className="container section">

        {/* ПИЛЧЕТА – desktop */}
        <div className="pills pills-scroll">
          <a
            href="#top"
            className={openId == null ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setOpenId(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Всички
          </a>

          {grouped.map(c => (
            <a
              key={c.id}
              href={`#c-${c.id}`}
              className={Number(openId) === Number(c.id) ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setOpenId(c.id);
                const el = document.getElementById(`c-${c.id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {c.name}
            </a>
          ))}
        </div>

        {/* ДРОПДАУН – mobile */}
        <div className="cat-picker">
          <select
            value={openId ?? ""}
            onChange={(e) => setOpenId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Всички категории</option>
            {grouped.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* ВИДИМИ КАТЕГОРИИ */}
        {visibleCats.length === 0 ? (
          <p style={{ textAlign: "center", opacity: .7, marginTop: 8 }}>
            Няма продукти за показване.
          </p>
        ) : (
          visibleCats.map(cat => (
            <section key={cat.id} id={`c-${cat.id}`} className="section">
              <h2 style={{ textAlign: "center" }}>{cat.name}</h2>

              {isTableCategory(cat) ? (
                /* ===== Таблица ===== */
                <div className="menu-table-wrapper">
                  <table className="menu-table">
                    <thead>
                      <tr>
                        <th>Продукт</th>
                        <th className="right">Цена</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map(item => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                            {item.description && <div className="muted">{item.description}</div>}
                          </td>
                          <td className="right">{Number(item.price).toFixed(2)} лв.</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* ===== Карти ===== */
                <div className="cards-grid">
                  {cat.items.map(item => (
                    <article key={item.id} className="dish-card">
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
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </>
  );
}
