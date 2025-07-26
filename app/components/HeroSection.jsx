"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { Volume2, ChevronDown } from "lucide-react";
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa6";
import GitHubCalendar from "react-github-calendar";

export default function HeroSection() {
  const handleClick = () => {
    const audio = new Audio("/media/name.mp3");
    audio.play();
  };

  return (
    <div className="lg:max-h-screen w-full lg:w-1/2 mx-auto px-6 flex items-center justify-center mt-10 ">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        {/* Profile Image */}
        <div className="hero-top flex space-between items-center flex-col md:flex-row w-[100%] gap-5 ">
          <div className="left-hero-top md:w-[50%] flex justify-center">
            <div className="rounded-full w-52 h-52 mb-6 bg-brand overflow-hidden ">
              <Image
                src="/media/welcome.png"
                alt="Matthew Ovie Enamuotor"
                width={208}
                height={208}
                className="w-52 h-52 object-cover"
                priority
              />
            </div>
          </div>

          {/* Heading with audio icon */}
          <div className="right-hero-top md:w-[50%]">
            <div className="flex justify-center md:justify-start gap-x-3 mb-2">
              <h1 className="text-xl md:text-3xl font-extrabold text-white font-heading flex">
                Hey, I'm Ovie
              </h1>
              <button
                onClick={handleClick}
                className="p-2 cursor-pointer rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label="Hear how to pronounce Ovie"
              >
                <Volume2 className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Description */}
            <p className=" text-lg md:text-xl text-gray-400 mt-2 text-center md:text-left ">
              I am a minimalist that specializes in building fast, responsive,
              accessible, and user-prioritzed frontend web & mobile app
              experiences.
            </p>
          </div>
        </div>

        {/* GitHub Calendar */}
        <div className="mt-5 md:mt-10 hidden md:block">
          <GitHubCalendar
            username="oviematthew"
            theme={{
              light: ["#ebedf0", "#fbd4b4", "#F15A23", "#F15A23", "#F15A23"],
              dark: ["#1c1c1c", "#fbd4b4", "#F15A23", "#F15A23", "#F15A23"],
            }}
          />
        </div>

        {/* Social Media Links */}
        <div className="social-links mt-5 mb-5 flex gap-6">
          <Link
            href="https://github.com/oviematthew"
            target="_blank"
            aria-label="GitHub"
            className="text-white hover:text-brand hover:scale-95 transition duration-300"
          >
            <FaGithub size={25} />
          </Link>

          <Link
            href="https://www.linkedin.com/in/matthew-ovie-enamuotor-9992b6132/"
            target="_blank"
            aria-label="LinkedIn"
            className="text-white hover:text-brand hover:scale-95 transition duration-300"
          >
            <FaLinkedin size={25} />
          </Link>

          <Link
            href="mailto:hello@oviematthew.com"
            aria-label="Email"
            className="text-white hover:text-brand hover:scale-95 transition duration-300"
          >
            <FaEnvelope size={25} />
          </Link>
        </div>

        {/* Call-to-Action */}
        <div className="mt-2">
          <Link
            href="#projects"
            className="inline-flex items-center gap-x-2 px-4 py-3 text-md font-semibold text-white bg-brand hover:bg-brand/90 hover:scale-95 transition duration-300 ease-in-out italic"
          >
            View Projects
            <ChevronDown className="w-5 h-5 animate-pulse" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
