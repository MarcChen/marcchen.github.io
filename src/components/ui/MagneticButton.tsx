"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  target?: string;
  rel?: string;
  icon?: React.ElementType;
  variant?: "primary" | "outline" | "ghost";
}

export default function MagneticButton({
  children,
  href,
  onClick,
  className = "",
  target,
  rel,
  icon: Icon,
  variant = "primary",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const { clientX, clientY } = e;
    const middleX = clientX - (rect.left + rect.width / 2);
    const middleY = clientY - (rect.top + rect.height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const btnClass = `btn btn-${variant} ${className}`;
  const computedRel = target === "_blank" ? rel || "noopener noreferrer" : rel;
  const isInternalLink = Boolean(href && href.startsWith("/") && target !== "_blank");

  const InnerContent = (
    <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
      {Icon && <Icon size={18} aria-hidden="true" />}
      {children}
    </span>
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={prefersReducedMotion ? undefined : { x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      style={{ display: "inline-block" }}
    >
      {href ? (
        isInternalLink ? (
          <Link href={href} className={btnClass} onClick={onClick}>
            {InnerContent}
          </Link>
        ) : (
          <a href={href} className={btnClass} onClick={onClick} target={target} rel={computedRel}>
            {InnerContent}
          </a>
        )
      ) : (
        <button type="button" className={btnClass} onClick={onClick}>
          {InnerContent}
        </button>
      )}
    </motion.div>
  );
}
