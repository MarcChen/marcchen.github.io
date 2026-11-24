"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowRight, Pause, Play } from "lucide-react";
import type { Author } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import styles from "@/styles/components/Hero.module.css";
import MagneticButton from "@/components/ui/MagneticButton";

interface HeroProps {
  locale: Locale;
  author: Author;
}

export default function Hero({ locale, author }: HeroProps) {
  const summaryLines = author.summary || ["Data Engineer", "AI/ML Enthusiast", "Problem Solver"];
  const prefersReducedMotion = usePrefersReducedMotion();
  const [currentLine, setCurrentLine] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Cycle through summary lines unless paused or reduced motion is preferred
  useEffect(() => {
    if (isPaused || prefersReducedMotion || summaryLines.length <= 1) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        setCurrentLine((prev) => (prev + 1) % summaryLines.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion, summaryLines.length]);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
      projectsSection.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };

  const containerVariants: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
      };

  const itemVariants: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 100, damping: 20 },
        },
      };

  return (
    <section className={styles.hero}>
      {/* Abstract Background Elements */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />
      <div className={styles.blob3} aria-hidden="true" />
      <div className={styles.gridOverlay} aria-hidden="true" />

      <div className="container">
        <motion.div
          className={styles.heroContent}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className={styles.greeting}>
            <span className={styles.badge}>{author.greeting}</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className={styles.name}>
            {author.name.split(" ").map((word, i) => (
              <span key={i} className={i > 0 ? styles.gradientText : ""}>
                {word}{" "}
              </span>
            ))}
          </motion.h1>

          <motion.div variants={itemVariants} className={styles.roleContainer}>
            <span className={styles.rolePrefix}>{t(locale, "specialize_in")}</span>
            <div className={styles.roleCycler}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentLine}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20, rotateX: 90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -20, rotateX: -90 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.4, type: "spring", stiffness: 120, damping: 20 }
                  }
                  className={styles.roleText}
                  style={{ display: "inline-block", transformOrigin: "bottom" }}
                >
                  {summaryLines[currentLine]}
                </motion.span>
              </AnimatePresence>
            </div>
            {summaryLines.length > 1 && !prefersReducedMotion && (
              <button
                type="button"
                className={styles.pauseBtn}
                onClick={() => setIsPaused((prev) => !prev)}
                aria-label={isPaused ? t(locale, "play_tagline") : t(locale, "pause_tagline")}
              >
                {isPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
              </button>
            )}
          </motion.div>

          <motion.p variants={itemVariants} className={styles.shortBio}>
            {t(locale, "hero_bio")}
          </motion.p>

          <motion.div variants={itemVariants} className={styles.heroActions}>
            <MagneticButton
              onClick={scrollToProjects}
              variant="outline"
              icon={ArrowRight}
            >
              {t(locale, "explore_projects")}
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>

      <motion.button
        type="button"
        className={styles.scrollIndicator}
        onClick={scrollToProjects}
        aria-label={t(locale, "scroll_to_projects")}
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { delay: 1.5, duration: 1 }}
      >
        <div className={styles.mouse} aria-hidden="true">
          <div className={styles.wheel} />
        </div>
      </motion.button>
    </section>
  );
}
