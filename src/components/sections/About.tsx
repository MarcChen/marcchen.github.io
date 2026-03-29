import Image from "next/image";
import { Mail, Calendar, ExternalLink } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/Icons";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { AboutSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import styles from "@/styles/components/About.module.css";

interface AboutProps {
  locale: Locale;
  data: AboutSection;
  alternate?: boolean;
}

const socialIcons: Record<string, React.ReactNode> = {
  "fas fa-envelope": <Mail size={16} />,
  "fab fa-linkedin": <LinkedinIcon size={16} />,
  "fab fa-github": <GithubIcon size={16} />,
  "far fa-calendar-alt": <Calendar size={16} />,
};

export default function About({ data, alternate }: AboutProps) {
  const softSkills = data.badges.filter(
    (b) => b.type === "soft-skill-indicator"
  );
  const certifications = data.badges.filter(
    (b) => b.type === "certification"
  );

  // Parse summary - replace \n\n with paragraph breaks
  const summaryParagraphs = data.summary
    .split("\\n\\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <h2 className="section-title">{data.section.name}</h2>

      <div className={styles.aboutGrid}>
        {/* Left column — profile card */}
        <div className={styles.profileCard}>
          <p className={styles.designation}>{data.designation}</p>

          <div className={styles.socialLinks}>
            {data.socialLinks.map((link) => {
              const isEmail = link.icon === "fas fa-envelope";
              const href = isEmail
                ? `mailto:${link.url}`
                : link.url;
              return (
                <a
                  key={link.name}
                  href={href}
                  className={styles.socialBtn}
                  target={isEmail ? undefined : "_blank"}
                  rel={isEmail ? undefined : "noopener noreferrer"}
                >
                  {socialIcons[link.icon] || <ExternalLink size={16} />}
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Resource links (resume etc) */}
          {data.resourceLinks?.map((link) => (
            <a
              key={link.title}
              href={link.url}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginBottom: "var(--space-2)" }}
            >
              {link.title}
            </a>
          ))}

          {/* Language / soft skill badges */}
          {softSkills.length > 0 && (
            <div className={styles.badgeSection}>
              <div className={styles.languageBadges}>
                {softSkills.map((badge) => (
                  <div key={badge.name} className={styles.langBadge}>
                    <span className={styles.langName}>{badge.name}</span>
                    <div className={styles.langBar}>
                      <div
                        className={styles.langBarFill}
                        style={{
                          width: `${badge.percentage || 0}%`,
                          background: badge.color || "hsl(var(--accent))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — summary + certifications */}
        <div>
          <div className={styles.summary}>
            {summaryParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className={styles.badgeSection}>
              <h3 className={styles.badgeTitle}>Certifications</h3>
              <div className={styles.certGrid}>
                {certifications.map((cert) => (
                  <a
                    key={cert.name}
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.certCard}
                  >
                    {cert.badge && (
                      <Image
                        src={cert.badge}
                        alt={cert.name}
                        width={80}
                        height={80}
                        className={styles.certImage}
                        unoptimized
                      />
                    )}
                    <span className={styles.certName}>{cert.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
