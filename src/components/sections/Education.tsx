"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { EducationSection, Degree } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import timelineStyles from "@/styles/components/Timeline.module.css";
import styles from "@/styles/components/Education.module.css";

interface EducationProps {
  locale: Locale;
  data: EducationSection;
  alternate?: boolean;
}

function DegreeCard({
  degree,
  locale,
}: {
  degree: Degree;
  locale: Locale;
}) {
  const collapseAfter = degree.takenCourses?.collapseAfter ?? 3;
  const [showAll, setShowAll] = useState(false);

  return (
    <div className={timelineStyles.timelineItem}>
      <div className={timelineStyles.timelineDot} />
      <div className={timelineStyles.timelineCard}>
        <div className={timelineStyles.companyHeader}>
          {degree.institution.logo && (
            <Image
              src={degree.institution.logo}
              alt={degree.institution.name}
              width={48}
              height={48}
              className={timelineStyles.companyLogo}
            />
          )}
          <div className={timelineStyles.companyInfo}>
            <h3 className={timelineStyles.companyName}>
              {degree.institution.url ? (
                <a
                  href={degree.institution.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {degree.institution.name}
                </a>
              ) : (
                degree.institution.name
              )}
            </h3>
            <span className={timelineStyles.companyLocation}>
              {degree.timeframe}
            </span>
          </div>
        </div>

        <div className={timelineStyles.positionHeader}>
          <span className={timelineStyles.positionTitle}>{degree.name}</span>
        </div>

        {degree.grade && (
          <div className={styles.gradeRow}>
            <span className={styles.gradeLabel}>{degree.grade.scale}:</span>
            <span className={styles.gradeValue}>
              {degree.grade.achieved}
            </span>
            <span>{t(locale, "out_of")}</span>
            <span>{degree.grade.outOf}</span>
          </div>
        )}

        {degree.takenCourses && degree.takenCourses.courses.length > 0 && (
          <div className={styles.courseSection}>
            <h4 className={styles.courseTitle}>
              {t(locale, "taken_courses")}
            </h4>
            <ul className={styles.courseList}>
              {degree.takenCourses.courses.map((course, idx) => (
                <li
                  key={idx}
                  className={`${styles.courseItem} ${
                    !showAll && idx >= collapseAfter ? styles.hidden : ""
                  }`}
                >
                  {course.name}
                </li>
              ))}
            </ul>
            {degree.takenCourses.courses.length > collapseAfter && (
              <button
                className={styles.showMoreBtn}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll
                  ? t(locale, "show_less")
                  : t(locale, "show_more")}
              </button>
            )}
          </div>
        )}

        {degree.gradesReport && (
          <a
            href={degree.gradesReport.url}
            className={styles.gradesLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={14} />
            {degree.gradesReport.name}
          </a>
        )}

        {degree.extracurricularActivities &&
          degree.extracurricularActivities.length > 0 && (
            <div className={styles.extracurricular}>
              <h4>{t(locale, "extracurricular_activities")}</h4>
              <ul>
                {degree.extracurricularActivities.map((activity, idx) => (
                  <li key={idx}>{activity}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
}

export default function Education({
  locale,
  data,
  alternate,
}: EducationProps) {
  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <h2 className="section-title">{data.section.name}</h2>

      <div className={timelineStyles.timeline}>
        {data.degrees.map((degree, idx) => (
          <DegreeCard key={idx} degree={degree} locale={locale} />
        ))}
      </div>
    </SectionWrapper>
  );
}
