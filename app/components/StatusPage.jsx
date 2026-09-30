"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

// Shared full-screen result page (form success / failure): big headline, one message, actions.
export default function StatusPage({ variant = "success", title, children, actions }) {
  const Icon = variant === "success" ? Check : X;
  const reduce = useReducedMotion();
  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1400px] flex-col justify-center px-6 pb-24 pt-10">
      <motion.div
        initial={reduce ? false : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="mb-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cta text-white"
      >
        <Icon size={30} strokeWidth={2} />
      </motion.div>

      <motion.h1
        {...rise(0.1)}
        className="max-w-5xl text-[clamp(2.75rem,9vw,8.5rem)] font-semibold leading-[0.95] tracking-[-0.05em]"
      >
        {title}
      </motion.h1>

      <motion.p {...rise(0.25)} className="mt-8 max-w-lg text-lg leading-relaxed text-neutral-400">
        {children}
      </motion.p>

      <motion.div {...rise(0.4)} className="mt-10 flex flex-wrap items-center gap-3">
        {actions}
      </motion.div>
    </div>
  );
}
