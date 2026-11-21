import Link from "next/link";
import type { Author } from "@/lib/types";
import { localeNames, locales, t, type Locale } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import MarblingCanvas from "@/components/marbling/MarblingCanvas";

interface FooterProps {
  locale: Locale;
  author: Author;
}

export default function Footer({ locale, author }: FooterProps) {
  const year = new Date().getFullYear();
  const { email, github, linkedin } = author.contactInfo;

  return (
    <>
      <div className="marble-band" aria-hidden="true">
        <MarblingCanvas variant="band" />
      </div>

      <footer id="contact" className="site-footer">
        <div className="shell">
          <p className="foot-name">{author.name}</p>

          <div className="foot-cols">
            <div>
              <p className="foot-col-title">{t(locale, "footer_contact")}</p>
              <div className="foot-links">
                <a href={`mailto:${email}`}>{email}</a>
                <a
                  href={`https://github.com/${github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  href={`https://www.linkedin.com/in/${linkedin}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                <a
                  href="https://cal.com/marc-chen"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t(locale, "book_a_call")}
                </a>
              </div>
            </div>

            <div>
              <p className="foot-col-title">{t(locale, "footer_pages")}</p>
              <div className="foot-links">
                <Link href={`/${locale}/#about`}>{t(locale, "nav_about")}</Link>
                <Link href={`/${locale}/#experiences`}>
                  {t(locale, "experiences_title")}
                </Link>
                <Link href={`/${locale}/#projects`}>{t(locale, "nav_work")}</Link>
                <Link href={`/${locale}/blog/`}>{t(locale, "nav_writing")}</Link>
                <Link href={`/${locale}/photos/`}>
                  {t(locale, "nav_photographs")}
                </Link>
              </div>
            </div>

            <div>
              <p className="foot-col-title">{t(locale, "footer_elsewhere")}</p>
              <div className="foot-links">
                <a
                  href={assetPath("/files/MarcChen_s_Resume_ENG.pdf")}
                  target="_blank"
                  rel="noopener noreferrer"
                  hrefLang="en"
                >
                  {t(locale, "footer_cv_en")}
                </a>
                <a
                  href={assetPath("/files/MarcChen_s_Resume.pdf")}
                  target="_blank"
                  rel="noopener noreferrer"
                  hrefLang="fr"
                >
                  {t(locale, "footer_cv_fr")}
                </a>
                <a
                  href={assetPath("/files/MarcChen_s_Resume_CN.pdf")}
                  target="_blank"
                  rel="noopener noreferrer"
                  hrefLang="zh-CN"
                >
                  {t(locale, "footer_cv_zh")}
                </a>
              </div>
            </div>

            <div>
              <p className="foot-col-title">{t(locale, "footer_languages")}</p>
              <div className="foot-links">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}/`}
                    hrefLang={loc}
                    aria-current={loc === locale ? "true" : undefined}
                  >
                    {localeNames[loc]}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="foot-bottom">
            <span>
              <b>{t(locale, "footer_location")}</b>
            </span>
            <span>
              © {year} {author.name}
            </span>
            <a href="#top">{t(locale, "footer_top")}</a>
          </div>
        </div>
      </footer>
    </>
  );
}
