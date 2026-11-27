"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Plus, ArrowUpRight } from "lucide-react";
import type { Author } from "@/lib/types";
import type { EnabledSection } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import styles from "@/styles/components/Footer.module.css";
import AnimatedHeading from "@/components/ui/AnimatedHeading";

interface FooterProps {
  locale: Locale;
  author: Author;
  sections: EnabledSection[];
}

export default function Footer({ locale, author }: FooterProps) {
  const year = new Date().getFullYear();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const lastMessageRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const emailEl = document.getElementById("footer-email");
    const buttonEl = copyButtonRef.current;
    if (!emailEl || !buttonEl) return;

    const report = (ok: boolean) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      let message = ok ? t(locale, "copied") : t(locale, "copy_failed");
      if (message === lastMessageRef.current) message += "\u00A0";
      lastMessageRef.current = message;

      setCopyState(ok ? "copied" : "failed");
      setStatusMessage("");
      requestAnimationFrame(() => setStatusMessage(message));

      timerRef.current = setTimeout(() => {
        setCopyState("idle");
        setStatusMessage("");
      }, 2000);
    };

    const runCopy = async () => {
      const text = emailEl.innerText.trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        report(true);
      } catch {
        report(false);
      }
    };

    if ("CommandEvent" in window) {
      const handleCommand = (event: Event) => {
        const cmdEvent = event as Event & { command?: string; source?: Element | null };
        if (cmdEvent.command === "--copy" && cmdEvent.source === buttonEl) {
          void runCopy();
        }
      };
      document.addEventListener("command", handleCommand, true);
      return () => {
        document.removeEventListener("command", handleCommand, true);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      void runCopy();
    };
    buttonEl.addEventListener("click", handleClick);
    return () => {
      buttonEl.removeEventListener("click", handleClick);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [locale]);

  return (
    <footer className={styles.footer}>

      <div className="container">
        <div className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <AnimatedHeading
                title={t(locale, "cta_heading")}
                subtitle={t(locale, "cta_subheading")}
                className={styles.ctaHeadingOverride}
              />

              <div className={styles.actionRow}>
                {author.contactInfo.email && (
                  <span className={styles.copyWrapper}>
                    <button
                      ref={copyButtonRef}
                      type="button"
                      className="btn btn-primary"
                      data-copied={copyState === "copied" ? "" : undefined}
                      data-failed={copyState === "failed" ? "" : undefined}
                      {...({ command: "--copy", commandfor: "footer-email" } as Record<string, string>)}
                    >
                      <span id="footer-email">{author.contactInfo.email}</span>
                      {copyState === "copied" ? (
                        <Check size={16} aria-hidden="true" />
                      ) : (
                        <Copy size={16} aria-hidden="true" />
                      )}
                    </button>
                    <span
                      className={`${styles.copyTip} ${copyState !== "idle" ? styles.copyTipVisible : ""}`}
                      role="status"
                    >
                      {statusMessage}
                    </span>
                  </span>
                )}

                <a
                  href="https://cal.com/marc-chen"
                  className="btn btn-outline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Plus size={16} aria-hidden="true" />
                  <span>{t(locale, "book_a_call")}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerBrand}>
            <h3>{author.name}</h3>
            <p className="text-muted">{author.summary?.[0] || "Data & AI Engineer"}</p>
          </div>

          <div className={styles.footerMeta}>
            <span>© {year} {author.nickname}.</span>
            <span className={styles.separator}>—</span>
            <span>
              Engineered with{" "}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.metaLink}
              >
                Next.js <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
