import type { Metadata } from "next";
import { locales, isValidLocale, t, type Locale } from "@/lib/i18n";
import { getAuthor, getSiteConfig, getEnabledSections } from "@/lib/data";
import { localeHtmlLang } from "@/lib/i18n";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DocumentLang from "@/components/layout/DocumentLang";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const siteConfig = getSiteConfig(locale);
  const author = getAuthor(locale);
  const siteUrl = "https://marcchen.github.io";
  const canonicalUrl = `${siteUrl}/${locale}/`;

  const ogLocaleMap: Record<Locale, string> = {
    en: "en_US",
    fr: "fr_FR",
    "zh-cn": "zh_CN",
  };

  return {
    title: `${author.name} — Data Engineer & AI/ML Engineer`,
    description: siteConfig.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteUrl}/en/`,
        fr: `${siteUrl}/fr/`,
        "zh-CN": `${siteUrl}/zh-cn/`,
      },
    },
    openGraph: {
      title: `${author.name} — Data Engineer & AI/ML Engineer`,
      description: siteConfig.description,
      url: canonicalUrl,
      siteName: author.name,
      locale: ogLocaleMap[locale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} — Data Engineer & AI/ML Engineer`,
      description: siteConfig.description,
    },
  };
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const author = getAuthor(locale);

  return (
    <div lang={localeHtmlLang[locale]}>
      <DocumentLang locale={locale} />
      <a className="skip-link" href="#main">
        {t(locale, "skip_to_content")}
      </a>
      <div id="top" />
      <Navbar
        locale={locale}
        siteName={author.name}
        email={author.contactInfo.email}
      />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer locale={locale} author={author} />
    </div>
  );
}
