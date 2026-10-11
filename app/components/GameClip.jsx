"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { canPlayWebm } from "../utils/media";

// Looping gameplay clip. Behaves like a GIF (muted, loops, no controls) but is a real video, so it is
// crisp and small. Pausable, and starts paused for visitors who prefer reduced motion (WCAG 2.2.2).
// Falls back to the animated GIF, then to the still, where WebM is not supported.
export default function GameClip({ video, gif, poster, name, priority = false }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [useGif, setUseGif] = useState(!video);
  const [shown, setShown] = useState(false); // the video has really started, so hide the poster

  useEffect(() => {
    if (video && !canPlayWebm()) setUseGif(true);
  }, [video]);

  useEffect(() => {
    if (useGif) return;
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    if (!r && ref.current) ref.current.play().then(() => setPlaying(true)).catch(() => {});
  }, [useGif]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
    else {
      v.pause();
      setPlaying(false);
    }
  };

  if (useGif) {
    return gif ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={gif} alt={`${name} gameplay, animated`} className="absolute inset-0 h-full w-full object-cover" decoding="async" />
    ) : (
      <Image src={poster} alt={`${name} gameplay, still frame`} fill priority={priority} sizes="(min-width: 1400px) 1352px, 100vw" className="object-cover" />
    );
  }

  return (
    <>
      {/* The still stays up until playback has truly started, so a clip that opens on a black frame never shows it */}
      <Image src={poster} alt={`${name} gameplay, still frame`} fill priority={priority} sizes="(min-width: 1400px) 1352px, 100vw" className="object-cover" />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload={priority ? "auto" : "metadata"}
        poster={poster}
        aria-label={`${name} gameplay clip`}
        onError={() => setUseGif(true)}
        onPlaying={() => setShown(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`}
      >
        {video.webm && <source src={video.webm} type="video/webm" />}
        {video.mp4 && <source src={video.mp4} type="video/mp4" />}
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause the ${name} gameplay clip` : `Play the ${name} gameplay clip`}
        className="absolute bottom-4 right-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#171717]/80 text-white backdrop-blur transition hover:text-brand"
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      {reduced && !playing && <span className="sr-only">Autoplay is off because your system prefers reduced motion.</span>}
    </>
  );
}
