"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Volume2, ArrowDown, Download } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

function Word({ text, delay, reduce }) {
  return (
    <span className="inline-flex overflow-hidden pb-[0.08em] -mb-[0.08em]">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={reduce ? false : { y: "110%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, delay: delay + i * 0.045, ease: EASE }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}

export default function HeroSection() {
  const reduce = useReducedMotion();

  // Portrait leans toward the pointer. Motion values, so no React re-renders.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [12, -12]);

  const onMove = (e) => {
    if (reduce) return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const playName = () => new Audio("/media/name.mp3").play();

  return (
    <section
      onPointerMove={onMove}
      className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1400px] flex-col justify-end px-6 pb-14 pt-24"
    >
      <motion.div
        style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
        initial={reduce ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: EASE }}
        className="absolute right-6 top-12 w-36 sm:w-48 lg:right-16 lg:top-12 lg:w-56 xl:w-72"
      >
        <Image
          src="/media/welcome.png"
          alt="Matthew Ovie Enamuotor"
          width={416}
          height={416}
          priority
          className="h-auto w-full"
        />
      </motion.div>

      <h1 className="font-heading text-[clamp(2.75rem,min(10vw,17dvh),10rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
        <span className="block"><Word text="Matthew Ovie" delay={0.1} reduce={reduce} /></span>
        <span className="block">
          <Word text="Enamuotor" delay={0.35} reduce={reduce} />
          <span className="text-brand">.</span>
        </span>
      </h1>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
        className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
      >
        <p className="max-w-md text-lg leading-relaxed text-neutral-400">
          Frontend engineer building fast, accessible web and mobile experiences.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={playName}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white transition hover:border-brand hover:text-brand active:scale-95"
            aria-label="Hear how to pronounce Ovie"
          >
            <Volume2 size={18} />
          </button>
          <Link
            href="#work"
            className="group inline-flex h-12 items-center gap-3 rounded-full bg-brand-cta px-7 text-[15px] font-medium text-white transition hover:bg-brand active:scale-[0.98]"
          >
            See work
            <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
          </Link>
          <Link
            href="https://drive.google.com/uc?export=download&id=1PzRW7u4C7Iq51PgM5KTSWs_EIQxsjS54"
            target="_blank"
            className="group inline-flex h-12 items-center gap-3 rounded-full border border-white/15 px-7 text-[15px] font-medium text-white transition hover:border-white/40 active:scale-[0.98]"
          >
            Resume
            <Download size={16} className="transition-transform group-hover:translate-y-0.5" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
