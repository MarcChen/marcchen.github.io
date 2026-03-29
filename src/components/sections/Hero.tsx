"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronDown, FileText } from "lucide-react";
import type { Author } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import styles from "@/styles/components/Hero.module.css";

interface HeroProps {
  locale: Locale;
  author: Author;
}

export default function Hero({ locale, author }: HeroProps) {
  const summaryLines = author.summary || [];
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const typingSpeed = 60;
  const deletingSpeed = 30;
  const pauseDuration = 2000;

  const animate = useCallback(() => {
    if (summaryLines.length === 0) return;

    const fullText = summaryLines[currentLine] || "";

    if (!isDeleting) {
      if (displayText.length < fullText.length) {
        return setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        return setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    } else {
      if (displayText.length > 0) {
        return setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setCurrentLine((prev) => (prev + 1) % summaryLines.length);
      }
    }
  }, [displayText, isDeleting, currentLine, summaryLines]);

  useEffect(() => {
    const timer = animate();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [animate]);

  const scrollToContent = () => {
    const firstSection = document.querySelector(".section");
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Determine resume URL based on locale
  const resumeUrls: Record<string, string> = {
    en: "/files/MarcChen_ENG.pdf",
    fr: "/files/MarcChen_FR.pdf",
    "zh-cn": "/files/MarcChen_CN.pdf",
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroBg}>
        <Image
          src="/images/site/bg_dark.jpg"
          alt="Background"
          fill
          className={styles.heroBgImage}
          priority
          quality={85}
        />
      </div>

      <div className={styles.heroContent}>
        <Image
          src={`/${author.image}`}
          alt={author.name}
          width={150}
          height={150}
          className={styles.avatar}
          priority
        />

        <p className={styles.greeting}>{author.greeting}</p>
        <h1 className={styles.name}>
          <span className={styles.nameAccent}>{author.name}</span>
        </h1>

        <div className={styles.typewriter}>
          {displayText}
          <span className={styles.cursor} />
        </div>

        <div className={styles.heroActions}>
          <a
            href={resumeUrls[locale] || resumeUrls.en}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={16} />
            {t(locale, "my_resume")}
          </a>
          <button
            className="btn btn-outline"
            onClick={scrollToContent}
            style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
          >
            {t(locale, "contact_me")}
          </button>
        </div>
      </div>

      <button className={styles.scrollIndicator} onClick={scrollToContent}>
        <ChevronDown size={32} />
      </button>
    </section>
  );
}
