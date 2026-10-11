"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";

// Everything in the room that can be tapped, most useful first. Hints are drawn in this order and any dot
// that would land too close to an earlier one is skipped, so the scene never looks cluttered. As you tap
// things their dots retire, which lets the ones that were hidden for spacing appear.
const HINT_ORDER = [
  "tv", "sofa", "monitor", "cart", "record", "soundbar", "cabinet", "chair", "lamp", "lamp2", "plant", "table",
  "vertical", "laptop", "ring", "ps5desk", "ps5tv", "diffuser", "notes", "keyboard", "shelf", "photos", "mirror", "accent",
];
const HINT_GAP = 34; // minimum distance between two visible dots, in CSS pixels

// Mounts the three.js room as soon as the page hydrates, with a real staged loading percentage.
export default function RoomCanvas() {
  const hostRef = useRef(null);
  const roomRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [chip, setChip] = useState(null);
  const [sound, setSound] = useState(null); // "football" | "music" | null
  const [muted, setMuted] = useState(false);
  const [dotsOn, setDotsOn] = useState(false); // touch screens: glowing "tap me" dots
  const [visited, setVisited] = useState(() => new Set()); // objects already tapped
  const visitedRef = useRef(visited);
  const dotRefs = useRef({});
  const inView = useRef(true);
  const router = useRouter();
  const navTimer = useRef(null);
  const hideTimer = useRef(null);
  const overChip = useRef(false);
  // hovering away from an object hides its label after a short grace period, so you can move onto it and click
  const showChip = (meta) => {
    clearTimeout(hideTimer.current);
    if (meta) return setChip(meta);
    hideTimer.current = setTimeout(() => !overChip.current && setChip(null), 450);
  };

  // Clicking an object plays its little activity, then takes you where it points: a page section,
  // the blog, or (for the drawer) the resume, which the room already opened inside the click.
  // Navigation waits until he has walked there, so you actually see it happen (matters most on a phone,
  // where the page would otherwise scroll away mid-walk).
  const pending = useRef(null);
  const selectedAt = useRef(0);
  const navigate = (meta) => {
    if (meta.href.startsWith("/#")) {
      const el = document.getElementById(meta.href.slice(2));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", meta.href);
    } else {
      router.push(meta.href);
    }
  };
  const goTo = (meta) => {
    showChip(meta);
    clearTimeout(navTimer.current);
    selectedAt.current = performance.now();
    pending.current = meta?.href && !meta.external ? meta : null;
  };
  const arrived = (station) => {
    const meta = pending.current;
    if (!meta || meta.station !== station) return;
    pending.current = null;
    clearTimeout(navTimer.current);
    // if he was already there (no walk to watch), let the activity play for a moment before moving on
    const walked = performance.now() - selectedAt.current > 400;
    navTimer.current = setTimeout(() => navigate(meta), walked ? 800 : 1600);
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let ramp;

    const hasWebGL = () => {
      try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {
        return false;
      }
    };

    (async () => {
      if (!hasWebGL()) return setFailed(true);
      // Stage 1 (0 to ~70%): downloading the 3D engine. Eases toward 70 while the chunk arrives.
      let p = 0;
      ramp = setInterval(() => {
        p += (70 - p) * 0.09;
        setProgress(Math.round(p));
      }, 60);
      try {
        const { createRoom } = await import("./createRoom");
        clearInterval(ramp);
        if (cancelled) return;
        setProgress(78); // stage 2: building the room
        await new Promise((r) => requestAnimationFrame(() => r()));
        if (cancelled) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
        // dots are for anyone who may not be able to hover (phones, tablets, touch screens)
        const touch = isMobile || navigator.maxTouchPoints > 0;
        roomRef.current = createRoom(host, {
          reducedMotion: reduced,
          isMobile,
          onHover: (meta) => showChip(meta),
          onSelect: (meta) => {
            if (meta?.name) setVisited((prev) => new Set(prev).add(meta.name));
            goTo(meta);
          },
          onArrive: (station) => arrived(station),
          onAudio: (kind) => setSound(kind),
          onReady: () => {
            // stage 3: shaders compiled and the first frame drawn
            setProgress(100);
            setTimeout(() => !cancelled && setReady(true), 250);
            // once the intro camera move has settled, show what can be tapped (touch screens have no hover)
            if (touch) setTimeout(() => !cancelled && setDotsOn(true), 2200);
          },
        });
        setProgress((v) => Math.max(v, 90));
      } catch (err) {
        clearInterval(ramp);
        console.error("Room failed to load", err);
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(navTimer.current);
      clearInterval(ramp);
      roomRef.current?.dispose();
      roomRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chip) return;
    const t = setTimeout(() => !overChip.current && setChip(null), 4500);
    return () => clearTimeout(t);
  }, [chip]);

  useEffect(() => {
    visitedRef.current = visited;
  }, [visited]);

  // Pin each dot to its object every frame (the view can be panned with a finger drag), skipping any
  // that would sit within HINT_GAP of a higher-priority dot.
  useEffect(() => {
    if (!dotsOn) return;
    const host = hostRef.current;
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting));
    if (host) io.observe(host);
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const room = roomRef.current;
      if (!room || document.hidden || !inView.current) return;
      const placed = [];
      for (const h of room.hotspots(HINT_ORDER)) {
        const el = dotRefs.current[h.name];
        if (!el) continue;
        const show = h.on && !visitedRef.current.has(h.name) && !placed.some((p) => Math.hypot(p.x - h.x, p.y - h.y) < HINT_GAP);
        if (show) {
          placed.push(h);
          el.style.transform = `translate3d(${h.x}px, ${h.y}px, 0)`;
          el.style.opacity = "1";
        } else {
          el.style.opacity = "0";
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [dotsOn]);

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    roomRef.current?.setMuted(m);
  };

  const chipClass =
    "absolute z-10 inline-flex -translate-x-1/2 -translate-y-[130%] items-center gap-1 whitespace-nowrap rounded-full bg-[#171717]/90 px-3.5 py-1.5 text-sm font-medium text-white shadow-lg ring-1 ring-white/15 backdrop-blur";

  return (
    <div className="absolute inset-0">
      <div ref={hostRef} className={`h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`} />

      {/* Loading state */}
      {!ready && !failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" role="status" aria-live="polite">
          <p className="text-sm text-neutral-400">Setting up the living room</p>
          <p className="font-mono-ui text-5xl font-semibold tabular-nums tracking-tight md:text-6xl">{progress}%</p>
          <div className="h-[3px] w-48 overflow-hidden rounded-full bg-white/10" aria-hidden>
            <div className="h-full bg-brand transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Touch screens have no hover: glowing dots show what can be tapped, without crowding the scene */}
      {dotsOn &&
        HINT_ORDER.filter((n) => !visited.has(n)).map((n, i) => (
          <span
            key={n}
            ref={(el) => {
              if (el) dotRefs.current[n] = el;
              else delete dotRefs.current[n];
            }}
            aria-hidden
            className="hint-dot z-10"
            style={{ opacity: 0, "--d": `${(i % 6) * 0.4}s` }}
          >
            <b />
            <i />
          </span>
        ))}

      {failed && <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(241,90,36,0.14),transparent)]" />}

      {chip &&
        (chip.href ? (
          <Link
            href={chip.href}
            target={chip.external ? "_blank" : undefined}
            className={`${chipClass} transition-colors hover:text-brand`}
            style={{ left: chip.x, top: chip.y }}
            onMouseEnter={() => {
              overChip.current = true;
              clearTimeout(hideTimer.current);
            }}
            onMouseLeave={() => {
              overChip.current = false;
              showChip(null);
            }}
          >
            {chip.label}
            <ArrowUpRight size={14} />
          </Link>
        ) : (
          <span className={`${chipClass} pointer-events-none`} style={{ left: chip.x, top: chip.y }}>
            {chip.label}
          </span>
        ))}

      {/* Sound control appears only while the football or the record is playing */}
      {sound && (
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          className="absolute bottom-4 right-4 z-10 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-[#171717]/80 px-4 text-sm text-white backdrop-blur transition-colors hover:text-brand"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {muted ? "Sound off" : sound === "football" ? "Matchday sound" : sound === "afro" ? "Afrobeats on" : "Now playing"}
        </button>
      )}
    </div>
  );
}
