"use client";

import { useEffect, useRef, useState } from "react";
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

/** Résumé-style ledger: one line per position (period, company, role).
 *  Hovering a line previews it open; clicking pins it open (click again to unpin).
 *  On touch screens a tap pins. */
export default function Experiences({ locale, data, alternate }: ExperiencesProps) {
  const rows = data.experiences.flatMap((exp, ei) =>
    exp.positions.map((pos, pi) => ({ key: `${ei}-${pi}`, company: exp.company, pos }))
  );
  const [pinned, setPinned] = useState<Set<string>>(() => new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const enterTimer = useRef<number | undefined>(undefined);
  const leaveTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(enterTimer.current);
      window.clearTimeout(leaveTimer.current);
    },
    []
  );

  const togglePin = (key: string) =>
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Small delays so lines don't flicker open while the pointer just passes over.
  const onEnter = (key: string, e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(leaveTimer.current);
    window.clearTimeout(enterTimer.current);
    enterTimer.current = window.setTimeout(() => setHovered(key), 220);
  };
  const onLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(enterTimer.current);
    leaveTimer.current = window.setTimeout(() => setHovered(null), 260);
  };

  const end = (e?: string) => (!e || /^(now|present)$/i.test(e.trim()) ? t(locale, "present") : e);

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <AnimatedHeading title={data.section.name} />
      <ol className={styles.ledger}>
        {rows.map(({ key, company, pos }) => {
          const isPinned = pinned.has(key);
          const isOpen = isPinned || hovered === key;
          const panelId = `exp-${key}`;
          return (
            <li
              key={key}
              className={`${styles.row} ${isOpen ? styles.open : ""} ${isPinned ? styles.pinned : ""}`}
              onPointerEnter={(e) => onEnter(key, e)}
              onPointerLeave={onLeave}
            >
              <button
                type="button"
                className={styles.head}
                aria-expanded={isPinned}
                aria-controls={panelId}
                onClick={() => togglePin(key)}
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
                <span className={styles.toggle} aria-hidden="true">
                  +
                  {isOpen && !isPinned && <span className={styles.hint}>{t(locale, "keep_open")}</span>}
                </span>
              </button>
              <div id={panelId} className={styles.body} role="region" aria-label={`${company.name}, ${pos.designation}`}>
                <div>
                  <div className={styles.inner}>
                    <span className={styles.location}>{company.location}</span>
                    <div>
                      {company.overview && <p className={styles.overview}>{company.overview}</p>}
                      <ul className={styles.points}>
                        {pos.responsibilities.map((r, i) => (
                          <li
                            key={i}
                            style={{ ["--i" as string]: i + 1 }}
                            dangerouslySetInnerHTML={{ __html: inlineMarkdown(r) }}
                          />
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
