import PageHero from "../components/PageHero";
import { MapPin, Phone, Clock } from "lucide-react";

export default function Contact() {
  return (
      <>
      <PageHero
          title="Контакти"
          subtitle="Ще се радваме да ви чуем"
          image="/banners/hero-contact.png"
          height="min(60vh, 520px)"   // по-високо за да се вижда по-добре
          focus="50% 25%"             // мръдни фокуса нагоре (x% y%)
          dark={0.40}                 // лек overlay
          bgPosition="center 36%" 
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
                улица „Хан Аспарух“ №34,<br />Тервел, България
              </p>
            </div>

            {/* Телефон */}
            <div className="contact-band__item">
              <div className="contact-band__icon">
                <Phone size={32} strokeWidth={2.2} />
              </div>
              <h3 className="contact-band__title">Телефон за връзка</h3>
              <p className="contact-band__text">+359 89 538 8692</p>
            </div>

            {/* Работно време */}
            <div className="contact-band__item">
              <div className="contact-band__icon">
                <Clock size={32} strokeWidth={2.2} />
              </div>
              <h3 className="contact-band__title">Работно време</h3>
              <p className="contact-band__text">Понеделник – Събота</p>
              <p className="contact-band__text">11:00 ч. – 00:00 ч.</p>
            </div>
          </div>
        </section>


      {/* Карта */}
     <section className="contact-map full-bleed">
      <iframe
        title="Bistro bar&dinner – карта"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1441.092078404526!2d27.407238820237115!3d43.748272446231965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a55fab10ca1e87%3A0x184124fe4784708!2sBistro%20Elit!5e0!3m2!1sbg!2sbg!4v1757946905986!5m2!1sbg!2sbg"
      />
    </section>
    </>
  );
}
