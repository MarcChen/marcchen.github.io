import Image from "next/image";
import type { AboutSection, Author } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import SectionHead from "@/components/sections/SectionHead";

interface AboutProps {
  locale: Locale;
  data: AboutSection;
  author: Author;
  current?: {
    designation: string;
    company: { name: string; url: string };
    location: string;
  };
}

const CV_BY_LOCALE: Record<Locale, string> = {
  en: "/files/MarcChen_s_Resume_ENG.pdf",
  fr: "/files/MarcChen_s_Resume.pdf",
  "zh-cn": "/files/MarcChen_s_Resume_CN.pdf",
};

const LANGUAGE_BADGE =
  /french|français|anglais|english|chinese|chineese|chinois|法语|英语|中文/i;

function cleanDesignation(value: string): string {
  return value
    .trim()
    .replace(/Enginner/g, "Engineer")
    .replace(/\s+-\s+/g, ", ");
}

export default function About({
  locale,
  data,
  author,
  current,
}: AboutProps) {
  const paragraphs = data.summary
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const certifications = data.badges.filter(
    (badge) => badge.type === "certification"
  );
  const softSkills = data.badges.filter(
    (badge) => badge.type === "soft-skill-indicator"
  );
  const languages = softSkills.filter((badge) =>
    LANGUAGE_BADGE.test(badge.name)
  );
  const traits = softSkills.filter(
    (badge) => !LANGUAGE_BADGE.test(badge.name)
  );

  const portraitPath = author.image.replace(/\.png$/i, ".webp");
  const portrait = assetPath(
    portraitPath.startsWith("/") ? portraitPath : `/${portraitPath}`
  );

  return (
    <section id={data.section.id} className="section">
      <div className="shell">
        <SectionHead title={t(locale, "about_title")} />

        <div className="about-grid">
          <div className="about-main">
            <p className="about-designation">
              {cleanDesignation(data.designation)}
            </p>
            <p className="about-statement">{t(locale, "about_statement")}</p>

            <div className="about-summary">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>

            <div className="about-links">
              <a
                href={assetPath(CV_BY_LOCALE[locale])}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(locale, "my_resume")}
              </a>
              <a href={`mailto:${author.contactInfo.email}`}>
                {author.contactInfo.email}
              </a>
            </div>

            <figure className="about-figure">
              <div className="about-figure-media">
                <Image
                  src={assetPath("/images/posts/bike-images/mont-st-michel.JPG")}
                  alt={t(locale, "about_photo_caption")}
                  fill
                  sizes="(max-width: 960px) 100vw, 55vw"
                />
              </div>
              <figcaption>{t(locale, "about_photo_caption")}</figcaption>
            </figure>
          </div>

          <aside className="about-rail">
            <div className="about-portrait">
              <Image
                src={portrait}
                alt={t(locale, "about_portrait_alt")}
                fill
                sizes="(max-width: 760px) 300px, 380px"
              />
            </div>

            <div className="about-facts">
              {current && (
                <div className="about-fact">
                  <p className="meta">{t(locale, "hero_currently")}</p>
                  <div className="about-fact-list">
                    <span>{current.designation}</span>
                    <a
                      href={current.company.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {current.company.name}
                    </a>
                    <span>{current.location}</span>
                  </div>
                </div>
              )}

              <div className="about-fact">
                <p className="meta">{t(locale, "about_certified")}</p>
                <div className="about-fact-list">
                  {certifications.map((badge) =>
                    badge.url ? (
                      <a
                        key={badge.name}
                        href={badge.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {badge.name}
                      </a>
                    ) : (
                      <span key={badge.name}>{badge.name}</span>
                    )
                  )}
                </div>
              </div>

              <div className="about-fact">
                <p className="meta">{t(locale, "about_languages")}</p>
                <div className="about-fact-list">
                  {languages.map((badge) => (
                    <span key={badge.name}>{badge.name}</span>
                  ))}
                </div>
              </div>

              <div className="about-fact">
                <p className="meta">{t(locale, "about_also")}</p>
                <p className="about-also">
                  {traits.length > 0
                    ? traits.map((badge) => badge.name).join(", ") +
                      (locale === "zh-cn" ? "。" : ". ")
                    : ""}
                  {t(locale, "about_also_value")}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
