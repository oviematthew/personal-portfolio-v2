"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { Volume2, ChevronDown } from "lucide-react";

export default function HeroSection() {
  const handleClick = () => {
    const audio = new Audio("/media/name.mp3");
    audio.play();
  };

  return (
    <div className="h-screen w-full mx-auto px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        {/* Profile Image */}
        <div className="rounded-full w-52 h-52 mb-6 bg-brand overflow-hidden">
          <Image
            src="/media/welcome.png"
            alt="Matthew Ovie Enamuotor"
            width={208}
            height={208}
            className="w-52 h-52 object-cover"
            priority
          />
        </div>

        {/* Heading with audio icon */}
        <div className="flex items-center gap-x-3 mb-2">
          <h1 className="text-xl md:text-3xl font-extrabold text-white font-heading flex">
            Hey, I'm Ovie
          </h1>
          <button
            onClick={handleClick}
            className="p-2 cursor-pointer rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Hear how to pronounce Ovie"
          >
            <Volume2 className="w-6 h-6 text-white animate-pulse" />
          </button>
        </div>

        {/* Description */}
        <p className="mt-2 text-base text-gray-400 max-w-md">
          I specialize in building fast, accessible, and user-focused frontend &
          mobile experiences. Clean code, intuitive UX, and performance are my
          top priorities.
        </p>

        {/* Call-to-Action */}
        <div className="mt-6">
          <Link
            href="#projects"
            className="inline-flex items-center gap-x-2 px-4 py-3 text-md font-semibold text-white bg-brand hover:bg-brand/90 hover:scale-95 transition duration-300 ease-in-out italic"
          >
            View Projects
            <ChevronDown className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
