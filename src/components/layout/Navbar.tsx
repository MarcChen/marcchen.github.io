"use client";

import { useEffect, useCallback, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Globe, Palette as PaletteIcon } from "lucide-react";
import type { EnabledSection } from "@/lib/data";
import type { Author } from "@/lib/types";
import { locales, localeNames, localePath, type Locale, t } from "@/lib/i18n";
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

// Brick & Sand is the default; "espresso" is the alternative palette (temporary, for review).
function subscribePalette(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette"] });
  return () => mo.disconnect();
}
const paletteSnapshot = (): Palette => (document.documentElement.dataset.palette === "espresso" ? "espresso" : "brick");
const paletteServer = (): Palette => "brick";

function getSystemScheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getRenderedScheme(): "light" | "dark" {
  const content = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content?.trim();
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
 * Three-part header: name (left) · Portfolio / Blog / Photos (centre) ·
 * small language, theme and palette buttons (right).
 */
export default function Navbar({ locale, siteName }: NavbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const palette = useSyncExternalStore(subscribePalette, paletteSnapshot, paletteServer);
  const pathname = usePathname() || "/";

  const homeHref = localePath(locale, "/");
  const blogHref = localePath(locale, "/blog/");
  const photosHref = localePath(locale, "/photos/");
  const strip = (p: string) => p.replace(/\/+$/, "");
  const inSection = (base: string) => strip(pathname).startsWith(strip(base)) && strip(base) !== "";
  const current = inSection(blogHref) ? "blog" : inSection(photosHref) ? "photos" : "home";
  // Path of this page in another language (falls back to that language's home).
  const pathFor = (loc: Locale) => {
    const rest = strip(pathname).replace(/^\/(fr|zh-cn)(?=\/|$)/, "") || "/";
    return localePath(loc, rest.endsWith("/") ? rest : `${rest}/`);
  };

  useEffect(() => {
    document.documentElement.lang = locale === "zh-cn" ? "zh-CN" : locale;
  }, [locale]);

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

  // Close the language menu on outside click / Escape.
  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLangOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

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

  const togglePalette = useCallback(() => {
    const next: Palette = paletteSnapshot() === "brick" ? "espresso" : "brick";
    if (next === "espresso") document.documentElement.dataset.palette = "espresso";
    else delete document.documentElement.dataset.palette;
    try {
      if (next === "espresso") localStorage.setItem(PALETTE_STORAGE_KEY, next);
      else localStorage.removeItem(PALETTE_STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  }, []);

  const links = [
    { key: "home", href: homeHref, label: t(locale, "nav_portfolio") },
    { key: "blog", href: blogHref, label: t(locale, "blog_nav") },
    { key: "photos", href: photosHref, label: t(locale, "photos_nav") },
  ];

  return (
    <header className={styles.bar}>
      <div className={`container ${styles.row}`}>
        <Link href={homeHref} className={styles.name}>
          {siteName}
        </Link>

        <nav className={styles.links} aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={styles.link}
              aria-current={current === l.key ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.tools}>
          <div className={styles.lang} ref={langRef}>
            <button
              type="button"
              className={styles.tool}
              aria-label={t(locale, "switch_language")}
              aria-expanded={langOpen}
              aria-haspopup="menu"
              onClick={() => setLangOpen((o) => !o)}
            >
              <Globe size={16} aria-hidden="true" />
              <span className={styles.code}>{locale === "zh-cn" ? "中" : locale.toUpperCase()}</span>
            </button>
            {langOpen && (
              <div className={styles.menu} role="menu">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    role="menuitem"
                    href={pathFor(loc)}
                    lang={loc === "zh-cn" ? "zh-CN" : loc}
                    aria-current={loc === locale ? "true" : undefined}
                    onClick={() => setLangOpen(false)}
                  >
                    {localeNames[loc]}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button type="button" className={styles.tool} onClick={toggleTheme} aria-label={t(locale, "toggle_theme")}>
            {theme === "light" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className={styles.tool}
            onClick={togglePalette}
            aria-label={`${t(locale, "palette")}: ${t(locale, palette === "brick" ? "palette_brick" : "palette_espresso")}`}
            title={`${t(locale, "palette")}: ${t(locale, palette === "brick" ? "palette_brick" : "palette_espresso")}`}
          >
            <PaletteIcon size={16} aria-hidden="true" />
            <i className={styles.swatch} data-swatch={palette} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
