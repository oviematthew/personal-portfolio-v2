"use client";

import { useEffect, useState } from "react";
import { canPlayWebm } from "../utils/media";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import projects from "../data/projects.json";

const MORE = "https://github.com/oviematthew";
const EASE = [0.16, 1, 0.3, 1];

// Where each screenshot is anchored inside its frame, so every crop shows the interesting part.
const FOCUS = {
  "chattee-app": "50% 42%",
  "from-ashes": "50% 55%",
};

// Alternating 7/5 and 5/7 column spans give the grid rhythm while every frame keeps the same height.
// The first project is the headline: full width and taller. The rest alternate 7/5 and 5/7.
const SPAN = ["lg:col-span-12", "lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7", "lg:col-span-7", "lg:col-span-5"];

function Card({ p, i, reduce }) {
  const featured = i === 0;
  // gameplay gif is heavy, so it is only fetched the first time the card is hovered or focused
  const [playing, setPlaying] = useState(false);
  const [webm, setWebm] = useState(true);
  useEffect(() => setWebm(canPlayWebm()), []);
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay: (i % 2) * 0.08, ease: EASE }}
      className={SPAN[i % SPAN.length]}
    >
      <Link
        href={`/project/${p.slug}`}
        className="group block"
        onPointerEnter={() => (p.video || p.gif) && setPlaying(true)}
        onFocus={() => (p.video || p.gif) && setPlaying(true)}
      >
        <div className={`relative h-64 overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e0e] sm:h-80 ${featured ? "lg:h-[36rem]" : "lg:h-[26rem]"}`}>
          <Image
            src={p.featuredImage}
            alt={`${p.name} project screenshot`}
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            style={{ objectPosition: FOCUS[p.slug] ?? "top" }}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            priority={featured}
          />
          {playing &&
            (p.video && webm ? (
              <video
                muted
                loop
                playsInline
                autoPlay
                aria-label={`${p.name} gameplay preview`}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              >
                {p.video.webm && <source src={p.video.webm} type="video/webm" />}
                {p.video.mp4 && <source src={p.video.mp4} type="video/mp4" />}
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.gif}
                alt={`${p.name} gameplay preview, animated`}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            ))}
        </div>

        <div className="mt-6 flex items-start justify-between gap-6">
          <div>
            <h3 className={`font-semibold tracking-tighter transition-colors duration-300 group-hover:text-brand ${featured ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"}`}>
              {p.name}
            </h3>
            <p className={`mt-2 text-neutral-400 ${featured ? "max-w-2xl text-lg" : "max-w-md"}`}>{p.description}</p>
            <p className="mt-3 text-sm text-neutral-500">{p.techStack.slice(0, 4).join(", ")}</p>
          </div>
          <ArrowUpRight
            size={32}
            strokeWidth={1.5}
            className="mt-1 shrink-0 text-neutral-500 transition duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand"
          />
        </div>
      </Link>
    </motion.article>
  );
}

export default function WorkSection() {
  const reduce = useReducedMotion();

  return (
    <section id="work" className="mx-auto max-w-[1400px] px-6 py-24 lg:py-40">
      <h2 className="mb-16 text-5xl font-semibold tracking-tighter md:text-8xl lg:mb-20">
        Selected work<span className="text-brand">.</span>
      </h2>

      <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-12 lg:gap-y-20">
        {projects.map((p, i) => (
          <Card key={p.slug} p={p} i={i} reduce={reduce} />
        ))}
      </div>

      <Link
        href={MORE}
        target="_blank"
        className="group mt-24 inline-flex items-center gap-4 text-4xl font-semibold tracking-tighter transition-colors hover:text-brand md:text-6xl"
      >
        More projects
        <ArrowUpRight
          className="h-9 w-9 transition duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 md:h-14 md:w-14"
          strokeWidth={1.25}
        />
      </Link>
    </section>
  );
}
