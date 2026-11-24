"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FileText, ChevronDown, Award } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { EducationSection, Degree } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { t } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import styles from "@/styles/components/Education.module.css";

interface EducationProps {
  locale: Locale;
  data: EducationSection;
  alternate?: boolean;
}

function CircularProgress({ achieved, outOf, scale }: { achieved: number; outOf: number; scale: string }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const percentage = Math.min(100, Math.max(0, (achieved / outOf) * 100));
  const strokeDasharray = `${percentage} 100`;

  return (
    <div
      className={styles.progressWidget}
      role="progressbar"
      aria-valuenow={achieved}
      aria-valuemin={0}
      aria-valuemax={outOf}
      aria-label={`${achieved} / ${outOf} ${scale}`}
    >
      <svg viewBox="0 0 36 36" className={styles.circularChart} aria-hidden="true">
        <path
          className={styles.circleBg}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <motion.path
          className={styles.circle}
          initial={prefersReducedMotion ? { strokeDasharray } : { strokeDasharray: "0 100" }}
          whileInView={{ strokeDasharray }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.5, ease: "easeOut" }}
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
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasCourses = degree.takenCourses && degree.takenCourses.courses.length > 0;
  const hasExtra = degree.extracurricularActivities && degree.extracurricularActivities.length > 0;

  const hasExpandableContent = hasCourses || hasExtra || !!degree.gradesReport;

  // Sync native Find-in-page (`hidden="until-found"`) reveals back into React state
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !hasExpandableContent) return;

    const handleBeforeMatch = () => setIsExpanded(true);
    panel.addEventListener("beforematch", handleBeforeMatch);
    return () => panel.removeEventListener("beforematch", handleBeforeMatch);
  }, [hasExpandableContent]);

  return (
    <motion.div
      className={styles.degreeCard}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: index * 0.1 }}
    >
      <div className={styles.cardHeader}>
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
                  <a href={degree.institution.url} target="_blank" rel="noopener noreferrer">
                    {degree.institution.name}
                  </a>
                ) : (
                  degree.institution.name
                )}
              </h3>
              <span className={styles.timeframeBadge}>{degree.timeframe}</span>
            </div>
            <h4 className={styles.degreeTitle}>
              <Award size={16} className={styles.degreeIcon} aria-hidden="true" />
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
              type="button"
              className={`${styles.expandBtn} ${isExpanded ? styles.expanded : ""}`}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              aria-label={`${t(locale, "expand_details")}: ${degree.institution.name}`}
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              <ChevronDown size={24} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {hasExpandableContent && (
        <div
          id={panelId}
          ref={panelRef}
          hidden={isExpanded ? undefined : ("until-found" as unknown as boolean)}
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
                        <span className={styles.bullet} aria-hidden="true">•</span>
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
                    <FileText size={16} aria-hidden="true" />
                    {degree.gradesReport.name}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
