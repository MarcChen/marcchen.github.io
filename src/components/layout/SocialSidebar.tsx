"use client";

import { motion } from "framer-motion";
import { Mail, Download, CalendarDays } from "lucide-react";
import { t } from "@/lib/i18n";
import { GithubIcon, LinkedinIcon } from "@/components/ui/Icons";
import type { Author } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import styles from "@/styles/components/SocialSidebar.module.css";

interface SocialSidebarProps {
  author: Author;
  locale: Locale;
}

export default function SocialSidebar({ author, locale }: SocialSidebarProps) {
  const links = [
    {
      id: "github",
      label: "GitHub",
      url: author.contactInfo.github ? `https://github.com/${author.contactInfo.github}` : "",
      icon: <GithubIcon size={20} />,
      external: true,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: author.contactInfo.linkedin ? `https://www.linkedin.com/in/${author.contactInfo.linkedin}` : "",
      icon: <LinkedinIcon size={20} />,
      external: true,
    },
    {
      id: "email",
      label: "Email",
      url: author.contactInfo.email ? `mailto:${author.contactInfo.email}` : "",
      icon: <Mail size={20} />,
      external: false,
    },
    {
      id: "book-call",
      label: t(locale, "book_a_call"),
      url: "https://cal.com/marc-chen",
      icon: <CalendarDays size={20} />,
      external: true,
    },
    {
      id: "download-cv",
      label: t(locale, "download_cv_short"),
      url: assetPath(locale === "zh-cn" ? "/files/MarcChen_s_Resume_CN.pdf" : "/files/MarcChen_s_Resume_ENG.pdf"),
      icon: <Download size={20} />,
      external: true,
    },
  ].filter((item) => Boolean(item.url));

  return (
    <aside className={styles.socialSidebar} aria-label="Social Links">
      <div className={styles.sidebarContent}>
        {links.map((link, idx) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + idx * 0.1, duration: 0.4 }}
            className={styles.iconWrapper}
          >
            <a
              href={link.url}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={styles.socialBtn}
              aria-label={link.label}
            >
              {link.icon}
              <span className={styles.tooltip}>{link.label}</span>
            </a>
          </motion.div>
        ))}
      </div>
      <div className={styles.sidebarLine} />
    </aside>
  );
}
