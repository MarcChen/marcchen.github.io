"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  alternate?: boolean; // Kept for API compatibility, but we rely on modern CSS mostly now
  className?: string;
  noDivider?: boolean;
}

export default function SectionWrapper({
  id,
  children,
  className = "",
  noDivider = false,
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <>
      <motion.section
        ref={ref}
        id={id}
        className={`section relative ${className}`}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container relative z-10">{children}</div>
      </motion.section>
      {!noDivider && <div className="section-divider" />}
    </>
  );
}
