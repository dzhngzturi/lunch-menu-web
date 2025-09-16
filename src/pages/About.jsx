import PageHero from "../components/PageHero";
import { Utensils, Heart, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      {/* HERO */}
      <PageHero
        title="За нас"
        subtitle="Домът на вкусната и уютна храна"
        image="/banners/hero-about.png"
        height="min(46vh, 860px)"
        bgPosition="center 40%" 
      />

      <div className="spacer" />

      {/* НАШАТА ИСТОРИЯ */}
      <section className="about-section">
        <div className="about-text">
          <h2>Нашата история</h2>
          <p>
            Bistro-elit bar&dinner е място, създадено с любов към храната и гостоприемството.
            От първия ден се стремим да комбинираме качествени продукти, уютна атмосфера
            и обслужване с усмивка. Менюто ни е вдъхновено от сезонни съставки и любими
            рецепти, които приготвяме всеки ден.
          </p>
          <p>
            Заповядайте при нас – за дневно меню, приятелска среща или празник с най-близките.
          </p>
        </div>

        <div className="about-image">
          <img src="/banners/3.png" alt="Нашият интериор" />
        </div>
      </section>

      {/* ДАРК ЛЕНТА С АКЦЕНТИ */}
        <section className="about-highlights full-bleed">
        <div className="container-narrow about-highlights__grid">
            <div className="highlight">
            <div className="icon"><Utensils size={36} /></div>
            <h3>Прясна кухня</h3>
            <p>Готвим всеки ден със сезонни продукти.</p>
            </div>
            <div className="highlight">
            <div className="icon"><Heart size={36} /></div>
            <h3>Топло обслужване</h3>
            <p>Грижа и внимание към всеки гост.</p>
            </div>
            <div className="highlight">
            <div className="icon"><Leaf size={36} /></div>
            <h3>Качествени съставки</h3>
            <p>Подбираме най-добрите местни продукти.</p>
            </div>
        </div>
        </section>

      {/* ЕКИП */}
      <section className="about-section reverse">
        <div className="about-text">
          <h2>Екипът зад BISTRO</h2>
          <p>
            Екипът ни е съставен от опитни готвачи и усмихнати сервитьори, които влагат
            сърце във всичко, което правят. Вярваме, че добрата храна започва с добър екип
            и отношение.
          </p>
        </div>
        <div className="about-image">
          <img src="/banners/about02.png" alt="Нашият екип" />
        </div>
      </section>

      {/* ЧИСЛА */}
      <section className="about-stats">
        <div><span>❤</span><p>Уютна атмосфера</p></div>
        <div><span>1000+</span><p>доволни гости</p></div>
        <div><span>50+</span><p>ястия в менюто</p></div>
        <div><span>5★</span><p>любими отзиви</p></div>
      </section>

      {/* CTA */}
    {/* CTA БАНЕР – FULL BLEED */}
    <section className="about-cta full-bleed">
    <div className="container-narrow about-cta__inner">
        <div className="cta-text">
        <h3>Заповядайте при нас</h3>
        <p>Резервирайте маса или ни пишете за специално събитие.</p>
        </div>
        <div className="cta-buttons">
        <a href="tel:+359895388692" className="btn primary">Обади се</a>
        <Link to="/contact" className="btn secondary">Контакти</Link>
        </div>
    </div>
    </section>


      <div className="spacer" />
    </>
  );
}
