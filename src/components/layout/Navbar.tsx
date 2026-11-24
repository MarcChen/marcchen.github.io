"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { EnabledSection } from "@/lib/data";
import { locales, localeNames, localeFlags, localePath, defaultLocale, type Locale, t } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import styles from "@/styles/components/Navbar.module.css";

interface NavbarProps {
  locale: Locale;
  sections: EnabledSection[];
  siteName: string;
}

const COLOR_SCHEME_STORAGE_KEY = "color-scheme";

function getSystemScheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getRenderedScheme(): "light" | "dark" {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  const content = meta?.content?.trim();
  if (content === "light" || content === "dark") return content;
  return getSystemScheme();
}

function setMetaColorScheme(value: "light dark" | "light" | "dark") {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "color-scheme";
    document.head.appendChild(meta);
  }
  meta.content = value;
}

export default function Navbar({ locale, sections, siteName }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [renderedTheme, setRenderedTheme] = useState<"light" | "dark">("dark");
  const navRef = useRef<HTMLElement>(null);
  const langPopoverRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const pathname = usePathname();
  const homeHref = localePath(locale, "/");
  const blogHref = localePath(locale, "/blog/");
  const photosHref = localePath(locale, "/photos/");
  const isHomePage =
    pathname === homeHref ||
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    (locale === defaultLocale && pathname === "");

  const isRouteActive = (segment: "/blog" | "/photos") => {
    const candidates = [localePath(locale, segment), `/${locale}${segment}`];
    return candidates.some(
      (base) => pathname === base || pathname.startsWith(`${base}/`)
    );
  };

  const navSections = useMemo(
    () => sections.filter((s) => s.showOnNavbar),
    [sections]
  );

  // Sync <html lang> on client-side locale navigation
  useEffect(() => {
    document.documentElement.lang = locale === "zh-cn" ? "zh-CN" : locale;
  }, [locale]);

  // Conditionally load Popover & CSS Anchor Positioning polyfills only when unsupported
  useEffect(() => {
    if (!Object.hasOwn(HTMLElement.prototype, "popover")) {
      void import("@oddbird/popover-polyfill");
    }
    if (!CSS.supports("anchor-name: --a")) {
      void import("@oddbird/css-anchor-positioning");
    }
  }, []);

  // Synchronize theme icon with <meta name="color-scheme">, OS changes, and other tabs
  useEffect(() => {
    const syncState = () => setRenderedTheme(getRenderedScheme());
    syncState();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", syncState);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== COLOR_SCHEME_STORAGE_KEY) return;
      const val = event.newValue;
      setMetaColorScheme(val === "light" || val === "dark" ? val : "light dark");
      syncState();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      mediaQuery.removeEventListener("change", syncState);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getRenderedScheme();
    const target: "light" | "dark" = current === "dark" ? "light" : "dark";
    const system = getSystemScheme();

    if (target === system) {
      try {
        localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
        localStorage.removeItem("theme-scheme");
      } catch {
        // Ignore storage restrictions
      }
      setMetaColorScheme("light dark");
    } else {
      try {
        localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, target);
      } catch {
        // Ignore storage restrictions
      }
      setMetaColorScheme(target);
    }
    setRenderedTheme(target);
  }, []);

  // Compact header state on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Native scroll-target-group aria-current sync + IntersectionObserver fallback
  useEffect(() => {
    if (!isHomePage || !navRef.current) return;
    const navEl = navRef.current;
    const fragmentLinks = Array.from(
      navEl.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    );
    if (fragmentLinks.length === 0) return;

    if (CSS.supports("scroll-target-group: auto")) {
      const syncAriaCurrent = () => {
        const currentLink = navEl.querySelector("a:target-current");
        fragmentLinks.forEach((link) => {
          link.setAttribute("aria-current", link === currentLink ? "true" : "false");
        });
      };
      syncAriaCurrent();
      document.addEventListener("scrollend", syncAriaCurrent, { passive: true });
      return () => {
        document.removeEventListener("scrollend", syncAriaCurrent);
      };
    }

    const sectionEls = navSections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            fragmentLinks.forEach((link) => {
              const isActive = link.getAttribute("href") === `#${id}`;
              link.classList.toggle("target-current", isActive);
              link.setAttribute("aria-current", isActive ? "true" : "false");
            });
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    sectionEls.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHomePage, navSections]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  const closeLangPopover = () => {
    const el = langPopoverRef.current as (HTMLDivElement & { hidePopover?: () => void }) | null;
    try {
      el?.hidePopover?.();
    } catch {
      // Popover already closed
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
            <Link href={homeHref} className={styles.logo}>
              <div className={styles.logoDot} aria-hidden="true" />
              {siteName}
            </Link>

            {/* Desktop Links */}
            <nav ref={navRef} className={styles.desktopNav} aria-label="Primary">
              {navSections.map((section) =>
                isHomePage ? (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={styles.navLink}
                  >
                    <span className={styles.linkText}>{section.name}</span>
                  </a>
                ) : (
                  <Link
                    key={section.id}
                    href={`${homeHref}#${section.id}`}
                    className={styles.navLink}
                  >
                    <span className={styles.linkText}>{section.name}</span>
                  </Link>
                )
              )}
              <Link
                href={blogHref}
                className={styles.navLink}
                aria-current={isRouteActive("/blog") ? "page" : undefined}
              >
                <span className={styles.linkText}>{t(locale, "blog_nav")}</span>
              </Link>
              <Link
                href={photosHref}
                className={styles.navLink}
                aria-current={isRouteActive("/photos") ? "page" : undefined}
              >
                <span className={styles.linkText}>{t(locale, "photos_nav")}</span>
              </Link>
            </nav>

            <div className={styles.actions}>
              {/* Language Switcher (Native Popover + CSS Anchor Positioning) */}
              <div className={styles.langContainer}>
                <button
                  type="button"
                  className={`${styles.iconBtn} ${styles.langTrigger}`}
                  aria-label={t(locale, "switch_language")}
                  {...({ popovertarget: "lang-switcher-popover" } as Record<string, string>)}
                >
                  <Globe size={18} aria-hidden="true" />
                </button>
                <div
                  ref={langPopoverRef}
                  id="lang-switcher-popover"
                  className={styles.langDropdown}
                  {...({ popover: "auto" } as Record<string, string>)}
                >
                  {locales.map((loc) => (
                    <Link
                      key={loc}
                      href={localePath(loc, "/")}
                      lang={loc === "zh-cn" ? "zh-CN" : loc}
                      className={`${styles.langOption} ${loc === locale ? styles.activeLang : ""}`}
                      aria-current={loc === locale ? "true" : undefined}
                      onClick={closeLangPopover}
                    >
                      <span className={styles.flag} aria-hidden="true">{localeFlags[loc]}</span>
                      {localeNames[loc]}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                className={styles.iconBtn}
                onClick={toggleTheme}
                aria-label={t(locale, "toggle_theme")}
              >
                {renderedTheme === "light" ? (
                  <Moon size={18} aria-hidden="true" />
                ) : (
                  <Sun size={18} aria-hidden="true" />
                )}
              </button>

              {/* Mobile Toggle */}
              <button
                type="button"
                className={styles.mobileToggle}
                onClick={() => setIsMobileOpen((prev) => !prev)}
                aria-label={t(locale, "toggle_menu")}
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
            className={styles.mobileMenu}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsMobileOpen(false);
            }}
          >
            <motion.nav
              aria-label="Mobile"
              className={styles.mobileMenuInner}
              initial={prefersReducedMotion ? false : { y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.08 }}
            >
              {navSections.map((section) =>
                isHomePage ? (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={styles.mobileNavLink}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {section.name}
                  </a>
                ) : (
                  <Link
                    key={section.id}
                    href={`${homeHref}#${section.id}`}
                    className={styles.mobileNavLink}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {section.name}
                  </Link>
                )
              )}
              <Link
                href={blogHref}
                className={styles.mobileNavLink}
                onClick={() => setIsMobileOpen(false)}
              >
                {t(locale, "blog_nav")}
              </Link>
              <Link
                href={photosHref}
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
                    href={localePath(loc, "/")}
                    lang={loc === "zh-cn" ? "zh-CN" : loc}
                    className={`${styles.mobileLangOption} ${loc === locale ? styles.activeLangMobile : ""}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span aria-hidden="true">{localeFlags[loc]}</span> {localeNames[loc]}
                  </Link>
                ))}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
