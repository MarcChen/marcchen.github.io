import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { AchievementsSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import styles from "@/styles/components/Achievements.module.css";

interface AchievementsProps {
  locale: Locale;
  data: AchievementsSection;
  alternate?: boolean;
}

export default function Achievements({ data, alternate }: AchievementsProps) {
  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <h2 className="section-title">{data.section.name}</h2>

      <div className={styles.achievementsGrid}>
        {data.achievements.map((achievement) => {
          const Wrapper = achievement.url ? "a" : "div";
          const wrapperProps = achievement.url
            ? {
                href: achievement.url,
                target: "_blank" as const,
                rel: "noopener noreferrer",
              }
            : {};

          return (
            <Wrapper
              key={achievement.title}
              className={styles.achievementCard}
              {...wrapperProps}
            >
              <Image
                src={achievement.image}
                alt={achievement.title}
                width={400}
                height={220}
                className={styles.achievementImage}
              />
              <div className={styles.achievementContent}>
                <h3 className={styles.achievementTitle}>
                  {achievement.title}
                </h3>
                <p className={styles.achievementSummary}>
                  {achievement.summary}
                </p>
              </div>
            </Wrapper>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
