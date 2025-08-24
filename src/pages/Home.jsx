// src/pages/Home.jsx
import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";        // банер-слайдерът отгоре
import LunchTeaser from "../components/LunchTeaser";  // НОВО: обедно меню като слайдер с карти
import Testimonials from "../components/Testimonials";

export default function Home() {
  // банер-кадри за горния Carousel
  const slides = [
    { src: "/banners/1.jpg", title: "Обедно меню всеки ден", caption: "Супи, основни и десерти" },
    { src: "/banners/2.jpg", title: "Пресни продукти",       caption: "Подбрани сезонни съставки" },
    { src: "/banners/1.jpg", title: "Уютна атмосфера",       caption: "Идеално за обедна почивка" },
  ];

  // отзиви за Testimonials
  const reviews = [
    {
      quote: "Мястото ни стана любимо — уютно, комфортно, обслужването е чудесно, кухнята вкусна и бърза.",
      author: "Анна Филимонова",
      bg: "/banners/review.jpeg",
    },
    {
      quote: "Идеално за обедна почивка. Поръчките пристигат бързо, всичко е прясно и вкусно!",
      author: "Даниела Петрова",
      bg: "/banners/review.jpeg",
    },
    {
      quote: "Организирахме няколко празника тук – винаги супер атмосфера и отлична храна.",
      author: "Николай Георгиев",
      bg: "/banners/review.jpeg",
    },
  ];

  return (
    <>
      {/* HERO банерът – остава както си беше */}
      <section className="hero home full-bleed">
        <span className="hero-overlay" />
        <div className="hero-inner">
          <h1 className="hero-title">Relax</h1>
          <p className="hero-subtitle">Bar and dinner.</p>
          <div className="cta-buttons">
            <Link to="/menu" className="btn btn-primary">Виж повече</Link>
          </div>
        </div>
      </section>

      {/* ГОРНИЯТ БАНЕР-СЛАЙДЕР – остава */}
      <section className="section">
        <Carousel
          images={slides}
          autoPlay
          showArrows
          showIndicators
          fullBleed
        />
      </section>

      {/* НОВО: Обедно меню като СЛАЙДЕР с карти (MultiCarousel вътрешно) */}
      {/* Ако искаш да се покажат всички ястия – махни limit проп-а */}
      <LunchTeaser  />

      {/* ОТЗИВИ – остават както си бяха */}
      <Testimonials
        items={reviews}
        fullBleed
        height="min(70vh, 620px)"
      />
    </>
  );
}
