import type { AccomplishmentsSection } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import SectionHead from "@/components/sections/SectionHead";

interface AccomplishmentsProps {
  locale: Locale;
  data: AccomplishmentsSection;
}

export default function Accomplishments({
  locale,
  data,
}: AccomplishmentsProps) {
  // Group by issuer so the register reads by institution, not as a table.
  const groups = new Map<
    string,
    { url: string; items: AccomplishmentsSection["accomplishments"] }
  >();

  for (const item of data.accomplishments) {
    const issuer = item.organization.name;
    const group = groups.get(issuer);
    if (group) {
      group.items.push(item);
    } else {
      groups.set(issuer, { url: item.organization.url, items: [item] });
    }
  }

  return (
    <section id={data.section.id} className="section">
      <div className="shell">
        <SectionHead title={t(locale, "accomplishments_title")} />

        <div className="register">
          {Array.from(groups.entries()).map(([issuer, group]) => (
            <div className="reg-group" key={issuer}>
              <h3 className="reg-issuer">
                <a
                  href={group.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {issuer}
                </a>
              </h3>
              <ul className="reg-items">
                {group.items.map((item) => (
                  <li className="reg-item" key={item.name}>
                    <p className="reg-name">{item.name}</p>
                    <p className="reg-meta">
                      <span>{item.timeline}</span>
                      {item.certificateURL && (
                        <a
                          className="reg-link"
                          href={item.certificateURL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t(locale, "acc_view")}
                        </a>
                      )}
                    </p>
                    <p className="reg-overview">{item.courseOverview}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
