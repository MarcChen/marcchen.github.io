"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import type { EnabledSection } from "@/lib/data";
import { locales, localeNames, localeFlags, type Locale } from "@/lib/i18n";
import styles from "@/styles/components/Navbar.module.css";

interface NavbarProps {
  locale: Locale;
  sections: EnabledSection[];
  siteName: string;
}

export default function Navbar({ locale, sections, siteName }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Track scroll position
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme-scheme") || "system";
    let resolved: "light" | "dark" = "light";
    if (stored === "dark") resolved = "dark";
    else if (stored === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme-scheme", next);
  }, [theme]);

  const scrollToSection = useCallback(
    (id: string) => {
      setIsMobileOpen(false);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    },
    []
  );

  const navSections = sections.filter((s) => s.showOnNavbar);

  return (
    <>
      <nav
        className={`${styles.navbar} ${isScrolled ? styles.solid : styles.transparent}`}
      >
        <div className={styles.navContent}>
          <Link href={`/${locale}/`} className={styles.logo}>
            {siteName}
          </Link>

          {/* Desktop nav links */}
          <ul className={styles.navLinks}>
            {navSections.map((section) => (
              <li key={section.id}>
                <button
                  className={styles.navLink}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.name}
                </button>
              </li>
            ))}
            <li>
              <Link
                href={`/${locale}/blog/`}
                className={styles.navLink}
              >
                Blog
              </Link>
            </li>
          </ul>

          <div className={styles.navActions}>
            {/* Language Switcher */}
            <div className={styles.langSwitcher}>
              <button
                className={styles.langBtn}
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Switch language"
              >
                <span>{localeFlags[locale]}</span>
                <ChevronDown size={14} />
              </button>
              {isLangOpen && (
                <div className={styles.langDropdown}>
                  {locales.map((loc) => (
                    <Link
                      key={loc}
                      href={`/${loc}/`}
                      className={`${styles.langOption} ${loc === locale ? styles.activeLang : ""}`}
                      onClick={() => setIsLangOpen(false)}
                    >
                      <span>{localeFlags[loc]}</span>
                      <span>{localeNames[loc]}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              className={styles.themeBtn}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className={styles.menuToggle}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`${styles.mobileMenu} ${isMobileOpen ? styles.open : ""}`}
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
          Blog
        </Link>
        <div className={styles.mobileDivider} />
        <div className={styles.mobileActions}>
          {locales.map((loc) => (
            <Link
              key={loc}
              href={`/${loc}/`}
              className={`${styles.langOption} ${loc === locale ? styles.activeLang : ""}`}
              onClick={() => setIsMobileOpen(false)}
            >
              {localeFlags[loc]} {localeNames[loc]}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
