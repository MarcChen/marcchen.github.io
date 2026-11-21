import type { EducationSection, Degree } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import SectionHead from "@/components/sections/SectionHead";

interface EducationProps {
  locale: Locale;
  data: EducationSection;
}

function formatTimeframe(value: string): string {
  return value.replace(/\s*[-–]\s*/g, " – ");
}

function gradeText(degree: Degree): string | null {
  if (!degree.grade) return null;
  const { scale, achieved, outOf } = degree.grade;
  return `${scale} ${achieved}/${outOf}`;
}

/** Courses list plus the grades report link, shared by the lead and the rest. */
function Courses({ degree, locale }: { degree: Degree; locale: Locale }) {
  const courses = degree.takenCourses?.courses ?? [];
  const report = degree.gradesReport;

  if (courses.length === 0 && !report) return null;

  return (
    <div className="edu-block">
      {courses.length > 0 && (
        <>
          <p className="edu-block-title">{t(locale, "taken_courses")}</p>
          <ul className="edu-courses">
            {courses.map((course) => (
              <li key={course.name}>{course.name}</li>
            ))}
          </ul>
        </>
      )}
      {report && (
        <a
          className="edu-report"
          href={assetPath(report.url)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {report.name}
        </a>
      )}
    </div>
  );
}

function Activities({ degree, locale }: { degree: Degree; locale: Locale }) {
  const activities = degree.extracurricularActivities ?? [];
  if (activities.length === 0) return null;

  return (
    <div className="edu-block">
      <p className="edu-block-title">
        {t(locale, "extracurricular_activities")}
      </p>
      <ul className="edu-activities">
        {activities.map((activity) => (
          <li key={activity}>{activity}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Education({ locale, data }: EducationProps) {
  const [lead, ...rest] = data.degrees;
  if (!lead) return null;

  return (
    <section id={data.section.id} className="section">
      <div className="shell">
        <SectionHead title={t(locale, "education_title")} />

        <div className="edu-lead">
          <p className="edu-lead-meta">
            <span>
              <a
                href={lead.institution.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {lead.institution.name}
              </a>
            </span>
            <span>{formatTimeframe(lead.timeframe)}</span>
            {gradeText(lead) && <span>{gradeText(lead)}</span>}
          </p>
          <h3 className="edu-lead-degree">{lead.name}</h3>

          <div className="edu-lead-grid">
            <Courses degree={lead} locale={locale} />
            <Activities degree={lead} locale={locale} />
          </div>
        </div>

        {rest.length > 0 && (
          <ul className="edu-rest">
            {rest.map((degree) => {
              const courses = degree.takenCourses?.courses ?? [];
              const activities = degree.extracurricularActivities ?? [];
              const report = degree.gradesReport;
              const expandable =
                courses.length > 0 || activities.length > 0 || Boolean(report);

              const row = (
                <span className="edu-row-main">
                  <span className="edu-row-name">{degree.name}</span>
                  <span className="edu-row-meta">
                    <span className="edu-row-inst">
                      {degree.institution.name}
                    </span>
                    <span>{formatTimeframe(degree.timeframe)}</span>
                    {gradeText(degree) && <span>{gradeText(degree)}</span>}
                  </span>
                  {expandable && <span className="edu-toggle" aria-hidden="true" />}
                </span>
              );

              if (!expandable) {
                return (
                  <li className="edu-item" key={degree.name}>
                    <div className="edu-row edu-row--static">{row}</div>
                  </li>
                );
              }

              return (
                <li className="edu-item" key={degree.name}>
                  <details>
                    <summary className="edu-row">{row}</summary>
                    <div className="edu-item-body">
                      <Courses degree={degree} locale={locale} />
                      <Activities degree={degree} locale={locale} />
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
