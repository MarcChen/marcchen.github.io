"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronDown, FileText, ArrowRight } from "lucide-react";
import type { Author } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import styles from "@/styles/components/Hero.module.css";
import MagneticButton from "@/components/ui/MagneticButton";

interface HeroProps {
  locale: Locale;
  author: Author;
}

export default function Hero({ locale, author }: HeroProps) {
  const summaryLines = author.summary || ["Data Engineer", "AI/ML Enthusiast", "Problem Solver"];
  const [currentLine, setCurrentLine] = useState(0);

  // Cycle through summary lines
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine((prev) => (prev + 1) % summaryLines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [summaryLines.length]);

  const scrollToContent = () => {
    const firstSection = document.querySelector(".section");
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const resumeUrls: Record<string, string> = {
    en: "/files/MarcChen_ENG.pdf",
    fr: "/files/MarcChen_FR.pdf",
    "zh-cn": "/files/MarcChen_CN.pdf",
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 20 } 
    }
  };

  return (
    <section className={styles.hero}>
      {/* Abstract Background Elements */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.gridOverlay} />

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
            <span className={styles.rolePrefix}>Specialize in </span>
            <div className={styles.roleCycler}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentLine}
                  initial={{ opacity: 0, y: 20, rotateX: 90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -20, rotateX: -90 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 120, damping: 20 }}
                  className={styles.roleText}
                  style={{ display: "inline-block", transformOrigin: "bottom" }}
                >
                  {summaryLines[currentLine]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className={styles.shortBio}>
             Bridging the gap between raw data and actionable intelligence. Turning complex models into scalable systems.
          </motion.p>

          <motion.div variants={itemVariants} className={styles.heroActions}>
            <MagneticButton 
              href={resumeUrls[locale] || resumeUrls.en}
              target="_blank"
              rel="noopener noreferrer"
              icon={FileText}
            >
              {t(locale, "my_resume")}
            </MagneticButton>
            
            <MagneticButton 
              onClick={scrollToContent} 
              variant="outline"
              icon={ArrowRight}
            >
              Explore Projects
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>

      <motion.button 
        className={styles.scrollIndicator} 
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <div className={styles.mouse}>
          <div className={styles.wheel} />
        </div>
      </motion.button>
    </section>
  );
}
