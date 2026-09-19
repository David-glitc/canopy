"use client";
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedCard({ children, index = 0, className = "", style }: { children: React.ReactNode; index?: number; className?: string; style?: React.CSSProperties }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduce ? {} : { y: -2, transition: { duration: 0.16 } }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedMetric({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="metric-card"
    >
      {children}
    </motion.div>
  );
}
