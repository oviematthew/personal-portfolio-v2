"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";

const LINKS = [
  { href: "/#work", label: "work" },
  { href: "/#about", label: "about" },
  { href: "/blog", label: "writing" },
  { href: "/#contact", label: "contact" },
  { href: "https://drive.google.com/uc?export=download&id=1PzRW7u4C7Iq51PgM5KTSWs_EIQxsjS54", label: "resume", external: true },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#171717]/75 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight" onClick={() => setMenuOpen(false)}>
          ovie<span className="text-brand">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-[15px] text-neutral-300">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} target={l.external ? "_blank" : undefined} className="nav-link hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="md:hidden cursor-pointer"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu Toggle"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Scroll progress: shows how far through the page you are */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute bottom-[-1px] left-0 h-px w-full origin-left bg-brand"
      />

      {menuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] bg-[#171717] flex flex-col justify-center gap-8 px-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              onClick={() => setMenuOpen(false)}
              className="text-5xl font-semibold tracking-tighter hover:text-brand transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
