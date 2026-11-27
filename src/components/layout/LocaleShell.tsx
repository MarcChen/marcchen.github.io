import { t, type Locale } from "@/lib/i18n";
import { getAuthor, getEnabledSections } from "@/lib/data";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SocialSidebar from "@/components/layout/SocialSidebar";

interface LocaleShellProps {
  locale: Locale;
  children: React.ReactNode;
}

export default function LocaleShell({ locale, children }: LocaleShellProps) {
  const author = getAuthor(locale);
  const sections = getEnabledSections(locale);

  return (
    <>
      <a href="#main-content" className="skip-link visually-hidden">
        {t(locale, "skip_to_content")}
      </a>
      <Navbar locale={locale} sections={sections} siteName={author.name} author={author} />
      <SocialSidebar author={author} locale={locale} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer locale={locale} author={author} sections={sections} />
    </>
  );
}
