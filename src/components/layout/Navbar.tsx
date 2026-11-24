"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Globe, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { EnabledSection } from "@/lib/data";
import { locales, localeNames, localeFlags, type Locale, t } from "@/lib/i18n";
import styles from "@/styles/components/Navbar.module.css";

function getStoredColorScheme(): "light" | "dark" | null {
  try {
    const stored =
      localStorage.getItem("color-scheme") ?? localStorage.getItem("theme-scheme");
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function applyColorScheme(stored: "light" | "dark" | null) {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (meta) {
    meta.content = stored ?? "light dark";
  }
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = stored ?? (systemDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", resolved);
}

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
  const prefersReducedMotion = useReducedMotion();

  const SCROLL_THRESHOLD = 80;
  const SECTION_DETECT_BUFFER = 200;

  const pathname = usePathname();
  const router = useRouter();
  
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  const navSections = sections.filter((s) => s.showOnNavbar);

  // Sync color-scheme meta & data-theme with stored override, OS changes, and other tabs
  useEffect(() => {
    applyColorScheme(getStoredColorScheme());

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      if (!getStoredColorScheme()) {
        applyColorScheme(null);
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "color-scheme" || e.key === "theme-scheme" || e.key === null) {
        applyColorScheme(getStoredColorScheme());
      }
    };

    mql.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      mql.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const stored = getStoredColorScheme();
    const systemScheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const rendered = stored ?? systemScheme;
    const target = rendered === "dark" ? "light" : "dark";
    const nextStored = target === systemScheme ? null : target;

    try {
      if (nextStored) {
        localStorage.setItem("color-scheme", nextStored);
      } else {
        localStorage.removeItem("color-scheme");
      }
      localStorage.removeItem("theme-scheme");
    } catch {
      // Still apply theme even if storage is blocked
    }
    applyColorScheme(nextStored);
  }, []);

  // Close menus on Escape
  useEffect(() => {
    if (!isMobileOpen && !isLangOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
        setIsLangOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, isLangOpen]);

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
        el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    } else {
      router.push(`/${locale}#${id}`);
    }
  };

  return (
    <>
      <motion.header
        className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}
        initial={prefersReducedMotion ? false : { y: -100 }}
        animate={{ y: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 100, damping: 20 }
        }
      >
        <div className={styles.navContainer}>
          <div className={styles.pillContainer}>
            <Link href={`/${locale}/`} className={styles.logo}>
              <div className={styles.logoDot} aria-hidden="true" />
              {siteName}
            </Link>

            {/* Desktop Links */}
            <nav className={styles.desktopNav} aria-label="Primary">
              {navSections.map((section) => (
                <button
                  type="button"
                  key={section.id}
                  className={`${styles.navLink} ${activeSection === section.id ? styles.active : ""}`}
                  onClick={() => scrollToSection(section.id)}
                  aria-current={activeSection === section.id ? "true" : undefined}
                >
                  {activeSection === section.id && (
                    <motion.span
                      layoutId={prefersReducedMotion ? undefined : "activePill"}
                      className={styles.activePillBackground}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", bounce: 0.2, duration: 0.6 }
                      }
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
              <div
                className={styles.langContainer}
                onMouseLeave={() => setIsLangOpen(false)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsLangOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  className={styles.iconBtn}
                  onMouseEnter={() => setIsLangOpen(true)}
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  aria-label={t(locale, "switch_language")}
                  aria-expanded={isLangOpen}
                  aria-haspopup="menu"
                >
                  <Globe size={18} aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      role="menu"
                      className={styles.langDropdown}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    >
                      {locales.map((loc) => (
                        <Link
                          key={loc}
                          role="menuitem"
                          href={`/${loc}/`}
                          className={`${styles.langOption} ${loc === locale ? styles.activeLang : ""}`}
                          onClick={() => setIsLangOpen(false)}
                        >
                          <span className={styles.flag} aria-hidden="true">{localeFlags[loc]}</span>
                          {localeNames[loc]}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                className={styles.iconBtn}
                onClick={toggleTheme}
              >
                <span className={styles.themeOptionDark}>
                  <Sun size={18} aria-hidden="true" />
                  <span className="visually-hidden">Switch to light theme</span>
                </span>
                <span className={styles.themeOptionLight}>
                  <Moon size={18} aria-hidden="true" />
                  <span className="visually-hidden">Switch to dark theme</span>
                </span>
              </button>

              {/* Mobile Toggle */}
              <button
                type="button"
                className={styles.mobileToggle}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label={isMobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileOpen}
                aria-controls="mobile-nav-menu"
              >
                {isMobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className={styles.mobileMenu}
            initial={prefersReducedMotion ? false : { opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          >
            <motion.div 
              className={styles.mobileMenuInner}
              initial={prefersReducedMotion ? false : { y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.1 }}
            >
              {navSections.map((section) => (
                <button
                  type="button"
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
