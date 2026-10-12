"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import MergingGreeting from "./MergingGreeting";
import { Volume2, ArrowDown, Download, MousePointerClick } from "lucide-react";
import RoomCanvas from "./room/RoomCanvas";

const EASE = [0.16, 1, 0.3, 1];
const RESUME = "https://drive.google.com/uc?export=download&id=1PzRW7u4C7Iq51PgM5KTSWs_EIQxsjS54";

export default function HeroSection() {
  const reduce = useReducedMotion();
  // everything except the greeting fades as you scroll, so nothing collides with the greeting on its way down
  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, 260], [1, 0]);
  const playName = () => new Audio("/media/name.mp3").play();
  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <section className="flex flex-col md:h-[calc(100dvh-4rem)] md:min-h-[640px]">
      {/* The room gets its own band above the text, so the two never overlap */}
      <div className="relative h-[64dvh] min-h-[400px] overflow-hidden md:h-auto md:min-h-0 md:flex-1">
        <RoomCanvas />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#171717] to-transparent" />
        <motion.p
          {...rise(1.2)}
          className="pointer-events-none absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-[#171717]/80 px-4 py-2 text-sm text-neutral-300 backdrop-blur md:left-auto md:right-6 md:top-4 md:translate-x-0"
        >
          <MousePointerClick size={16} className="text-brand" />
          My actual living room. Click around.
        </motion.p>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-6 pb-8 pt-2 lg:pb-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <motion.div style={{ opacity: reduce ? 1 : fade }}>
              <motion.p {...rise(0.1)} className="text-sm text-neutral-400 md:text-base">
                Matthew Ovie Enamuotor
              </motion.p>
            </motion.div>
            <motion.div {...rise(0.2)} className="mt-1">
              <MergingGreeting />
            </motion.div>
            <motion.div style={{ opacity: reduce ? 1 : fade }}>
              <motion.p {...rise(0.35)} className="mt-3 max-w-xl text-base leading-relaxed text-neutral-300 md:text-lg">
                A frontend engineer building fast, accessible web and mobile experiences.
              </motion.p>
            </motion.div>
          </div>

          <motion.div style={{ opacity: reduce ? 1 : fade }}>
          <motion.div {...rise(0.5)} className="flex flex-wrap items-center gap-2 md:gap-3">
            <Link
              href="#work"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-brand-cta px-6 text-[15px] font-medium text-white transition hover:bg-brand active:scale-[0.98] md:h-12 md:gap-3 md:px-7"
            >
              See work
              <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
            </Link>
            <Link
              href={RESUME}
              target="_blank"
              className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-6 text-[15px] font-medium text-white transition hover:border-white/50 active:scale-[0.98] md:h-12 md:gap-3 md:px-7"
            >
              Resume
              <Download size={16} className="transition-transform group-hover:translate-y-0.5" />
            </Link>
            <button
              onClick={playName}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-[15px] text-neutral-400 transition-colors hover:text-brand md:h-12"
              aria-label="Hear how to pronounce Ovie"
            >
              <Volume2 size={18} />
              <span className="hidden sm:inline">How to say it</span>
            </button>
          </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
