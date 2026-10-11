"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Reveal from "./Reveal";

const EASE = [0.16, 1, 0.3, 1];
const isGif = (src) => src.endsWith(".gif");

// Screenshot gallery with an accessible lightbox: arrows, keyboard, swipe and a thumbnail strip.
export default function Gallery({ images, captions = [], name, preview }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(null); // null = closed
  const [showAll, setShowAll] = useState(false);
  const [dir, setDir] = useState(1);
  const openerRef = useRef(null);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const stripRef = useRef(null);
  const open = index !== null;
  const count = images.length;

  const label = (i) => captions[i] ?? `${name} screenshot ${i + 1}`;

  const go = useCallback(
    (step) => {
      setDir(step);
      setIndex((i) => (i === null ? i : (i + step + count) % count));
    },
    [count],
  );
  const jump = (i) => {
    setDir(i > index ? 1 : -1);
    setIndex(i);
  };
  const close = useCallback(() => {
    setIndex(null);
    openerRef.current?.focus();
  }, []);

  // keyboard: arrows, Home/End, Escape, and a Tab trap so focus stays inside the dialog
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") return close();
      if (e.key === "ArrowRight") return go(1);
      if (e.key === "ArrowLeft") return go(-1);
      if (e.key === "Home") return setIndex(0);
      if (e.key === "End") return setIndex(count - 1);
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll("button:not([disabled])");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, go, count]);

  // lock page scroll while open and move focus into the dialog
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // keep the active thumbnail in view in the strip
  useEffect(() => {
    if (!open || !stripRef.current) return;
    stripRef.current.querySelector('[aria-current="true"]')?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [index, open, reduce]);

  // warm the next and previous images so arrowing feels instant
  useEffect(() => {
    if (!open) return;
    [1, -1].forEach((d) => {
      const src = images[(index + d + count) % count];
      if (!src || isGif(src)) return;
      const img = new window.Image();
      img.src = `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=80`;
    });
  }, [index, open, images, count]);

  const variants = {
    enter: (d) => ({ x: reduce ? 0 : d * 80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: reduce ? 0 : d * -80, opacity: 0 }),
  };

  return (
    <>
      <div
        className={
          // captioned galleries read in order, so use a row-by-row grid; the rest pack tightly in columns
          captions.length ? "mt-24 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2" : "mt-24 columns-1 gap-6 md:columns-2 [&>*]:mb-6"
        }
      >
        {images.slice(0, preview && !showAll ? preview : undefined).map((img, i) => (
          <Reveal key={img} className="break-inside-avoid">
            <figure>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`${label(i)}. Image ${i + 1} of ${count}. Open larger view`}
                onClick={(e) => {
                  openerRef.current = e.currentTarget;
                  setDir(1);
                  setIndex(i);
                }}
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 text-left"
              >
                <Image
                  src={img}
                  alt={label(i)}
                  width={1200}
                  height={800}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  unoptimized={isGif(img)}
                />
                <span
                  aria-hidden
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#171717]/80 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <Expand size={16} />
                </span>
              </button>
              {captions[i] && <figcaption className="mt-3 text-sm text-neutral-500">{captions[i]}</figcaption>}
            </figure>
          </Reveal>
        ))}
      </div>

      {preview && images.length > preview && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className="inline-flex h-12 cursor-pointer items-center rounded-full border border-white/20 px-8 text-[15px] text-white transition hover:border-white/50 hover:text-brand active:scale-[0.98]"
          >
            {showAll ? "Show fewer screenshots" : `Show all ${images.length} screenshots`}
          </button>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} screenshots`}
            className="fixed inset-0 z-[70] flex flex-col bg-black/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
          >
            <div className="flex items-center justify-between px-4 py-3 md:px-6" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm text-neutral-300" aria-live="polite">
                {index + 1} / {count}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close larger view"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:text-brand"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 md:px-20" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-2 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition-colors hover:text-brand md:left-5"
              >
                <ChevronLeft size={22} />
              </button>

              <AnimatePresence custom={dir} initial={false} mode="popLayout">
                <motion.div
                  key={index}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                  drag={reduce ? false : "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70) go(1);
                    else if (info.offset.x > 70) go(-1);
                  }}
                  className="relative h-full w-full touch-pan-y"
                >
                  <Image
                    src={images[index]}
                    alt={label(index)}
                    fill
                    sizes="100vw"
                    priority
                    unoptimized={isGif(images[index])}
                    className="select-none object-contain"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-2 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition-colors hover:text-brand md:right-5"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            <div className="px-4 pb-4 pt-3 md:px-6" onClick={(e) => e.stopPropagation()}>
              <p className="mx-auto min-h-[2.5rem] max-w-3xl text-center text-sm leading-snug text-neutral-300 md:text-base">{captions[index] ?? label(index)}</p>
              <div ref={stripRef} className="mx-auto mt-3 flex max-w-full gap-2 overflow-x-auto pb-2 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin]" role="group" aria-label="Choose a screenshot">
                {images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => jump(i)}
                    aria-label={`Show image ${i + 1}: ${label(i)}`}
                    aria-current={i === index ? "true" : undefined}
                    className={`relative h-14 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition ${
                      i === index ? "border-brand opacity-100" : "border-white/15 opacity-50 hover:opacity-90"
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="96px" className="object-cover" unoptimized={isGif(img)} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
