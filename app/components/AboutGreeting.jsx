"use client";

import { useReducedMotion } from "motion/react";

// The invisible landing spot for the hero's greeting. The real, visible text is the hero heading,
// which scrolls into this exact place. Skipped when reduced motion keeps the heading in the hero.
export default function AboutGreeting() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <>
      {/* the measured span holds only the words; the gap after it is ordinary text, so the scale matches exactly */}
      <span id="ovie-greeting-target" aria-hidden className="select-none text-transparent">
        Hi, I&apos;m Ovie.
      </span>{" "}
    </>
  );
}
