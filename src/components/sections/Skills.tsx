"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
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
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [focusedSkill, setFocusedSkill] = useState<string | null>(null);

  const isSkillActive = (name: string) =>
    hoveredSkill === name || focusedSkill === name;

  const filtered =
    activeFilter === "all"
      ? data.skills
      : data.skills.filter((s) => s.categories.includes(activeFilter));

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <div className={styles.sectionHeader}>
        <span className="section-label">02. Capabilities</span>
        <AnimatedHeading title={data.section.name} />
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filterTrack}>
          {data.buttons.map((btn) => (
            <button
              key={btn.filter}
              className={`${styles.filterBtn} ${activeFilter === btn.filter ? styles.active : ""}`}
              onClick={() => setActiveFilter(btn.filter)}
            >
              {activeFilter === btn.filter && (
                <motion.div 
                  layoutId="activeFilter" 
                  className={styles.activeFilterBg} 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className={styles.filterText}>{btn.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.skillsCloud}>
        <AnimatePresence mode="popLayout">
          {filtered.map((skill, index) => {
            const Wrapper = skill.url ? "a" : "div";
            const wrapperProps = skill.url
              ? {
                  href: skill.url,
                  target: "_blank" as const,
                  rel: "noopener noreferrer",
                }
              : {};

            const isHovered = hoveredSkill === skill.name;
            const isDimmed = hoveredSkill && hoveredSkill !== skill.name;
            const isActive = isSkillActive(skill.name);

            return (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isDimmed ? 0.4 : 1, 
                  scale: isHovered ? 1.05 : 1,
                  filter: isDimmed ? "blur(2px)" : "blur(0px)" 
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={styles.skillItemWrapper}
                onHoverStart={() => setHoveredSkill(skill.name)}
                onHoverEnd={() => setHoveredSkill(null)}
              >
                <Wrapper
                  className={styles.skillPill}
                  tabIndex={0}
                  onFocus={() => setFocusedSkill(skill.name)}
                  onBlur={() => setFocusedSkill(null)}
                  {...wrapperProps}
                >
                  <div className={styles.skillIconWrapper}>
                    <Image
                      src={skill.logo}
                      alt={skill.name}
                      width={24}
                      height={24}
                      className={styles.skillLogo}
                    />
                  </div>
                  <span className={styles.skillName}>{skill.name}</span>
                </Wrapper>

                {/* Tooltip Card */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={styles.skillTooltip}
                    >
                      <h4 className={styles.tooltipTitle}>{skill.name}</h4>
                      <p className={styles.tooltipDesc}>{skill.summary}</p>
                      <div className={styles.tooltipTags}>
                         {skill.categories.map(cat => (
                           <span key={cat} className={styles.catDot}>{cat.replace("_", " ")}</span>
                         ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}
