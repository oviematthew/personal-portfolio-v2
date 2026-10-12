"use client";

import { motion, useReducedMotion } from "motion/react";

// Fade-and-rise on scroll into view. Communicates sequence: content arrives as you reach it.
export default function Reveal({ children, delay = 0, className = "", as = "div", rise = 32 }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: rise }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
