import { useState } from "react";
import PageHero from "../components/PageHero";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: прати до бекенд/имейл услуга
    alert("Благодарим! Ще се свържем скоро.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <>
    <PageHero
      title="Контакти"
      subtitle="Ще се радваме да ви чуем"
      image="/banners/contact.jpg"
      height="min(46vh, 360px)"
    />

      <div className="contact-grid">
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>Име *</label>
            <input
              required
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Вашето име"
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Имейл *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder="+359 …"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Съобщение *</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => onChange("message", e.target.value)}
              placeholder="Как можем да помогнем?"
            />
          </div>

          <button className="btn btn-primary" type="submit">Изпрати</button>
        </form>

        <aside className="contact-info">
          <h3>Къде сме</h3>
          <p>ул. Пример 1, София</p>
          <p>Тел: +359 88 123 4567</p>
          <p>Имейл: hello@thepearl.bg</p>

          <h4>Работно време</h4>
          <ul className="hours">
            <li>Пон–Пет: 11:00 – 21:00</li>
            <li>Съб: 12:00 – 22:00</li>
            <li>Нед: почивен ден</li>
          </ul>

          <div className="map-embed">
            <iframe
              title="The Pearl Map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Sofia%20Bulgaria&output=embed"
            />
          </div>
        </aside>
      </div>
    </>
  );
}
