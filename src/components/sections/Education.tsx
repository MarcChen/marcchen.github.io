import Image from "next/image";
import { FileText } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { EducationSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import { cloudinaryUrl } from "@/lib/cloudinary";
import styles from "@/styles/components/Education.module.css";

interface EducationProps {
  locale: Locale;
  data: EducationSection;
  alternate?: boolean;
}

const fileHref = (url: string) => (url.startsWith("http") ? url : assetPath(url));

/** Each graded school as a transcript sheet: grade as the headline, PDF one
 *  click away, courses and activities in a drawer. Ungraded schools follow as a line. */
export default function Education({ locale, data, alternate }: EducationProps) {
  const graded = data.degrees.filter((d) => d.grade);
  const others = data.degrees.filter((d) => !d.grade);

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <AnimatedHeading title={data.section.name} />
      <div className={styles.sheets}>
        {graded.map((d) => {
          const courses = d.takenCourses?.courses ?? [];
          const extras = d.extracurricularActivities ?? [];
          return (
            <article key={d.institution.name + d.name} className={styles.sheet}>
              <header className={styles.head}>
                <span className={styles.year}>{d.timeframe}</span>
                {d.institution.logo && (
                  <span className={styles.logo}>
                    <Image src={cloudinaryUrl(d.institution.logo)} alt="" width={40} height={40} />
                  </span>
                )}
              </header>
              <h3 className={styles.school}>
                {d.institution.url ? (
                  <a href={d.institution.url} target="_blank" rel="noopener noreferrer">
                    {d.institution.name}
                  </a>
                ) : (
                  d.institution.name
                )}
              </h3>
              <p className={styles.degree}>{d.name}</p>

              {d.grade && (
                <div className={styles.grade}>
                  <b>{d.grade.achieved}</b>
                  <span>/ {d.grade.outOf}</span>
                  <em>{d.grade.scale}</em>
                </div>
              )}

              {d.gradesReport && (
                <a
                  href={fileHref(d.gradesReport.url)}
                  className={styles.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText size={15} aria-hidden="true" />
                  {t(locale, "open_transcript")}
                </a>
              )}

              {(courses.length > 0 || extras.length > 0) && (
                <details className={styles.drawer}>
                  <summary>
                    {t(locale, "courses")} · {courses.length}
                    {extras.length > 0 && ` + ${extras.length}`}
                  </summary>
                  {courses.length > 0 && (
                    <ul className={styles.courses}>
                      {courses.map((c) => (
                        <li key={c.name}>
                          <span>{c.name}</span>
                          {d.takenCourses?.showGrades && c.achieved != null && (
                            <span className={styles.cg}>
                              {c.achieved}
                              {c.outOf ? ` / ${c.outOf}` : ""}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {extras.length > 0 && (
                    <>
                      <p className={styles.subhead}>{t(locale, "extracurricular_activities")}</p>
                      <ul className={styles.extras}>
                        {extras.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </details>
              )}
            </article>
          );
        })}
      </div>

      {others.length > 0 && (
        <ul className={styles.others}>
          {others.map((d) => (
            <li key={d.institution.name + d.name}>
              <span className={styles.year}>{d.timeframe}</span>
              <b>{d.institution.name}</b>
              <span>{d.name}</span>
            </li>
          ))}
        </ul>
      )}
    </SectionWrapper>
  );
}
