import type { EducationSection, Degree } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import SectionHead from "@/components/sections/SectionHead";

interface EducationProps {
  locale: Locale;
  data: EducationSection;
}

function formatTimeframe(value: string): string {
  return value.replace(/\s*[-–]\s*/g, " — ");
}

function Row({
  degree,
  locale,
  expandable,
}: {
  degree: Degree;
  locale: Locale;
  expandable: boolean;
}) {
  return (
    <span className="edu-row-content">
      <span className="edu-time">{formatTimeframe(degree.timeframe)}</span>
      <span className="edu-name-cell">
        <span className="edu-degree">{degree.name}</span>
        <span className="edu-inst">{degree.institution.name}</span>
      </span>
      {degree.grade ? (
        <span className="edu-grade">
          {degree.grade.scale}
          <b>
            {degree.grade.achieved}/{degree.grade.outOf}
          </b>
        </span>
      ) : (
        <span />
      )}
      {expandable ? (
        <span className="edu-toggle" aria-hidden="true" />
      ) : (
        <span />
      )}
    </span>
  );
}

export default function Education({ locale, data }: EducationProps) {
  return (
    <section id={data.section.id} className="section">
      <div className="shell">
        <SectionHead title={t(locale, "education_title")} />

        <ul className="edu-list">
          {data.degrees.map((degree, index) => {
            const courses = degree.takenCourses?.courses ?? [];
            const activities = degree.extracurricularActivities ?? [];
            const report = degree.gradesReport;
            const expandable =
              courses.length > 0 || activities.length > 0 || Boolean(report);

            if (!expandable) {
              return (
                <li className="edu-item" key={degree.name}>
                  <div className="edu-row edu-row--static">
                    <Row degree={degree} locale={locale} expandable={false} />
                  </div>
                </li>
              );
            }

            return (
              <li className="edu-item" key={degree.name}>
                <details open={index === 0}>
                  <summary className="edu-row">
                    <Row degree={degree} locale={locale} expandable />
                  </summary>

                  <div className="edu-body">
                    <div className="edu-block">
                      {courses.length > 0 && (
                        <>
                          <p className="meta">{t(locale, "taken_courses")}</p>
                          <ul className="edu-courses">
                            {courses.map((course) => (
                              <li key={course.name}>{course.name}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {report && (
                        <div className="edu-actions">
                          <a
                            href={assetPath(report.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {report.name}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="edu-block">
                      {activities.length > 0 && (
                        <>
                          <p className="meta">
                            {t(locale, "extracurricular_activities")}
                          </p>
                          <ul className="edu-activities">
                            {activities.map((activity) => (
                              <li key={activity}>{activity}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
