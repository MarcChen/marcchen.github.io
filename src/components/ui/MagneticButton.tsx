"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

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
  const prefersReducedMotion = useReducedMotion();

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const { clientX, clientY } = e;
    const middleX = clientX - (rect.left + rect.width / 2);
    const middleY = clientY - (rect.top + rect.height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 }); // 0.2 is the magnetic strength
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const btnClass = `btn btn-${variant} ${className}`;
  const safeRel = rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);

  const InnerContent = (
    <>
      <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        {Icon && <Icon size={18} aria-hidden="true" />}
        {children}
      </span>
    </>
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={prefersReducedMotion ? { x: 0, y: 0 } : { x: position.x, y: position.y }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      style={{ display: "inline-block" }}
    >
      {href ? (
        <a href={href} className={btnClass} onClick={onClick} target={target} rel={safeRel}>
          {InnerContent}
        </a>
      ) : (
        <button type="button" className={btnClass} onClick={onClick}>
          {InnerContent}
        </button>
      )}
    </motion.div>
  );
}
