export default function PageHero({
  title,
  subtitle,
  image,                   // напр. "/banners/menu.jpg"
  height = "min(52vh, 420px)",
  children,
  bgPosition = "center 65%",
}) {
  return (
    <section
      className="hero full-bleed"
      style={{ backgroundImage: `url(${image})`, height, backgroundPosition:bgPosition}}
    >
      <span className="hero-overlay" />
      <div className="hero-inner">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
