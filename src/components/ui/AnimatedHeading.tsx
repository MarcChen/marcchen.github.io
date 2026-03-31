"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

interface AnimatedHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function AnimatedHeading({ title, subtitle, className = "" }: AnimatedHeadingProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const letters = Array.from(title);

  return (
    <div className={`section-heading ${className}`} ref={ref}>
      <motion.h2
        className="section-title"
        style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", overflow: "hidden" }}
        variants={container}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {letters.map((letter, index) => (
          <motion.span
            variants={child}
            key={index}
            style={{ display: "inline-block", whiteSpace: letter === " " ? "pre" : "normal" }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.h2>
      {subtitle && (
        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
