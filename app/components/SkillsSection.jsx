"use client";
import React from "react";

const skills = [
  "HTML5",
  "CSS3",
  "JavaScript (ES6+)",
  "TypeScript",
  "Swift",
  "Kotlin",
  "Java",
  "React",
  "Next.js",
  "React Native",
  "Expo",
  "Node.js",
  "Express.js",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Shadcn",
  "Headless UI",
  "Framer Motion",
  "GSAP",
  "Responsive Design",
  "Accessibility",
  "Firebase",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Wordpress",
  "Shopify",
  "Liuqid",
  "GraphQL",
  "REST APIs",
  "Redux",
  "Git",
  "GitHub",
  "Figma",
  "Jest",
  "Playwright",
  "Docker",
  "Vercel",
  "Netlify",
  "Agile Methodologies",
];

export default function SkillsSection() {
  return (
    <section id="skills" className="px-6 py-12 w-full mx-auto ">
      <h2 className="text-3xl font-bold text-white text-center mb-8 font-heading">
        My Skills <span className="text-brand">.</span>
      </h2>

      <div className="flex flex-wrap justify-center gap-3">
        {skills.map((skill) => (
          <span
            key={skill}
            className="whitespace-nowrap bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-full border border-white/20 hover:bg-brand/90 hover:text-white transition"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
