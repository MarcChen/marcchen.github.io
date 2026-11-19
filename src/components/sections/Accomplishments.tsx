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
  return (
    <section id={data.section.id} className="section">
      <div className="shell">
        <SectionHead
          title={t(locale, "accomplishments_title")}
          label={t(locale, "label_certificates")}
        />

        <table className="reg-table">
          <caption className="sr-only">
            {t(locale, "accomplishments_title")}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="reg-course">
                {t(locale, "acc_course")}
              </th>
              <th scope="col" className="reg-issuer">
                {t(locale, "acc_issuer")}
              </th>
              <th scope="col" className="reg-date">
                {t(locale, "acc_date")}
              </th>
              <th scope="col" className="reg-link-col">
                {t(locale, "acc_credential")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.accomplishments.map((item) => (
              <tr key={item.name}>
                <td className="reg-course" data-label={t(locale, "acc_course")}>
                  <span className="reg-name">{item.name}</span>
                  <span className="reg-overview">{item.courseOverview}</span>
                </td>
                <td className="reg-issuer" data-label={t(locale, "acc_issuer")}>
                  <span className="reg-org">
                    <a
                      href={item.organization.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.organization.name}
                    </a>
                  </span>
                </td>
                <td className="reg-date" data-label={t(locale, "acc_date")}>
                  <span className="reg-date-cell">{item.timeline}</span>
                </td>
                <td className="reg-link-col" data-label={t(locale, "acc_credential")}>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
