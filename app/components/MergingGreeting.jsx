"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";

// "Hi, I'm Ovie." in the hero is the same element that becomes the first words of the about section.
// As you scroll it stays put while the hero slides away, shrinks, then settles into the invisible
// placeholder (#ovie-greeting-target) at the start of the about paragraph, in the same type.
// Only transforms are animated. With reduced motion it simply stays where it is in the hero.
export default function MergingGreeting() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const geo = useRef({ dx: 0, dy: 1, s: 1, ready: false });
  const tick = useMotionValue(0); // bumped whenever the geometry is re-measured
  const { scrollY } = useScroll();

  const y = useTransform([scrollY, tick], ([v]) => (geo.current.ready ? Math.min(Math.max(v, 0), geo.current.dy) : 0));
  const progress = useTransform([scrollY, tick], ([v]) =>
    geo.current.ready ? Math.min(1, Math.max(0, v / geo.current.dy)) : 0,
  );
  const x = useTransform(progress, (p) => geo.current.dx * p);
  const scale = useTransform(progress, (p) => 1 + (geo.current.s - 1) * p);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const target = document.getElementById("ovie-greeting-target");
      if (!target) return;
      // measure both with no transform applied, in page coordinates, using the text's own box
      const prev = el.style.transform;
      el.style.transform = "none";
      const textBox = (node) => {
        const r = document.createRange();
        r.selectNodeContents(node);
        const b = r.getBoundingClientRect();
        return { left: b.left + window.scrollX, top: b.top + window.scrollY, width: b.width };
      };
      const box = el.getBoundingClientRect();
      const elLeft = box.left + window.scrollX;
      const elTop = box.top + window.scrollY;
      const from = textBox(el);
      const to = textBox(target);
      el.style.transform = prev;
      if (!from.width || !to.width) return;
      const s = to.width / from.width;
      geo.current = {
        s,
        dx: to.left - elLeft - s * (from.left - elLeft),
        dy: Math.max(1, to.top - elTop - s * (from.top - elTop)),
        ready: true,
      };
      tick.set(tick.get() + 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    document.fonts?.ready.then(measure);
    // the hero's entrance animation shifts the heading for the first moments, so measure again once it is still
    const timers = [1300, 2600, 5000].map((ms) => setTimeout(measure, ms));
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      timers.forEach(clearTimeout);
    };
  }, [reduce, tick]);

  return (
    <motion.h1
      ref={ref}
      style={reduce ? undefined : { x, y, scale, transformOrigin: "0 0" }}
      className="relative z-20 inline-block text-[clamp(2.4rem,min(5.4vw,8dvh),4.75rem)] font-medium leading-[1.05] tracking-tight will-change-transform"
    >
      Hi, I&apos;m Ovie<span className="text-brand">.</span>
    </motion.h1>
  );
}
