"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useReducedMotion } from "framer-motion";

export default function CursorGlow() {
  const GLOW_SIZE = 400;

  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Smooth springs for cursor movement
  const springX = useSpring(0, { damping: 40, stiffness: 200, mass: 0.5 });
  const springY = useSpring(0, { damping: 40, stiffness: 200, mass: 0.5 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Only show custom cursor on non-touch devices
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;

    if (isTouchDevice) return;

    const updateMousePosition = (e: MouseEvent) => {
      springX.set(e.clientX);
      springY.set(e.clientY);
      setIsVisible(true);
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
