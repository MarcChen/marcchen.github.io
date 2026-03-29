import { locales, isValidLocale, type Locale } from "@/lib/i18n";
import { getAuthor, getEnabledSections } from "@/lib/data";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const author = getAuthor(locale);
  const sections = getEnabledSections(locale);

  return (
    <>
      <Navbar
        locale={locale}
        sections={sections}
        siteName={author.name}
      />
      <main>{children}</main>
      <Footer locale={locale} author={author} sections={sections} />
    </>
  );
}
