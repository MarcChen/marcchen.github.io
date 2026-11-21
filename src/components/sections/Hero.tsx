import type { Author } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import MarblingCanvas from "@/components/marbling/MarblingCanvas";

interface HeroProps {
  locale: Locale;
  author: Author;
}

export default function Hero({ locale, author }: HeroProps) {
  const [first, ...rest] = author.name.split(/\s+/);
  const lines = [first, rest.join(" ")].filter(Boolean);

  return (
    <section className="hero" aria-labelledby="hero-name">
      <MarblingCanvas variant="hero" interactive className="hero-canvas" />
      <div className="hero-scrim" aria-hidden="true" />

      <div className="hero-main">
        <div className="hero-inner">
          <div className="hero-col">
            <p className="hero-role">{t(locale, "hero_role")}</p>

            <h1 className="hero-name" id="hero-name" aria-label={author.name}>
              {lines.map((line, index) => (
                <span key={line}>
                  {index > 0 ? " " : null}
                  {line}
                </span>
              ))}
            </h1>

            <p className="hero-lede">{t(locale, "hero_lede")}</p>

            <dl className="hero-facts">
              <div className="hero-fact">
                <dt>{t(locale, "hero_currently")}</dt>
                <dd>{t(locale, "hero_currently_value")}</dd>
              </div>
              <div className="hero-fact">
                <dt>{t(locale, "hero_studied")}</dt>
                <dd>{t(locale, "hero_studied_value")}</dd>
              </div>
              <div className="hero-fact">
                <dt>{t(locale, "hero_elsewhere")}</dt>
                <dd>{t(locale, "hero_elsewhere_value")}</dd>
              </div>
            </dl>

            <div className="hero-actions">
              <a className="hero-primary" href="#projects">
                {t(locale, "hero_see_work")}
              </a>
              <a className="hero-secondary" href="#about">
                {t(locale, "hero_read_record")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-foot">
        <span>
          <b>{t(locale, "hero_place")}</b>
        </span>
      </div>
    </section>
  );
}
