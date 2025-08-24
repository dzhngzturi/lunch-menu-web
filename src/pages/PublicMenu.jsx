import { useEffect, useMemo, useState } from "react";
import { getCategories, getDishes } from "../api";
import PageHero from "../components/PageHero";

export default function PublicMenu() {
  const [cats, setCats] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [openId, setOpenId] = useState(null); // ← избраната категория (null = нищо)

  useEffect(() => {
    Promise.all([
      getCategories(),
      getDishes({ menu_type: "regular" }) // regular + both
    ]).then(([c, d]) => {
      const catsArr = c.data?.data ?? [];
      setCats(catsArr);
      setDishes(d.data?.data ?? []);

      // ако искаш първата да е избрана по подразбиране:
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

  const selectedCat = useMemo(
    () => grouped.find(c => Number(c.id) === Number(openId)) || null,
    [grouped, openId]
  );

  return (
    <>
      <PageHero
        title="Меню"
        subtitle="Всичко, което предлагаме"
        image="/banners/menu.jpg"
        height="min(46vh, 360px)"
      />

      <div className="container section">
        {/* ПИЛЧЕТА – на десктоп */}
        <div className="pills pills-scroll">
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

        {/* ДРОПДАУН – на мобилно */}
        <div className="cat-picker">
          <select
            value={openId ?? ""}
            onChange={(e) => setOpenId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- Изберете категория --</option>
            {grouped.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Ако няма избрана категория */}
        {!selectedCat && (
          <p style={{ textAlign: "center", opacity: .7, marginTop: 8 }}>
            Моля, изберете категория отгоре.
          </p>
        )}

        {/* Избраната категория */}
        {selectedCat && (
          <section id={`c-${selectedCat.id}`} className="section">
            <h2 style={{ textAlign: "center" }}>{selectedCat.name}</h2>

            {isTableCategory(selectedCat) ? (
              /* ===== Таблица за напитки ===== */
              <div className="menu-table-wrapper">
                <table className="menu-table">
                  <thead>
                    <tr>
                      <th>Продукт</th>
                      <th className="right">Цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCat.items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                          {item.description && (
                            <div className="muted">{item.description}</div>
                          )}
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
                {selectedCat.items.map(item => (
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
        )}
      </div>
    </>
  );
}
