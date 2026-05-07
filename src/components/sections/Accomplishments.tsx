"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
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
  const SCROLL_AMOUNT = 400;

  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <div className={styles.sectionHeader}>
        <span className="section-label">06. Certifications</span>
        <AnimatedHeading title={data.section.name} />
      </div>

      <div className={styles.carouselContainer}>
        {/* Navigation Controls */}
        <div className={styles.controls}>
          <button 
            className={`${styles.navBtn} ${!canScrollLeft ? styles.disabled : ""}`} 
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            disabled={!canScrollLeft}
          >
            ←
          </button>
          <button 
            className={`${styles.navBtn} ${!canScrollRight ? styles.disabled : ""}`} 
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            disabled={!canScrollRight}
          >
            →
          </button>
        </div>

        {/* Scrollable Track */}
        <motion.div 
          className={styles.carouselTrack}
          ref={containerRef}
          onScroll={checkScroll}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {data.accomplishments.map((acc, index) => (
            <div key={acc.name} className={styles.cardWrapper}>
              <div className={styles.accompCard}>
                <div className={styles.cardGradientTop} />
                
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <Award size={24} />
                  </div>
                  <span className={styles.timelineBadge}>{acc.timeline}</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.title}>{acc.name}</h3>
                  <a
                    href={acc.organization.url}
                    className={styles.orgLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {acc.organization.name}
                  </a>
                  <p className={styles.overview}>{acc.courseOverview}</p>
                </div>

                <div className={styles.cardFooter}>
                  {acc.certificateURL ? (
                    <a
                      href={acc.certificateURL}
                      className={styles.certBtn}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{t(locale, "view_certificate")}</span>
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className={styles.noCert}>Internal Verification</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* Spacer to allow scrolling past the last item slightly */}
          <div className={styles.carouselSpacer} />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
