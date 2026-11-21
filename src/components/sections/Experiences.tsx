import type { ExperiencesSection } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import SectionHead from "@/components/sections/SectionHead";
import InlineText from "@/components/ui/InlineText";

interface ExperiencesProps {
  locale: Locale;
  data: ExperiencesSection;
}

function formatYears(start: string, end: string | undefined, present: string) {
  const startYear = start.match(/\d{4}/)?.[0] ?? start;
  const endYear = end?.match(/\d{4}/)?.[0];
  if (!endYear) return `${startYear} – ${present}`;
  if (startYear === endYear) return startYear;
  return `${startYear} – ${endYear}`;
}

export default function Experiences({ locale, data }: ExperiencesProps) {
  const rows = data.experiences.flatMap((experience) =>
    experience.positions.map((position) => ({
      company: experience.company,
      position,
    }))
  );

  return (
    <section id={data.section.id} className="section">
      <div className="shell">
        <SectionHead title={t(locale, "experiences_title")} />

        <ol className="ledger">
          {rows.map(({ company, position }) => (
            <li
              className="ledger-row"
              key={`${company.name}-${position.designation}-${position.start}`}
            >
              <p className="ledger-years">
                {formatYears(position.start, position.end, t(locale, "present"))}
              </p>

              <div className="ledger-body">
                <p className="ledger-role">{position.designation}</p>
                <p className="ledger-company">
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company.name}
                  </a>
                  <span className="ledger-loc"> · {company.location}</span>
                </p>
                <ul className="ledger-resp">
                  {position.responsibilities.map((line, index) => (
                    <li key={index}>
                      <InlineText text={line} />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
