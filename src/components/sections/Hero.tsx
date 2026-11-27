import dynamic from "next/dynamic";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowDown, Download } from "lucide-react";
import type { Author } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import { cloudinaryUrl } from "@/lib/cloudinary";
import styles from "@/styles/components/Hero.module.css";

// three.js is loaded only on the client, after first paint.
const RideScene = dynamic(() => import("@/components/three/RideScene"));

interface HeroProps {
  locale: Locale;
  author: Author;
}

const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/** Intro: name, role, short bio and CV, beside the 3D ride scene and avatar.
 *  All entrance motion is CSS, so the content is readable before hydration. */
export default function Hero({ locale, author }: HeroProps) {
  const [first, ...rest] = author.name.split(" ");
  const cvHref = assetPath(
    locale === "zh-cn" ? "/files/MarcChen_s_Resume_CN.pdf" : "/files/MarcChen_s_Resume_ENG.pdf"
  );

  return (
    <section className={styles.hero} aria-labelledby="hero-name">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <h1 id="hero-name" className={styles.name}>
            <span className={styles.line}>
              <span style={delay(0.1)}>{first}</span>
            </span>
            <span className={styles.line}>
              <span style={delay(0.2)}>{rest.join(" ")}</span>
            </span>
          </h1>
          <p className={`${styles.role} ${styles.rise}`} style={delay(0.45)}>
            {t(locale, "hero_role")}
          </p>
          <p className={`${styles.bio} ${styles.rise}`} style={delay(0.55)}>
            {t(locale, "hero_bio")}
          </p>
          <div className={`${styles.actions} ${styles.rise}`} style={delay(0.65)}>
            <a href={cvHref} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              <Download size={16} aria-hidden="true" />
              {t(locale, "download_cv")}
            </a>
            <a href="#experiences" className="btn btn-outline">
              <ArrowDown size={16} aria-hidden="true" />
              {t(locale, "see_experience")}
            </a>
          </div>
        </div>

        <div className={styles.visual}>
          <RideScene
            title={t(locale, "ride_title")}
            kmLabel={t(locale, "ride_km")}
            altLabel={t(locale, "ride_alt")}
          />
          <figure className={styles.avatar}>
            <Image
              src={cloudinaryUrl("/images/author/marc.png")}
              alt={author.name}
              width={220}
              height={220}
              priority
            />
          </figure>
          <p className="visually-hidden">{t(locale, "ride_label")}</p>
        </div>
      </div>
    </section>
  );
}
