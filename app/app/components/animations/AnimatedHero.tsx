"use client";
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedHero({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function HeroTerminal() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="hero-float">
        <img src="/assets/hero/terminal.svg" alt="Canopy terminal" width={480} height={320} className="w-full h-auto rounded-[18px] border border-[var(--color-border)] shadow-[0_18px_50px_rgba(0,0,0,0.35)]" />
      </div>
      <motion.div
        animate={reduce ? {} : { y: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-black shadow-lg"
      >
        ● LIVE
      </motion.div>
    </motion.div>
  );
}
