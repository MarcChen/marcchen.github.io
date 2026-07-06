"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Globe, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { EnabledSection } from "@/lib/data";
import { locales, localeNames, localeFlags, type Locale, t } from "@/lib/i18n";
import styles from "@/styles/components/Navbar.module.css";

interface NavbarProps {
  locale: Locale;
  sections: EnabledSection[];
  siteName: string;
}

export default function Navbar({ locale, sections, siteName }: NavbarProps) {
  const [activeSection, setActiveSection] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const SCROLL_THRESHOLD = 80;
  const SECTION_DETECT_BUFFER = 200;

  const pathname = usePathname();
  const router = useRouter();
  
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  const navSections = sections.filter((s) => s.showOnNavbar);

  // Initialize theme 
  useEffect(() => {
    const stored = localStorage.getItem("theme-scheme");
    let initialTheme: "light" | "dark" = "dark";
    if (stored === "light") initialTheme = "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme-scheme", next);
  }, [theme]);

  // Handle scroll detection for active section and minimised nav
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);

      // Simple active section detection
      let current = "";
      for (const section of navSections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= SECTION_DETECT_BUFFER && rect.bottom >= 200) {
            current = section.id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navSections]);

  const scrollToSection = (id: string) => {
    setIsMobileOpen(false);
    if (isHomePage) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(`/${locale}#${id}`);
    }
  };

  return (
    <>
      <motion.header
        className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className={styles.navContainer}>
          <div className={styles.pillContainer}>
            <Link href={`/${locale}/`} className={styles.logo}>
              <div className={styles.logoDot} />
              {siteName}
            </Link>

            {/* Desktop Links */}
            <nav className={styles.desktopNav}>
              {navSections.map((section) => (
                <button
                  key={section.id}
                  className={`${styles.navLink} ${activeSection === section.id ? styles.active : ""}`}
                  onClick={() => scrollToSection(section.id)}
                  aria-current={activeSection === section.id ? "true" : undefined}
                >
                  {activeSection === section.id && (
                    <motion.span
                      layoutId="activePill"
                      className={styles.activePillBackground}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={styles.linkText}>{section.name}</span>
                </button>
              ))}
              <Link
                href={`/${locale}/blog/`}
                className={styles.navLink}
              >
                <span className={styles.linkText}>{t(locale, "blog_nav")}</span>
              </Link>
              <Link
                href={`/${locale}/photos/`}
                className={styles.navLink}
              >
                <span className={styles.linkText}>{t(locale, "photos_nav")}</span>
              </Link>
            </nav>

            <div className={styles.actions}>
              {/* Language Switcher */}
              <div className={styles.langContainer} onMouseLeave={() => setIsLangOpen(false)}>
                <button
                  className={styles.iconBtn}
                  onMouseEnter={() => setIsLangOpen(true)}
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  aria-label={t(locale, "switch_language")}
                >
                  <Globe size={18} />
                </button>
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      className={styles.langDropdown}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {locales.map((loc) => (
                        <Link
                          key={loc}
                          href={`/${loc}/`}
                          className={`${styles.langOption} ${loc === locale ? styles.activeLang : ""}`}
                          onClick={() => setIsLangOpen(false)}
                        >
                          <span className={styles.flag}>{localeFlags[loc]}</span>
                          {localeNames[loc]}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <button
                className={styles.iconBtn}
                onClick={toggleTheme}
                aria-label={t(locale, "toggle_theme")}
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Mobile Toggle */}
              <button
                className={styles.mobileToggle}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
              >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className={styles.mobileMenuInner}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {navSections.map((section) => (
                <button
                  key={section.id}
                  className={styles.mobileNavLink}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.name}
                </button>
              ))}
              <Link
                href={`/${locale}/blog/`}
                className={styles.mobileNavLink}
                onClick={() => setIsMobileOpen(false)}
              >
                {t(locale, "blog_nav")}
              </Link>
              <Link
                href={`/${locale}/photos/`}
                className={styles.mobileNavLink}
                onClick={() => setIsMobileOpen(false)}
              >
                {t(locale, "photos_nav")}
              </Link>

              <div className={styles.mobileDivider} />
              
              <div className={styles.mobileLangSelector}>
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}/`}
                    className={`${styles.mobileLangOption} ${loc === locale ? styles.activeLangMobile : ""}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {localeFlags[loc]} {localeNames[loc]}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
