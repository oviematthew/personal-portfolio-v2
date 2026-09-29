"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import projects from "../data/projects.json";

// Track geometry in vw: lead heading panel, then one panel + gap per project.
const LEAD = 42;
const PANEL = 62;
const GAP = 3;
const TAIL = 32;
const PAD = 6;
const MORE = "https://github.com/oviematthew";
const TRACK = PAD + LEAD + GAP + projects.length * (PANEL + GAP) + TAIL + PAD;
const TRAVEL = TRACK - 100;

function Heading() {
  return (
    <h2 className="text-5xl font-semibold tracking-tighter md:text-8xl">
      Selected work<span className="text-brand">.</span>
    </h2>
  );
}

function Meta({ p }) {
  return (
    <div className="mt-6 flex items-start justify-between gap-6">
      <div>
        <h3 className="text-3xl font-semibold tracking-tighter transition-colors group-hover:text-brand md:text-5xl">
          {p.name}
        </h3>
        <p className="mt-3 max-w-xl text-neutral-400">{p.description}</p>
        <p className="mt-3 text-sm text-neutral-500">{p.techStack.slice(0, 4).join(", ")}</p>
      </div>
      <ArrowUpRight
        size={36}
        strokeWidth={1.5}
        className="mt-1 shrink-0 text-neutral-500 transition duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand"
      />
    </div>
  );
}

function MoreLink({ className = "" }) {
  return (
    <Link
      href={MORE}
      target="_blank"
      className={`group inline-flex items-center gap-4 text-4xl font-semibold tracking-tighter transition-colors hover:text-brand md:text-6xl ${className}`}
    >
      More projects
      <ArrowUpRight className="h-9 w-9 transition duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 md:h-14 md:w-14" strokeWidth={1.25} />
    </Link>
  );
}

// Small screens and reduced motion: a plain vertical list, no scroll hijack.
function Stacked({ className }) {
  return (
    <div className={`mx-auto max-w-[1400px] px-6 py-24 ${className}`}>
      <div className="mb-14">
        <Heading />
      </div>
      <ul className="flex flex-col gap-16">
        {projects.map((p) => (
          <li key={p.slug}>
            <Link href={`/project/${p.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-black">
                <Image src={p.featuredImage} alt={`${p.name} screenshot`} fill sizes="100vw" className="object-cover object-top" />
              </div>
              <Meta p={p} />
            </Link>
          </li>
        ))}
      </ul>
      <MoreLink className="mt-16" />
    </div>
  );
}

function Pinned() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], ["0vw", `-${TRAVEL}vw`]);

  return (
    <div ref={ref} className="relative hidden md:block" style={{ height: `${projects.length * 90 + 100}vh` }}>
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden pt-16">
        <motion.div style={{ x, paddingLeft: `${PAD}vw`, columnGap: `${GAP}vw` }} className="flex w-max items-center">
          <div style={{ width: `${LEAD}vw` }} className="shrink-0">
            <Heading />
          </div>
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={`/project/${p.slug}`}
              style={{ width: `${PANEL}vw` }}
              className="group block shrink-0"
            >
              <div className="relative h-[50dvh] overflow-hidden rounded-3xl border border-white/10 bg-black">
                <Image
                  src={p.featuredImage}
                  alt={`${p.name} screenshot`}
                  fill
                  sizes="62vw"
                  className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
              </div>
              <Meta p={p} />
            </Link>
          ))}
          <div style={{ width: `${TAIL}vw` }} className="shrink-0">
            <MoreLink />
          </div>
        </motion.div>

        {/* Progress through the projects */}
        <div className="absolute inset-x-6 bottom-8 h-px bg-white/10 lg:inset-x-[6vw]">
          <motion.div style={{ scaleX: smooth }} className="h-full origin-left bg-brand" />
        </div>
      </div>
    </div>
  );
}

export default function WorkSection() {
  const reduce = useReducedMotion();
  return (
    <section id="work">
      {reduce ? <Stacked className="" /> : (
        <>
          <Stacked className="md:hidden" />
          <Pinned />
        </>
      )}
    </section>
  );
}
