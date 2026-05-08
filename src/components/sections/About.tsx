"use client";

import Image from "next/image";
import { Mail, Calendar, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/Icons";
import SectionWrapper from "@/components/ui/SectionWrapper";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { AboutSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cloudinaryUrl } from "@/lib/cloudinary";
import styles from "@/styles/components/About.module.css";
import MagneticButton from "@/components/ui/MagneticButton";

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

export default function About({ data, alternate, locale }: AboutProps) {
  const softSkills = data.badges.filter(
    (b) => b.type === "soft-skill-indicator"
  );
  const certifications = data.badges.filter(
    (b) => b.type === "certification"
  );

  const summaryParagraphs = data.summary
    .split("\\n\\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <div className={styles.sectionHeader}>
        <span className="section-label">01. Discovery</span>
        <AnimatedHeading title={data.section.name} />
      </div>

      <div className={styles.bentoGrid}>
        {/* Large Profile Bento Card */}
        <GlassCard className={styles.profileCard} delay={0.1}>
          <div className={styles.imageOverlay}>
<Image
                  src={cloudinaryUrl("/images/author/marc.png")}
                  alt="Marc Chen"
                 width={100}
                 height={100}
                 className={styles.avatarImage}
               />
          </div>
          <p className={styles.designation}>{data.designation}</p>
          <div className={styles.socialBar}>
            {data.socialLinks.map((link) => {
              const isEmail = link.icon === "fas fa-envelope";
              const href = isEmail ? `mailto:${link.url}` : link.url;
              return (
                <a
                  key={link.name}
                  href={href}
                  className={styles.socialPill}
                  target={isEmail ? undefined : "_blank"}
                  rel={isEmail ? undefined : "noopener noreferrer"}
                >
                  {socialIcons[link.icon]}
                  <span className={styles.socialName}>{link.name}</span>
                </a>
              );
            })}
          </div>
          <div className={styles.summaryText}>
             {summaryParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
             ))}
          </div>
        </GlassCard>


        {/* Languages/Soft Skills Bento */}
        {softSkills.length > 0 && (
          <GlassCard className={styles.skillsCard} delay={0.3}>
            <h3 className={styles.cardTitle}>Proficiency</h3>
            <div className={styles.skillsList}>
              {softSkills.map((badge, idx) => (
                <div key={badge.name} className={styles.skillBarWrapper}>
                  <div className={styles.skillHeader}>
                    <span className={styles.skillName}>{badge.name}</span>
                    <span className={styles.skillPerc}>{badge.percentage}%</span>
                  </div>
                  <div className={styles.skillTrack}>
                    <div
                      className={styles.skillFill}
                      style={{
                        width: `${badge.percentage || 0}%`,
                        backgroundColor: badge.color ? badge.color : "hsl(var(--accent))"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Certifications Bento */}
        {certifications.length > 0 && (
          <GlassCard className={styles.certCard} delay={0.4}>
            <h3 className={styles.cardTitle}>Certifications</h3>
            <div className={styles.certGrid}>
              {certifications.map((cert) => (
                <a
                  key={cert.name}
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.certItem}
                >
                  {cert.badge && (
                    <div className={styles.certBadgeWrapper}>
                      <Image
                        src={cloudinaryUrl(cert.badge)}
                        alt={cert.name}
                        width={60}
                        height={60}
                        className={styles.certImage}
                        unoptimized
                      />
                    </div>
                  )}
                  <span className={styles.certName}>{cert.name}</span>
                </a>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </SectionWrapper>
  );
}
