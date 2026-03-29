"use client";

import { useState } from "react";
import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { SkillsSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import styles from "@/styles/components/Skills.module.css";

interface SkillsProps {
  locale: Locale;
  data: SkillsSection;
  alternate?: boolean;
}

export default function Skills({ data, alternate }: SkillsProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? data.skills
      : data.skills.filter((s) => s.categories.includes(activeFilter));

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <h2 className="section-title">{data.section.name}</h2>

      <div className={styles.filterBar}>
        {data.buttons.map((btn) => (
          <button
            key={btn.filter}
            className={`${styles.filterBtn} ${activeFilter === btn.filter ? styles.active : ""}`}
            onClick={() => setActiveFilter(btn.filter)}
          >
            {btn.name}
          </button>
        ))}
      </div>

      <div className={styles.skillsGrid}>
        {filtered.map((skill) => {
          const Wrapper = skill.url ? "a" : "div";
          const wrapperProps = skill.url
            ? {
                href: skill.url,
                target: "_blank" as const,
                rel: "noopener noreferrer",
              }
            : {};

          return (
            <Wrapper
              key={skill.name}
              className={styles.skillCard}
              {...wrapperProps}
            >
              <Image
                src={skill.logo}
                alt={skill.name}
                width={48}
                height={48}
                className={styles.skillLogo}
              />
              <div className={styles.skillInfo}>
                <h3 className={styles.skillName}>{skill.name}</h3>
                <p className={styles.skillSummary}>{skill.summary}</p>
                <div className={styles.skillCategories}>
                  {skill.categories.map((cat) => (
                    <span key={cat} className="tag">
                      {cat.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </Wrapper>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
