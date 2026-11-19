"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  locales,
  localeLabels,
  localeNames,
  t,
  type Locale,
} from "@/lib/i18n";

interface NavbarProps {
  locale: Locale;
  siteName: string;
  email: string;
}

const SECTIONS = [
  { id: "about", key: "nav_about" },
  { id: "projects", key: "nav_work" },
] as const;

function swapLocale(pathname: string, locale: Locale): string {
  const clean = pathname.replace(/\/+$/, "");
  const parts = clean.split("/").filter(Boolean);
  const known = locales as readonly string[];
  if (parts.length > 0 && known.includes(parts[0])) {
    parts[0] = locale;
  } else {
    parts.unshift(locale);
  }
  return "/" + parts.join("/") + "/";
}

export default function Navbar({ locale, siteName, email }: NavbarProps) {
  const pathname = usePathname() || `/${locale}/`;
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isHome = pathname === `/${locale}/` || pathname === `/${locale}`;
  const onBlog = pathname.includes(`/${locale}/blog`);
  const onPhotos = pathname.includes(`/${locale}/photos`);

  // Solid bar once the hero is behind us; always solid off the home page.
  useEffect(() => {
    if (!isHome) {
      setSolid(true);
      return;
    }
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }, []);

  // Lock scrolling, move focus, close on Escape, trap Tab.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !menuRef.current) return;
      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeMenu]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 960) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sectionHref = (id: string) =>
    isHome ? `#${id}` : `/${locale}/#${id}`;

  return (
    <>
      <header
        className="site-nav"
        data-home={isHome ? "true" : "false"}
        data-solid={solid ? "true" : "false"}
      >
        <div className="nav-inner">
          <Link className="nav-brand" href={`/${locale}/`}>
            {siteName}
          </Link>

          <div className="nav-right">
            <nav
              className="nav-links"
              aria-label={t(locale, "nav_primary")}
            >
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  className="nav-link"
                  href={sectionHref(section.id)}
                >
                  {t(locale, section.key)}
                </a>
              ))}
              <Link
                className="nav-link"
                href={`/${locale}/blog/`}
                aria-current={onBlog ? "page" : undefined}
              >
                {t(locale, "nav_writing")}
              </Link>
              <Link
                className="nav-link"
                href={`/${locale}/photos/`}
                aria-current={onPhotos ? "page" : undefined}
              >
                {t(locale, "nav_photographs")}
              </Link>
              <a className="nav-link" href={sectionHref("contact")}>
                {t(locale, "nav_contact")}
              </a>
            </nav>

            <div
              className="nav-lang"
              aria-label={t(locale, "switch_language")}
            >
              {locales.map((loc) => (
                <Link
                  key={loc}
                  href={swapLocale(pathname, loc)}
                  aria-label={localeNames[loc]}
                  aria-current={loc === locale ? "true" : undefined}
                  hrefLang={loc}
                >
                  {localeLabels[loc]}
                </Link>
              ))}
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              className="nav-menu-btn"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              {t(locale, "nav_menu_open")}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t(locale, "nav_menu_open")}
        >
          <div className="mobile-head">
            <Link
              className="nav-brand"
              href={`/${locale}/`}
              onClick={() => setOpen(false)}
            >
              {siteName}
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              className="mobile-close"
              onClick={closeMenu}
            >
              {t(locale, "nav_menu_close")}
            </button>
          </div>

          <nav
            className="mobile-links"
            aria-label={t(locale, "nav_primary")}
          >
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                className="mobile-link"
                href={sectionHref(section.id)}
                onClick={() => setOpen(false)}
              >
                {t(locale, section.key)}
              </a>
            ))}
            <Link
              className="mobile-link"
              href={`/${locale}/blog/`}
              onClick={() => setOpen(false)}
            >
              {t(locale, "nav_writing")}
            </Link>
            <Link
              className="mobile-link"
              href={`/${locale}/photos/`}
              onClick={() => setOpen(false)}
            >
              {t(locale, "nav_photographs")}
            </Link>
            <a
              className="mobile-link"
              href={sectionHref("contact")}
              onClick={() => setOpen(false)}
            >
              {t(locale, "nav_contact")}
            </a>
          </nav>

          <div className="mobile-foot">
            <div className="mobile-langs">
              {locales.map((loc) => (
                <Link
                  key={loc}
                  href={swapLocale(pathname, loc)}
                  aria-current={loc === locale ? "true" : undefined}
                  hrefLang={loc}
                  onClick={() => setOpen(false)}
                >
                  {localeNames[loc]}
                </Link>
              ))}
            </div>
            <a className="mobile-contact" href={`mailto:${email}`}>
              {email}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
