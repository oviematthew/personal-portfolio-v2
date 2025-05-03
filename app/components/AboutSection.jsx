"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutSection() {
  return (
    <motion.section
      id="about"
      className="min-h-screen mx-auto w-full max-w-6xl px-6 py-16 mt-10"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.4 }}
    >
      <div className="about-container flex flex-col md:flex-row items-center gap-8">
        {/* Text section */}
        <div className="left-about w-full md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 border-brand inline-block font-heading text-white">
            About Me <span className="text-brand">.</span>
          </h2>

          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            Hi! I’m <strong>Matthew Ovie Enamuotor</strong>, a Frontend and
            Mobile Developer based in London, Ontario, Canada. I studied{" "}
            <strong>Computer Engineering</strong>{" "}
            <Link
              href="https://covenantuniversity.edu.ng"
              className="text-brand hover:underline"
              target="_blank"
            >
              @Covenant University
            </Link>{" "}
            and recently graduated from{" "}
            <Link
              href="https://www.fanshawec.ca"
              className="text-brand hover:underline"
              target="_blank"
            >
              @Fanshawe College
            </Link>{" "}
            with a major in Mobile Application Development.
          </p>

          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            Over the past 5 years, I’ve worked as a freelance web developer,
            building over <strong>200 websites</strong> for more than{" "}
            <strong>130 clients</strong> across <strong>4 continents</strong>. I
            love crafting clean, high performing, and accessible interfaces that
            blend form and function.
          </p>

          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            My most recent full time position was{" "}
            <Link
              href="https://boas.co"
              className="text-brand hover:underline"
              target="_blank"
            >
              @Boas
            </Link>
            , where I worked as a frontend developer working with Liquid on
            Shopify to build and maintain quick, responsive, accessible and
            impactful digital experiences.
          </p>

          <p className="text-lg text-gray-300 leading-relaxed">
            I’m a curious problem solver, passionate about beautiful UI and
            intuitive UX. I continuously strive to improve my skills — one
            project at a time.
          </p>
        </div>

        {/* Image section */}
        <div className="right-about w-full md:w-1/2 p-6 rounded-lg flex justify-center items-center">
          <Image
            src="/media/matthew-ovie.jpg"
            alt="Matthew Ovie Enamuotor"
            width={800}
            height={600}
            className="w-full h-[80%] object-cover rounded-sm shadow-lg"
            priority
          />
        </div>
      </div>
    </motion.section>
  );
}
