"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isValidLocale,
  localeNames,
  locales,
  t,
  type Locale,
} from "@/lib/i18n";
import MarblingCanvas from "@/components/marbling/MarblingCanvas";
import DocumentLang from "@/components/layout/DocumentLang";

export default function NotFound({ siteName }: { siteName: string }) {
  const pathname = usePathname() || "/";
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  const locale: Locale = isValidLocale(first) ? first : "en";

  useEffect(() => {
    document.title = `${t(locale, "notfound_label")} — ${siteName}`;
  }, [locale, siteName]);

  return (
    <div className="nf">
      <DocumentLang locale={locale} />
      <a className="skip-link" href="#main">
        {t(locale, "skip_to_content")}
      </a>

      <header className="nf-head">
        <Link className="nav-brand" href={`/${locale}/`}>
          {siteName}
        </Link>
        <div
          className="nav-lang"
          role="group"
          aria-label={t(locale, "switch_language")}
        >
          {locales.map((loc) => (
            <a
              key={loc}
              href={`/${loc}/`}
              hrefLang={loc}
              aria-current={loc === locale ? "true" : undefined}
            >
              {localeNames[loc]}
            </a>
          ))}
        </div>
      </header>

      <main className="nf-main" id="main" tabIndex={-1}>
        <div className="nf-inner">
          {/* Pure decoration: the numeral is drawn by .nf-label::before so it
              stays out of the text layer (it repeats the page title). */}
          <p className="nf-label" aria-hidden="true" />
          <h1 className="nf-title">{t(locale, "notfound_title")}</h1>
          <p className="nf-body">{t(locale, "notfound_body")}</p>

          <div className="nf-links">
            {locales.map((loc) => (
              <a key={loc} href={`/${loc}/`} hrefLang={loc}>
                {localeNames[loc]}
              </a>
            ))}
            <Link href={`/${locale}/blog/`}>
              {t(locale, "notfound_writing")}
            </Link>
          </div>
        </div>
      </main>

      <div className="nf-band" aria-hidden="true">
        <MarblingCanvas variant="band" />
      </div>
    </div>
  );
}
