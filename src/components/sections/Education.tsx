"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, Award } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { EducationSection, Degree } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { t } from "@/lib/i18n";
import styles from "@/styles/components/Education.module.css";

interface EducationProps {
  locale: Locale;
  data: EducationSection;
  alternate?: boolean;
}

function CircularProgress({ achieved, outOf, scale }: { achieved: number; outOf: number; scale: string }) {
  const percentage = Math.min(100, Math.max(0, (achieved / outOf) * 100));
  const strokeDasharray = `${percentage} 100`;

  return (
    <div className={styles.progressWidget}>
      <svg viewBox="0 0 36 36" className={styles.circularChart}>
        <path
          className={styles.circleBg}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <motion.path
          className={styles.circle}
          initial={{ strokeDasharray: "0 100" }}
          whileInView={{ strokeDasharray }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className={styles.progressContent}>
        <span className={styles.progressValue}>{achieved}</span>
        <span className={styles.progressScale}>{scale}</span>
      </div>
    </div>
  );
}

function DegreeCard({ degree, locale, index }: { degree: Degree; locale: Locale; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const collapseAfter = degree.takenCourses?.collapseAfter ?? 4;
  const hasCourses = degree.takenCourses && degree.takenCourses.courses.length > 0;
  const hasExtra = degree.extracurricularActivities && degree.extracurricularActivities.length > 0;
  
  const hasExpandableContent = hasCourses || hasExtra || !!degree.gradesReport;

  return (
    <motion.div 
      className={styles.degreeCard}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className={styles.cardHeader} onClick={() => hasExpandableContent && setIsExpanded(!isExpanded)}>
        <div className={styles.institutionIdentity}>
          {degree.institution.logo && (
            <div className={styles.logoWrapper}>
              <Image
                src={cloudinaryUrl(degree.institution.logo)}
                alt={degree.institution.name}
                width={56}
                height={56}
                className={styles.instLogo}
              />
            </div>
          )}
          <div className={styles.instInfo}>
            <div className={styles.instHeaderRow}>
              <h3 className={styles.instName}>
                {degree.institution.url ? (
                  <a href={degree.institution.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    {degree.institution.name}
                  </a>
                ) : (
                  degree.institution.name
                )}
              </h3>
              <span className={styles.timeframeBadge}>{degree.timeframe}</span>
            </div>
            <h4 className={styles.degreeTitle}>
              <Award size={16} className={styles.degreeIcon} />
              {degree.name}
            </h4>
          </div>
        </div>

        <div className={styles.gradeSection}>
          {degree.grade && (
            <CircularProgress 
              achieved={degree.grade.achieved} 
              outOf={degree.grade.outOf} 
              scale={degree.grade.scale} 
            />
          )}
          {hasExpandableContent && (
            <button 
              className={`${styles.expandBtn} ${isExpanded ? styles.expanded : ""}`}
              aria-label="Expand details"
            >
              <ChevronDown size={24} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasExpandableContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={styles.expandedContent}
          >
            <div className={styles.expandedDivider} />
            
            <div className={styles.contentGrid}>
              {hasCourses && (
                <div className={styles.courseworkBlock}>
                  <h5 className={styles.subheading}>{t(locale, "taken_courses")}</h5>
                  <div className={styles.tagGrid}>
                    {degree.takenCourses!.courses.map((course, idx) => (
                      <span key={idx} className="tag tag-secondary">
                        {course.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.sideBlock}>
                {hasExtra && (
                  <div className={styles.extraBlock}>
                    <h5 className={styles.subheading}>{t(locale, "extracurricular_activities")}</h5>
                    <ul className={styles.extraList}>
                      {degree.extracurricularActivities!.map((activity, idx) => (
                        <li key={idx} className={styles.extraItem}>
                          <span className={styles.bullet}>•</span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {degree.gradesReport && (
                  <div className={styles.reportBlock}>
                    <a
                      href={degree.gradesReport.url}
                      className="btn btn-outline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText size={16} />
                      {degree.gradesReport.name}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Education({
  locale,
  data,
  alternate,
}: EducationProps) {
  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <div className={styles.sectionHeader}>
        <span className="section-label">04. Academic</span>
        <AnimatedHeading title={data.section.name} />
      </div>

      <div className={styles.stackedCards}>
        {data.degrees.map((degree, idx) => (
          <DegreeCard key={idx} degree={degree} locale={locale} index={idx} />
        ))}
      </div>
    </SectionWrapper>
  );
}
