"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { SkillsSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cloudinaryUrl } from "@/lib/cloudinary";
import styles from "@/styles/components/Skills.module.css";

interface SkillsProps {
  locale: Locale;
  data: SkillsSection;
  alternate?: boolean;
}

/** Skills as a periodic table: one element per tool (symbol + real logo),
 *  fill = category. Hover, focus or tap shows the detail panel. */
export default function Skills({ data, alternate }: SkillsProps) {
  const categories = data.buttons.filter((b) => b.filter !== "all");
  const fillOf = (cat: string) => Math.max(0, categories.findIndex((c) => c.filter === cat)) % 3;
  const labelOf = (cat: string) => categories.find((c) => c.filter === cat)?.name ?? cat;

  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState("all");
  const skill = data.skills[active];

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <AnimatedHeading title={data.section.name} />

      <div className={styles.filters} role="group" aria-label={data.section.name}>
        {data.buttons.map((btn) => (
          <button
            key={btn.filter}
            type="button"
            aria-pressed={filter === btn.filter}
            onClick={() => setFilter(btn.filter)}
          >
            {btn.filter !== "all" && <i className={styles.key} data-fill={fillOf(btn.filter)} aria-hidden="true" />}
            {btn.name}
          </button>
        ))}
      </div>

      <div className={styles.table}>
        <ul className={styles.tiles}>
          {data.skills.map((s, i) => {
            const cat = s.categories[0];
            const dim = filter !== "all" && !s.categories.includes(filter);
            return (
              <li key={s.name}>
                <button
                  type="button"
                  className={`${styles.tile} ${i === active ? styles.on : ""} ${dim ? styles.dim : ""}`}
                  data-fill={fillOf(cat)}
                  aria-pressed={i === active}
                  aria-controls="skill-detail"
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <span className={styles.no}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.logo}>
                    <Image src={cloudinaryUrl(s.logo)} alt="" width={22} height={22} />
                  </span>
                  <span className={styles.sym}>{s.symbol ?? s.name.slice(0, 2)}</span>
                  <span className={styles.nm}>{s.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {skill && (
          <aside id="skill-detail" className={styles.detail} aria-live="polite">
            <div className={styles.detailTop}>
              <span className={styles.detailSym}>{skill.symbol ?? skill.name.slice(0, 2)}</span>
              <span className={styles.detailLogo}>
                <Image src={cloudinaryUrl(skill.logo)} alt="" width={56} height={56} />
              </span>
            </div>
            <h3 className={styles.detailName}>{skill.name}</h3>
            <span className={styles.cat}>{labelOf(skill.categories[0])}</span>
            <p className={styles.summary}>{skill.summary}</p>
            {skill.url && (
              <a href={skill.url} target="_blank" rel="noopener noreferrer" className={styles.more}>
                {new URL(skill.url).hostname.replace(/^www\./, "")}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </aside>
        )}
      </div>
    </SectionWrapper>
  );
}
