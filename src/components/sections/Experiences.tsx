"use client";

import { useState } from "react";
import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { ExperiencesSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { inlineMarkdown } from "@/lib/inline-md";
import styles from "@/styles/components/Timeline.module.css";

interface ExperiencesProps {
  locale: Locale;
  data: ExperiencesSection;
  alternate?: boolean;
}

/** Résumé-style ledger: one line per position (period, company, role); each
 *  line opens to the company overview and responsibilities. Latest is open. */
export default function Experiences({ locale, data, alternate }: ExperiencesProps) {
  const rows = data.experiences.flatMap((exp, ei) =>
    exp.positions.map((pos, pi) => ({ key: `${ei}-${pi}`, company: exp.company, pos }))
  );
  const [open, setOpen] = useState<Set<string>>(() => new Set(rows.length ? [rows[0].key] : []));

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const end = (e?: string) => (!e || /^(now|present)$/i.test(e.trim()) ? t(locale, "present") : e);

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <AnimatedHeading title={data.section.name} />
      <ol className={styles.ledger}>
        {rows.map(({ key, company, pos }) => {
          const isOpen = open.has(key);
          const panelId = `exp-${key}`;
          return (
            <li key={key} className={`${styles.row} ${isOpen ? styles.open : ""}`}>
              <button
                type="button"
                className={styles.head}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(key)}
              >
                <span className={styles.period}>
                  {pos.start} – {end(pos.end)}
                </span>
                <span className={styles.company}>
                  {company.logo && (
                    <span className={styles.logo}>
                      <Image src={cloudinaryUrl(company.logo)} alt="" width={28} height={28} />
                    </span>
                  )}
                  {company.name}
                </span>
                <span className={styles.role}>{pos.designation}</span>
                <span className={styles.toggle} aria-hidden="true">+</span>
              </button>
              <div id={panelId} className={styles.body} role="region" aria-label={`${company.name}, ${pos.designation}`}>
                <div>
                  <div className={styles.inner}>
                    <span className={styles.location}>{company.location}</span>
                    <div>
                      {company.overview && <p className={styles.overview}>{company.overview}</p>}
                      <ul className={styles.points}>
                        {pos.responsibilities.map((r, i) => (
                          <li key={i} dangerouslySetInnerHTML={{ __html: inlineMarkdown(r) }} />
                        ))}
                      </ul>
                      {company.url && (
                        <a href={company.url} className={styles.site} target="_blank" rel="noopener noreferrer">
                          {new URL(company.url).hostname.replace(/^www\./, "")} ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </SectionWrapper>
  );
}
