"use client";

import Link from "next/link";
import { Copy, Plus, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/Icons";
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

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(author.contactInfo.email);
    // Could add a toast notification here
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGlow} />

      <div className="container">
        <div className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <AnimatedHeading 
                title="Let's build something great"
                subtitle="Open for new opportunities, consulting, and collaboration."
                className={styles.ctaHeadingOverride}
              />
              
              <div className={styles.actionRow}>
                {author.contactInfo.email && (
                  <button 
                    onClick={handleCopyEmail}
                    className="btn btn-primary"
                    aria-label="Copy Email"
                  >
                    <span>{author.contactInfo.email}</span>
                    <Copy size={16} />
                  </button>
                )}
                
                <a
                  href="https://cal.com/marc-chen"
                  className="btn btn-outline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Plus size={16} />
                  <span>Book a call</span>
                </a>
              </div>
            </div>
            {/* Abstract visual in CTA card */}
            <div className={styles.ctaVisual}>
              <div className={styles.ctaBlob} />
              <div className={styles.ctaGrid} />
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerBrand}>
            <h3>{author.name}</h3>
            <p className="text-muted">{author.summary?.[0] || "Data & AI Engineer"}</p>
          </div>

          <div className={styles.socialLinks}>
            {author.contactInfo.github && (
              <a
                href={`https://github.com/${author.contactInfo.github}`}
                className={styles.socialBtn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GithubIcon size={20} />
              </a>
            )}
            {author.contactInfo.linkedin && (
              <a
                href={`https://www.linkedin.com/in/${author.contactInfo.linkedin}`}
                className={styles.socialBtn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={20} />
              </a>
            )}
          </div>

          <div className={styles.footerMeta}>
            <span>© {year} {author.nickname}.</span>
            <span className={styles.separator}>—</span>
            <span>
              Engineered with <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className={styles.metaLink}>Next.js <ArrowUpRight size={12}/></a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
