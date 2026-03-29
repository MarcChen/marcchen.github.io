import { ExternalLink } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { AccomplishmentsSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import styles from "@/styles/components/Accomplishments.module.css";

interface AccomplishmentsProps {
  locale: Locale;
  data: AccomplishmentsSection;
  alternate?: boolean;
}

export default function Accomplishments({
  locale,
  data,
  alternate,
}: AccomplishmentsProps) {
  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <h2 className="section-title">{data.section.name}</h2>

      <div className={styles.accomplishmentsGrid}>
        {data.accomplishments.map((acc) => (
          <div key={acc.name} className={styles.accomplishmentCard}>
            <div className={styles.accomplishmentHeader}>
              <h3 className={styles.accomplishmentName}>{acc.name}</h3>
              <span className={styles.accomplishmentTimeline}>
                {acc.timeline}
              </span>
            </div>

            <a
              href={acc.organization.url}
              className={styles.orgName}
              target="_blank"
              rel="noopener noreferrer"
            >
              {acc.organization.name}
            </a>

            <p className={styles.overview}>{acc.courseOverview}</p>

            {acc.certificateURL && (
              <a
                href={acc.certificateURL}
                className={styles.certLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={14} />
                {t(locale, "view_certificate")}
              </a>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
