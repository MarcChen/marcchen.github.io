"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export default function CursorGlow() {
  const GLOW_SIZE = 400;
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  const springX = useSpring(0, { damping: 40, stiffness: 200, mass: 0.5 });
  const springY = useSpring(0, { damping: 40, stiffness: 200, mass: 0.5 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const updateMousePosition = (e: MouseEvent) => {
      springX.set(e.clientX);
      springY.set(e.clientY);
      setIsVisible((prev) => (prev ? prev : true));
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [springX, springY, prefersReducedMotion]);

  if (prefersReducedMotion || !isVisible) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: "var(--z-cursor)",
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <div
        style={{
          width: `${GLOW_SIZE}px`,
          height: `${GLOW_SIZE}px`,
          background: "radial-gradient(circle, hsl(var(--accent) / 0.15) 0%, transparent 60%)",
          borderRadius: "50%",
          mixBlendMode: "screen",
        }}
      />
    </motion.div>
  );
}
