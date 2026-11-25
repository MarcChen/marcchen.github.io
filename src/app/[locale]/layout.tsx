import type { Metadata } from "next";
import { locales, isValidLocale, localePath, type Locale } from "@/lib/i18n";
import { getAuthor, getSiteConfig } from "@/lib/data";
import LocaleShell from "@/components/layout/LocaleShell";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const siteConfig = getSiteConfig(locale);
  const author = getAuthor(locale);
  const siteUrl = "https://marcchen.github.io";
  const canonicalUrl = `${siteUrl}${localePath(locale, "/")}`;

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

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  return <LocaleShell locale={locale}>{children}</LocaleShell>;
}
