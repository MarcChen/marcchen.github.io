import type { ReactNode } from "react";

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  alternate?: boolean;
  className?: string;
  noDivider?: boolean;
}

/**
 * Section shell. The entrance is a CSS scroll-driven reveal (`.reveal` in
 * globals.css): content is fully visible by default and only animates where
 * the browser supports view timelines and motion is allowed.
 */
export default function SectionWrapper({
  id,
  children,
  alternate = false,
  className = "",
  noDivider = false,
}: SectionWrapperProps) {
  return (
    <>
      <section
        id={id}
        tabIndex={-1}
        className={`section section-deferred relative ${alternate ? "section-alt" : ""} ${className}`}
      >
        <div className="container relative z-10 reveal">{children}</div>
      </section>
      {!noDivider && <div className="section-divider" />}
    </>
  );
}
