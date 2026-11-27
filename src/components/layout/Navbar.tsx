"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sun, Moon, Download } from "lucide-react";
import type { EnabledSection } from "@/lib/data";
import type { Author } from "@/lib/types";
import { locales, localeNames, localePath, defaultLocale, type Locale, t } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import { cloudinaryUrl } from "@/lib/cloudinary";
import styles from "@/styles/components/Navbar.module.css";

interface NavbarProps {
  locale: Locale;
  sections: EnabledSection[];
  siteName: string;
  author: Author;
}

const COLOR_SCHEME_STORAGE_KEY = "color-scheme";
const PALETTE_STORAGE_KEY = "palette";
type Palette = "espresso" | "brick";

/** Current palette, read from <html data-palette> (set before paint in layout). */
function subscribePalette(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette"] });
  return () => mo.disconnect();
}
const paletteSnapshot = (): Palette => (document.documentElement.dataset.palette === "brick" ? "brick" : "espresso");
const paletteServer = (): Palette => "espresso";

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

/**
 * Header: name + CV + "Index" button. The Index opens a full-screen menu with
 * the sections in large type, contact, language, theme and palette controls.
 */
export default function Navbar({ locale, sections, siteName, author }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const palette = useSyncExternalStore(subscribePalette, paletteSnapshot, paletteServer);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const homeHref = localePath(locale, "/");
  const isHomePage =
    pathname === homeHref ||
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    (locale === defaultLocale && pathname === "");
  const navSections = sections.filter((s) => s.showOnNavbar);
  const cvHref = assetPath(
    locale === "zh-cn" ? "/files/MarcChen_s_Resume_CN.pdf" : "/files/MarcChen_s_Resume_ENG.pdf"
  );

  useEffect(() => {
    document.documentElement.lang = locale === "zh-cn" ? "zh-CN" : locale;
  }, [locale]);

  // Theme state follows <meta name="color-scheme">, the OS, and other tabs.
  useEffect(() => {
    const sync = () => setTheme(getRenderedScheme());
    sync();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== COLOR_SCHEME_STORAGE_KEY) return;
      const v = e.newValue;
      setMetaColorScheme(v === "light" || v === "dark" ? v : "light dark");
      sync();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const target = getRenderedScheme() === "dark" ? "light" : "dark";
    try {
      if (target === getSystemScheme()) {
        localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
        localStorage.removeItem("theme-scheme");
      } else {
        localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, target);
      }
    } catch {
      // storage unavailable
    }
    setMetaColorScheme(target === getSystemScheme() ? "light dark" : target);
    setTheme(target);
  }, []);

  const choosePalette = useCallback((p: Palette) => {
    if (p === "brick") document.documentElement.dataset.palette = "brick";
    else delete document.documentElement.dataset.palette;
    try {
      if (p === "brick") localStorage.setItem(PALETTE_STORAGE_KEY, p);
      else localStorage.removeItem(PALETTE_STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  }, []);

  // Menu: lock scroll, close on Escape, return focus to the button.
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const firstLink = menuRef.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const btn = buttonRef.current;
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      btn?.focus({ preventScroll: true });
    };
  }, [open]);

  const close = () => setOpen(false);
  const sectionHref = (id: string) => (isHomePage ? `#${id}` : `${homeHref}#${id}`);
  const items = [
    ...navSections.map((s) => ({ key: s.id, label: s.name, href: sectionHref(s.id) })),
    { key: "blog", label: t(locale, "blog_nav"), href: localePath(locale, "/blog/") },
    { key: "photos", label: t(locale, "photos_nav"), href: localePath(locale, "/photos/") },
  ];

  return (
    <>
      <header className={`${styles.bar} ${open ? styles.isOpen : ""}`}>
        <div className={`container ${styles.row}`}>
          <Link href={homeHref} className={styles.name} onClick={close}>
            {siteName}
          </Link>
          <div className={styles.right}>
            <a href={cvHref} className={styles.cv} target="_blank" rel="noopener noreferrer">
              <Download size={15} aria-hidden="true" />
              <span>CV</span>
            </a>
            <button
              ref={buttonRef}
              type="button"
              className={styles.menuBtn}
              aria-expanded={open}
              aria-controls="site-index"
              onClick={() => setOpen((o) => !o)}
            >
              <span className={styles.burger} aria-hidden="true">
                <i />
                <i />
              </span>
              <span>{open ? t(locale, "index_close") : t(locale, "index_open")}</span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-index"
        ref={menuRef}
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav className={styles.list} aria-label="Index">
          <ol>
            {items.map((item, i) => (
              <li key={item.key} style={{ ["--i" as string]: i }}>
                <Link href={item.href} onClick={close}>
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <aside className={styles.aside}>
          <Image
            src={cloudinaryUrl("/images/author/marc.png")}
            alt={siteName}
            width={112}
            height={112}
            className={styles.avatar}
          />
          <p className={styles.who}>
            {t(locale, "hero_role")}
            {author.contactInfo.email && (
              <>
                <br />
                <a href={`mailto:${author.contactInfo.email}`}>{author.contactInfo.email}</a>
              </>
            )}
          </p>
          <div className={styles.ctaRow}>
            <a href="https://cal.com/marc-chen" className={styles.pillLight} target="_blank" rel="noopener noreferrer">
              {t(locale, "book_a_call")}
            </a>
            {author.contactInfo.linkedin && (
              <a
                href={`https://www.linkedin.com/in/${author.contactInfo.linkedin}`}
                className={styles.pill}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            )}
            {author.contactInfo.github && (
              <a
                href={`https://github.com/${author.contactInfo.github}`}
                className={styles.pill}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            )}
          </div>

          <div className={styles.controls}>
            <div className={styles.control}>
              <span>{t(locale, "language")}</span>
              <div className={styles.seg}>
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={localePath(loc, "/")}
                    lang={loc === "zh-cn" ? "zh-CN" : loc}
                    aria-current={loc === locale ? "true" : undefined}
                    onClick={close}
                  >
                    {localeNames[loc]}
                  </Link>
                ))}
              </div>
            </div>
            <div className={styles.control}>
              <span>{t(locale, "theme_label")}</span>
              <button type="button" className={styles.iconToggle} onClick={toggleTheme} aria-label={t(locale, "toggle_theme")}>
                {theme === "light" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
              </button>
            </div>
            <div className={styles.control}>
              <span>{t(locale, "palette")}</span>
              <div className={styles.seg} role="group" aria-label={t(locale, "palette")}>
                {(["espresso", "brick"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={palette === p}
                    onClick={() => choosePalette(p)}
                  >
                    <i className={styles.swatch} data-swatch={p} aria-hidden="true" />
                    {t(locale, p === "brick" ? "palette_brick" : "palette_espresso")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
