"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  alternate?: boolean;
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
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <>
      <motion.section
        ref={ref}
        id={id}
        tabIndex={-1}
        className={`section section-deferred relative ${className}`}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
        animate={prefersReducedMotion || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container relative z-10">{children}</div>
      </motion.section>
      {!noDivider && <div className="section-divider" />}
    </>
  );
}
