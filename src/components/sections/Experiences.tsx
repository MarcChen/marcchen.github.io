"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { ExperiencesSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import styles from "@/styles/components/Timeline.module.css";

interface ExperiencesProps {
  locale: Locale;
  data: ExperiencesSection;
  alternate?: boolean;
}

export default function Experiences({
  locale,
  data,
  alternate,
}: ExperiencesProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // If no experiences, safely return
  if (!data?.experiences?.length) return null;

  const activeExp = data.experiences[activeIndex];

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <div className={styles.sectionHeader}>
        <span className="section-label">03. Career</span>
        <AnimatedHeading title={data.section.name} />
      </div>

      <div className={styles.splitLayout}>
        {/* Left Column: Company List */}
        <div className={styles.sidebar}>
          <div className={styles.timelineLine} />
          {data.experiences.map((exp, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                className={`${styles.companyTab} ${isActive ? styles.activeTab : ""}`}
                onClick={() => setActiveIndex(idx)}
              >
                <div className={styles.tabMarker}>
                   <div className={styles.tabDot} />
                </div>
                
                <div className={styles.tabContent}>
                  {exp.company.logo && (
                    <div className={styles.companyLogoMin}>
                      <Image
                        src={exp.company.logo}
                        alt={exp.company.name}
                        width={24}
                        height={24}
                        className={styles.logoImg}
                      />
                    </div>
                  )}
                  <div className={styles.tabInfo}>
                    <span className={styles.tabName}>{exp.company.name}</span>
                    <span className={styles.tabDuration}>
                      {exp.positions[0].start.split(" ")[1] || exp.positions[0].start} —{" "}
                      {exp.positions[exp.positions.length - 1].end?.split(" ")[1] || 
                       exp.positions[exp.positions.length - 1].end || t(locale, "present")}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Details */}
        <div className={styles.detailsArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={styles.detailsCard}
            >
              <div className={styles.detailsHeader}>
                {activeExp.company.logo && (
                  <div className={styles.largeLogoWrapper}>
                    <Image
                      src={activeExp.company.logo}
                      alt={activeExp.company.name}
                      width={64}
                      height={64}
                      className={styles.largeLogo}
                    />
                  </div>
                )}
                <div className={styles.headerInfo}>
                  <h3 className={styles.detailsCompanyName}>
                     {activeExp.company.url ? (
                        <a href={activeExp.company.url} target="_blank" rel="noopener noreferrer">
                          {activeExp.company.name}
                          <ArrowRight size={16} className={styles.linkArrow} />
                        </a>
                      ) : (
                        activeExp.company.name
                      )}
                  </h3>
                  <span className={styles.detailsLocation}>
                    {activeExp.company.location}
                  </span>
                </div>
              </div>

              {activeExp.company.overview && (
                <p className={styles.companyOverview}>
                  {activeExp.company.overview}
                </p>
              )}

              <div className={styles.positionsList}>
                {activeExp.positions.map((pos, pidx) => (
                  <div key={pidx} className={styles.positionBlock}>
                    <div className={styles.posHeader}>
                      <div className={styles.posTitleGroup}>
                        <Briefcase size={16} className={styles.posIcon} />
                        <h4 className={styles.posTitle}>{pos.designation}</h4>
                      </div>
                      <span className={styles.posDate}>
                        {pos.start} — {pos.end || t(locale, "present")}
                      </span>
                    </div>

                    {pos.responsibilities && (
                      <ul className={styles.responsibilities}>
                        {pos.responsibilities.map((resp, ridx) => (
                          <motion.li 
                            key={ridx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + (ridx * 0.05) }}
                          >
                            <span className={styles.bullet}>▹</span>
                            <span dangerouslySetInnerHTML={{ __html: resp }} />
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
}
