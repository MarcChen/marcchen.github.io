"use client";

import { useState } from "react";
import type { SkillsSection } from "@/lib/types";
import { t, tn, type Locale } from "@/lib/i18n";
import SectionHead from "@/components/sections/SectionHead";

interface SkillsProps {
  locale: Locale;
  data: SkillsSection;
}

const CATEGORY_KEY: Record<string, string> = {
  basic: "cat_basic",
  programming_language: "cat_programming_language",
  cloud_services: "cat_cloud_services",
};

export default function Skills({ locale, data }: SkillsProps) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all"
      ? data.skills
      : data.skills.filter((skill) => skill.categories.includes(active));

  const categoryNames = (categories: string[]) =>
    categories
      .map((category) => t(locale, CATEGORY_KEY[category] ?? category))
      .join(", ");

  return (
    <section id={data.section.id} className="section section--tone1">
      <div className="shell">
        <SectionHead title={t(locale, "skills_title")} />

        <div className="skills-bar">
          <div
            className="filter-list"
            role="group"
            aria-label={t(locale, "skills_title")}
          >
            {data.buttons.map((button) => (
              <button
                key={button.filter}
                type="button"
                className="filter-btn"
                aria-pressed={active === button.filter}
                onClick={() => setActive(button.filter)}
              >
                {button.filter === "all"
                  ? button.name
                  : t(locale, CATEGORY_KEY[button.filter] ?? button.name)}
              </button>
            ))}
          </div>
          <p className="filter-count" aria-live="polite">
            {tn(locale, "skills_entries", filtered.length)}
          </p>
        </div>

        <ul className="skills-index">
          {filtered.map((skill) => (
            <li className="skill" key={skill.name}>
              <p className="skill-cat">{categoryNames(skill.categories)}</p>
              <p className="skill-name">
                {skill.url ? (
                  <a href={skill.url} target="_blank" rel="noopener noreferrer">
                    {skill.name}
                  </a>
                ) : (
                  skill.name
                )}
              </p>
              <p className="skill-note">{skill.summary}</p>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="skill-empty">{t(locale, "skills_empty")}</li>
          )}
        </ul>
      </div>
    </section>
  );
}
