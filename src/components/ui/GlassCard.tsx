"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  glowOnHover?: boolean;
}

export default function GlassCard({ children, className = "", delay = 0, glowOnHover = false }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`glass-card ${className}`}
      style={glowOnHover ? { transition: "all 0.3s ease" } : {}}
      whileHover={glowOnHover ? { boxShadow: "0 10px 30px -10px hsl(var(--accent)/0.3)" } : {}}
    >
      {children}
    </motion.div>
  );
}
