"use client";
import { motion, useReducedMotion } from "framer-motion";

export function RevealMotion({ revealed, children }: { revealed: boolean; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      animate={revealed ? { rotateY: 180 } : { rotateY: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        animate={revealed ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ backfaceVisibility: "hidden" }}
      >
        {/* sealed side */}
      </motion.div>
      {children}
    </motion.div>
  );
}

export function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`card-soft-shimmer absolute inset-0 pointer-events-none ${className}`} aria-hidden />;
}
