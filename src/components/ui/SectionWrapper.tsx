"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  alternate?: boolean;
  className?: string;
}

export default function SectionWrapper({
  id,
  children,
  alternate = false,
  className = "",
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`section ${alternate ? "section-alt" : ""} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      <div className="container">{children}</div>
    </section>
  );
}
