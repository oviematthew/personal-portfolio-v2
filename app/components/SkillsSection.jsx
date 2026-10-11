"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const GROUPS = [
  {
    name: "Frontend",
    items: ["React", "Next.js", "Vue", "TypeScript", "JavaScript", "Tailwind CSS", "Sass", "shadcn/ui", "Motion", "GSAP", "Three.js", "Accessibility (WCAG)"],
  },
  { name: "Mobile", items: ["React Native", "Expo", "Swift", "Kotlin", "Java"] },
  { name: "State and APIs", items: ["Redux", "Zustand", "Context API", "GraphQL", "REST"] },
  {
    name: "Backend and data",
    items: ["Node.js", "Express", "Supabase", "Firebase", "PostgreSQL", "MySQL", "MongoDB", "SQLite"],
  },
  {
    name: "CMS and commerce",
    items: ["Shopify", "Liquid", "Storefront API", "Strapi", "Headless CMS", "WordPress", "WooCommerce", "Wix"],
  },
  {
    name: "AI and tooling",
    items: ["AI-assisted coding", "Playwright", "Jest", "Git", "Docker", "Vercel", "Netlify", "CI/CD", "Figma"],
  },
];

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789/<>+*";

// Decodes into its final text. Writes straight to the DOM node, so it never re-renders React.
function Scramble({ text, delay = 0, reduce }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = text;
      return;
    }
    let raf;
    const start = performance.now() + delay;
    const duration = 650;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === " ") out += " ";
        else if (i / text.length < p) out += c;
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = p === 0 ? "" : out;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay, reduce]);

  return <span ref={ref} aria-label={text}>{text}</span>;
}

export default function SkillsSection() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  // Gentle autoplay until the visitor takes control
  useEffect(() => {
    if (!auto || !visible || reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % GROUPS.length), 3600);
    return () => clearInterval(id);
  }, [auto, visible, reduce]);

  const choose = useCallback((i) => {
    setAuto(false);
    setActive(i);
  }, []);

  const group = GROUPS[active];

  return (
    <section id="skills" ref={sectionRef} className="mx-auto max-w-[1400px] px-6 py-28 lg:py-44">
      <h2 className="text-5xl font-semibold tracking-tighter md:text-8xl">
        Skills<span className="text-brand">.</span>
      </h2>

      <div className="mt-14 grid grid-cols-1 gap-10 lg:mt-20 lg:grid-cols-12">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:col-span-6 lg:flex-col lg:gap-1" role="tablist" aria-label="Skill areas">
          {GROUPS.map((g, i) => (
            <li key={g.name}>
              <button
                role="tab"
                aria-selected={i === active}
                onMouseEnter={() => window.matchMedia("(hover: hover)").matches && choose(i)}
                onFocus={() => choose(i)}
                onClick={() => choose(i)}
                className={`group flex cursor-pointer items-center gap-3 text-left text-3xl font-semibold tracking-tighter transition-colors duration-300 md:text-5xl lg:text-6xl ${
                  i === active ? "text-white" : "text-neutral-600 hover:text-neutral-300"
                }`}
              >
                <motion.span
                  aria-hidden
                  animate={{ scaleX: i === active ? 1 : 0, opacity: i === active ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="hidden h-[3px] w-10 origin-left bg-brand lg:block"
                />
                {g.name}
              </button>
            </li>
          ))}
        </ul>

        <div className="min-h-[14rem] lg:col-span-6" role="tabpanel">
          <ul key={group.name} className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
            {group.items.map((item, i) => (
              <li key={item} className="font-mono-ui text-xl tracking-tight text-neutral-200 md:text-2xl">
                <span className="mr-3 text-brand">/</span>
                <Scramble text={item} delay={i * 60} reduce={reduce} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
