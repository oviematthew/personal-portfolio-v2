"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const TEXT =
  "I'm a frontend and mobile developer in London, Ontario. Over five years I've shipped 200+ websites for 130+ clients across four continents. Today I build Vue applications at Rentsync, and I care about the details users feel but never see.";

function Word({ children, range, progress }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

export default function AboutSection() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const words = TEXT.split(" ");

  return (
    <section id="about" className="mx-auto max-w-[1400px] px-6 py-32 lg:py-48">
      <p ref={ref} className="max-w-5xl text-3xl font-medium leading-[1.2] tracking-tight sm:text-4xl lg:text-6xl">
        {words.map((w, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return reduce ? (
            <span key={i} className="mr-[0.25em] inline-block">{w}</span>
          ) : (
            <Word key={i} range={[start, end]} progress={scrollYProgress}>
              {w}
            </Word>
          );
        })}
      </p>

      <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-12 lg:mt-32">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-5 md:col-start-2"
        >
          <Image
            src="/media/matthew-ovie.jpg"
            alt="Matthew Ovie Enamuotor"
            width={800}
            height={600}
            className="h-auto w-full rounded-2xl object-cover"
          />
        </motion.div>

        <div className="flex flex-col justify-end gap-8 md:col-span-4 md:col-start-8 text-neutral-400 leading-relaxed">
          <p>
            B.Eng in Computer Engineering from{" "}
            <Link href="https://covenantuniversity.edu.ng" target="_blank" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-brand">
              Covenant University
            </Link>
            . Post Grad in Mobile Application Development from{" "}
            <Link href="https://www.fanshawec.ca" target="_blank" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-brand">
              Fanshawe College
            </Link>
            .
          </p>
          <p>
            Day to day I work with{" "}
            <Link href="https://rentsync.com" target="_blank" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-brand">
              Rentsync
            </Link>{" "}
            on high-quality, scalable web applications.
          </p>
        </div>
      </div>
    </section>
  );
}
