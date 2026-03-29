import Link from "next/link";
import { Mail, Calendar } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/Icons";
import type { Author } from "@/lib/types";
import type { EnabledSection } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import styles from "@/styles/components/Footer.module.css";

interface FooterProps {
  locale: Locale;
  author: Author;
  sections: EnabledSection[];
}

const iconMap: Record<string, React.ReactNode> = {
  email: <Mail size={16} />,
  github: <GithubIcon size={16} />,
  linkedin: <LinkedinIcon size={16} />,
  calendar: <Calendar size={16} />,
};

export default function Footer({ locale, author, sections }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerBrand}>
          <h3>{author.name}</h3>
          <p>{author.summary?.[0]}</p>

          <div className={styles.socialLinks}>
            {author.contactInfo.email && (
              <a
                href={`mailto:${author.contactInfo.email}`}
                className={styles.socialLink}
                aria-label="Email"
              >
                {iconMap.email}
              </a>
            )}
            {author.contactInfo.github && (
              <a
                href={`https://github.com/${author.contactInfo.github}`}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                {iconMap.github}
              </a>
            )}
            {author.contactInfo.linkedin && (
              <a
                href={`https://www.linkedin.com/in/${author.contactInfo.linkedin}`}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                {iconMap.linkedin}
              </a>
            )}
            <a
              href="https://cal.com/marc-chen"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Book a call"
            >
              {iconMap.calendar}
            </a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4>{t(locale, "navigation")}</h4>
          <ul className={styles.footerLinks}>
            {sections
              .filter((s) => s.showOnNavbar)
              .map((section) => (
                <li key={section.id}>
                  <Link href={`/${locale}/#${section.id}`}>
                    {section.name}
                  </Link>
                </li>
              ))}
            <li>
              <Link href={`/${locale}/blog/`}>Blog</Link>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>{t(locale, "contact_me")}</h4>
          <ul className={styles.footerLinks}>
            <li>
              <a href={`mailto:${author.contactInfo.email}`}>
                {author.contactInfo.email}
              </a>
            </li>
            <li>
              <a
                href={`https://github.com/${author.contactInfo.github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href={`https://www.linkedin.com/in/${author.contactInfo.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <span>© {year} {author.name}. All Rights Reserved.</span>
        <span>
          Built with{" "}
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
            Next.js
          </a>
        </span>
      </div>
    </footer>
  );
}
