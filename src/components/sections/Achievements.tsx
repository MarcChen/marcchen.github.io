"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { AchievementsSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cloudinaryUrl } from "@/lib/cloudinary";
import styles from "@/styles/components/Achievements.module.css";

interface AchievementsProps {
  locale: Locale;
  data: AchievementsSection;
  alternate?: boolean;
}

export default function Achievements({ data, alternate }: AchievementsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create parallax effect on the container scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <div className={styles.sectionHeader}>
        <span className="section-label">07. Gallery</span>
        <AnimatedHeading title={data.section.name} />
      </div>

      <div className={styles.galleryGrid} ref={containerRef}>
        {data.achievements.map((achievement, i) => {
          const Wrapper = achievement.url ? "a" : "div";
          const wrapperProps = achievement.url
            ? {
                href: achievement.url,
                target: "_blank" as const,
                rel: "noopener noreferrer",
              }
            : {};

          // Alternate Y translation for parallax staggering effect
          const y = useTransform(
            scrollYProgress, 
            [0, 1], 
            [i % 2 === 0 ? 50 : 100, i % 2 === 0 ? -50 : -100]
          );

          return (
            <motion.div 
              key={achievement.title} 
              style={{ y }}
              className={styles.galleryItemWrapper}
            >
              <Wrapper
                className={styles.achievementCard}
                {...wrapperProps}
              >
                <div className={styles.imageContainer}>
                  <Image
                    src={cloudinaryUrl(achievement.image)}
                    alt={achievement.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.achievementImage}
                  />
                  <div className={styles.imageOverlay} />
                </div>
                
                <div className={styles.achievementContent}>
                  <h3 className={styles.achievementTitle}>
                    {achievement.title}
                  </h3>
                  <p className={styles.achievementSummary}>
                    {achievement.summary}
                  </p>
                </div>
              </Wrapper>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
