"use client";

import { useState } from "react";
import { Copy, Check, Plus, ArrowUpRight } from "lucide-react";
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

export default function Footer({ locale, author, sections }: FooterProps) {
  const year = new Date().getFullYear();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(author.contactInfo.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGlow} />

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
                  <button 
                    type="button"
                    onClick={handleCopyEmail}
                    className="btn btn-primary"
                    aria-label={t(locale, "copy_email")}
                  >
                    <span>{author.contactInfo.email}</span>
                    {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                  </button>
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
            {/* Abstract visual in CTA card */}
            <div className={styles.ctaVisual}>
              <div className={styles.ctaBlob} />
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
              Engineered with <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className={styles.metaLink}>Next.js <ArrowUpRight size={12} aria-hidden="true"/></a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
