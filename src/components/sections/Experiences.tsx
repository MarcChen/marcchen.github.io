import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
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
  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <h2 className="section-title">{data.section.name}</h2>

      <div className={styles.timeline}>
        {data.experiences.map((exp, idx) => (
          <div key={idx} className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            <div className={styles.timelineCard}>
              <div className={styles.companyHeader}>
                {exp.company.logo && (
                  <Image
                    src={exp.company.logo}
                    alt={exp.company.name}
                    width={48}
                    height={48}
                    className={styles.companyLogo}
                  />
                )}
                <div className={styles.companyInfo}>
                  <h3 className={styles.companyName}>
                    {exp.company.url ? (
                      <a
                        href={exp.company.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {exp.company.name}
                      </a>
                    ) : (
                      exp.company.name
                    )}
                  </h3>
                  <span className={styles.companyLocation}>
                    {exp.company.location}
                  </span>
                </div>
              </div>

              {exp.company.overview && (
                <p className={styles.companyOverview}>
                  {exp.company.overview}
                </p>
              )}

              {exp.positions.map((pos, pidx) => (
                <div key={pidx} className={styles.position}>
                  <div className={styles.positionHeader}>
                    <span className={styles.positionTitle}>
                      {pos.designation}
                    </span>
                    <span className={styles.positionDate}>
                      {pos.start} — {pos.end || t(locale, "present")}
                    </span>
                  </div>
                  {pos.responsibilities && (
                    <ul className={styles.responsibilities}>
                      {pos.responsibilities.map((resp, ridx) => (
                        <li key={ridx}>{resp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
