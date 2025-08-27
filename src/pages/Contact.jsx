import PageHero from "../components/PageHero";
import { MapPin, Phone, Clock } from "lucide-react";

export default function Contact() {
  return (
    <>
      <PageHero
        title="Контакти"
        subtitle="Ще се радваме да ви чуем"
        image="/banners/contact.jpg"
        height="min(46vh, 360px)"
      />

        {/* ТЪМНА ЛЕНТА */}
        <section className="contact-band full-bleed">
          <div className="contact-band__grid">
            {/* Адрес */}
            <div className="contact-band__item">
              <div className="contact-band__icon">
                <MapPin size={34} strokeWidth={2.2} />
              </div>
              <h3 className="contact-band__title">Адрес</h3>
              <p className="contact-band__text">
                улица „Цар Симеон I“ №1,<br />Бургас, България
              </p>
            </div>

            {/* Телефон */}
            <div className="contact-band__item">
              <div className="contact-band__icon">
                <Phone size={32} strokeWidth={2.2} />
              </div>
              <h3 className="contact-band__title">Телефон за връзка</h3>
              <p className="contact-band__text">087 820 0999</p>
              <p className="contact-band__text">За доставка: 087 620 0061</p>
            </div>

            {/* Работно време */}
            <div className="contact-band__item">
              <div className="contact-band__icon">
                <Clock size={32} strokeWidth={2.2} />
              </div>
              <h3 className="contact-band__title">Работно време</h3>
              <p className="contact-band__text">Понеделник – Неделя</p>
              <p className="contact-band__text">11:00 ч. – 23:00 ч.</p>
            </div>
          </div>
        </section>


      {/* Карта */}
     <section className="contact-map full-bleed">
      <iframe
        title="RELAX bar&dinner – карта"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=Burgas%20Bulgaria&output=embed"
      />
    </section>
    </>
  );
}
