// src/pages/PublicMenu.jsx
import { useEffect, useMemo, useState } from "react";
import { getCategories, getDishes } from "../api";
import PageHero from "../components/PageHero";
import { motion, easeOut } from "framer-motion";
import Select from "react-select";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Link, useSearchParams } from "react-router-dom";
import CatSlider from "../components/CatSlider";

// ВАЖНО: helper за снимки
import { buildStorageUrl } from "../api";

/* --------- Галерия с категории (картички със снимка) --------- */
function CategoryGallery({ cats, onPick, getImg }) {
  return (
    <div className="cats-grid">
      {cats.map((c) => (
        <button
          key={c.id}
          className="cat-card"
          onClick={() => onPick(c.id)}
          aria-label={`Категория ${c.name}`}
        >
          <div className="cat-thumb-wrap">
            {getImg(c) ? (
              <img className="cat-thumb" src={getImg(c)} alt={c.name} />
            ) : (
              <div className="cat-thumb noimg">•</div>
            )}
          </div>

          <div className="cat-title-box">
            <span className="cat-title">{c.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* --------- Таблична категория --------- */
function TableCategory({ items, columns }) {
  const table = useReactTable({
    data: items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="menu-table-wrapper">
      <table className="menu-table">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className={h.column.columnDef?.meta?.align === "right" ? "a-right" : ""}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cell.column.columnDef?.meta?.align === "right" ? "a-right" : ""}
                >
                  {flexRender(
                    cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------- Страница ------------------------- */
export default function PublicMenu() {
  const [cats, setCats] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState(null);               // null => само галерия с категории
  const [menuFilter, setMenuFilter] = useState("regular");  // "regular" | "lunch"

  const [searchParams, setSearchParams] = useSearchParams();

  // ⬇️ централизирано изграждане на URL за снимка
  const getImg = (obj) => obj?.image_url ?? buildStorageUrl(obj?.image);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    Promise.all([getCategories(), getDishes({ menu_type: menuFilter })])
      .then(([c, d]) => {
        if (ignore) return;
        setCats(c.data?.data ?? []);
        setDishes(d.data?.data ?? []);
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [menuFilter]);

  // кои категории да са в таблица (имената вече са lower-case)
  const tableCatIds = useMemo(() => {
    const raw = import.meta.env.VITE_TABLE_CAT_IDS || "";
    return raw.split(",").map((s) => Number(s.trim())).filter(Boolean);
  }, []);

  const isTableCategory = (cat) => {
    if (tableCatIds.length && tableCatIds.includes(Number(cat.id))) return true;
    const name = (cat?.name || "").toLowerCase();
    return /напит|безалкохол|уиски|водка|ракия|бири/.test(name);
  };

  // групиране: категория -> артикули
  const grouped = useMemo(
    () =>
      cats
        .map((c) => ({
          ...c,
          items: dishes.filter((x) => Number(x.category_id) === Number(c.id)),
        }))
        .filter((c) => c.items.length > 0),
    [cats, dishes]
  );

  // категории за галерията (само такива, в които има артикули за текущия филтър)
  const catsForGallery = useMemo(() => grouped.map(({ items, ...c }) => c), [grouped]);

  // видими категории (само избраната)
  const visibleCats = useMemo(() => {
    if (openId == null) return [];
    const one = grouped.find((c) => Number(c.id) === Number(openId));
    return one ? [one] : [];
  }, [grouped, openId]);

  // react-select (ще е видим само когато има избрана категория)
  const catOptions = useMemo(() => {
    const base = [{ value: "", label: "Всички категории" }];
    return base.concat(grouped.map((c) => ({ value: String(c.id), label: c.name })));
  }, [grouped]);

  const currentCat = useMemo(() => {
    if (openId == null) return catOptions[0];
    return catOptions.find((o) => o.value === String(openId)) || catOptions[0];
  }, [openId, catOptions]);

  // react-select стил
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 12,
      borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
      boxShadow: "none",
      ":hover": { borderColor: state.isFocused ? "#2563eb" : "#9ca3af" },
    }),
    valueContainer: (b) => ({ ...b, padding: "6px 12px" }),
    menu: (b) => ({ ...b, zIndex: 40, borderRadius: 12, overflow: "hidden" }),
    option: (base, state) => ({
      ...base,
      padding: "10px 12px",
      backgroundColor: state.isSelected ? "#e0e7ff" : state.isFocused ? "#f3f4f6" : "white",
      color: "#111827",
      cursor: "pointer",
    }),
    singleValue: (b) => ({ ...b, fontWeight: 500 }),
  };

  // таблица – колони
  const tableColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Продукт",
        cell: ({ row }) => (
          <div>
            <strong>{row.original.name}</strong>
            {row.original.description && <div className="muted">{row.original.description}</div>}
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Цена",
        cell: ({ getValue }) => `${Number(getValue() ?? 0).toFixed(2)} лв.`,
        meta: { align: "right" },
      },
    ],
    []
  );

  // синхронизиране с query (?type=lunch)
  useEffect(() => {
    const next = searchParams.get("type") === "lunch" ? "lunch" : "regular";
    setMenuFilter((prev) => (prev !== next ? next : prev));
  }, [searchParams]);

  const applyFilter = (type) => {
    setMenuFilter(type);
    setOpenId(null); // връщаме към галерията при смяна на филтъра
    if (type === "lunch") setSearchParams({ type: "lunch" }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  // options за слайдера (вече имаш catOptions от useMemo)
  const sliderOptions = catOptions.slice(1); // без „Всички“

  return (
    <>
      <PageHero
        title="Меню"
        subtitle="Всичко, което предлагаме"
        image="/banners/review.jpeg"
        height="min(46vh, 860px)"
        bgPosition="center 40%" 
      />

      <div className="container section">
        {/* Филтри regular / lunch – стоят винаги */}
        <div className="menu-cards">
          <motion.div
            className={`menu-card ${menuFilter === "regular" ? "active" : ""}`}
            onClick={() => applyFilter("regular")}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: easeOut }}
          >
            <h3>🍽 Всички продукти</h3>
            <p>Вижте пълното меню</p>
          </motion.div>

          <motion.div
            className={`menu-card ${menuFilter === "lunch" ? "active" : ""}`}
            onClick={() => applyFilter("lunch")}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: easeOut }}
          >
            <h3>🕛 Обедно меню</h3>
            <p>Специални предложения за обяд</p>
          </motion.div>
        </div>

        {/* === ПЪРВИ ЕКРАН: САМО КАТЕГОРИИ === */}
        {openId == null && (
          <>
            {loading ? (
              <p className="muted" style={{ textAlign: "center", marginTop: 12 }}>
                Зареждане…
              </p>
            ) : catsForGallery.length === 0 ? (
              <p style={{ textAlign: "center", opacity: 0.7, marginTop: 8 }}>
                Няма категории за показване.
              </p>
            ) : (
              <CategoryGallery cats={catsForGallery} onPick={(id) => setOpenId(id)} getImg={getImg} />
            )}
            <div style={{ height: 8 }} />
          </>
        )}

        {/* === СЛЕД ИЗБОР НА КАТЕГОРИЯ === */}
        {openId != null && (
          <>
            <div className="pills pills-scroll">
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenId(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                ← Обратно към категориите
              </a>
              {grouped.map((c) => (
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

            <div className="cat-picker">
              {/* десктоп: select */}
              <div className="only-desktop">
                <Select
                  classNamePrefix="rs"
                  styles={selectStyles}
                  options={catOptions}
                  value={currentCat}
                  onChange={(opt) => setOpenId(opt?.value ? Number(opt.value) : null)}
                  isSearchable
                  isClearable
                  placeholder="Избери категория..."
                  menuPortalTarget={document.body}
                />
              </div>

              {/* мобилен: хоризонтален слайдер */}
              <div className="only-mobile">
                <CatSlider
                  options={sliderOptions}
                  activeId={openId}
                  onPick={(id) => {
                    setOpenId(id);
                    if (id != null) {
                      const el = document.getElementById(`c-${id}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                />
              </div>
            </div>

            {loading ? (
              <p className="muted" style={{ textAlign: "center", marginTop: 12 }}>
                Зареждане…
              </p>
            ) : visibleCats.length === 0 ? (
              <p style={{ textAlign: "center", opacity: 0.7, marginTop: 8 }}>
                Няма продукти за показване.
              </p>
            ) : (
              visibleCats.map((cat) => (
                <section key={cat.id} id={`c-${cat.id}`} className="section">
                  <div className="cat-header">
                    <h2 style={{ textAlign: "center", marginTop: 24 }}>{cat.name}</h2>
                  </div>

                  {isTableCategory(cat) ? (
                    <TableCategory items={cat.items} columns={tableColumns} />
                  ) : (
                    <div className="cards-grid">
                      {cat.items.map((item) => {
                        const imgSrc = getImg(item);
                        return (
                          <Link key={item.id} to={`/menu/dish/${item.id}`} className="dish-card">
                            <div className="dish-media">
                              {imgSrc && (
                                <img
                                  src={imgSrc}
                                  alt={item.name}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              )}
                            </div>
                            <div className="dish-body">
                              <h3 className="dish-title">{item.name}</h3>
                              {item.description && <p className="dish-desc">{item.description}</p>}
                              <div className="dish-footer">
                                <span className="price">{Number(item.price).toFixed(2)} лв.</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}
