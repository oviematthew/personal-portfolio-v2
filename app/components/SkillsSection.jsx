"use client";
import React from "react";

const skills = [
  // Languages & Fundamentals
  "HTML5",
  "CSS3",
  "JavaScript (ES6+)",
  "TypeScript",
  "Swift",
  "Kotlin",
  "Java",
  "Object Oriented Programming (OOP)",
  "MVC",
  "MVVM",

  // Frameworks & Libraries
  "React",
  "Next.js",
  "React Native",
  "Expo",
  "Node.js",
  "Express.js",
  "Tailwind CSS",
  "Bootstrap",
  "Sass",
  "Material UI",
  "Shadcn",
  "Headless UI",
  "Framer Motion",
  "GSAP",
  "Onsen UI",
  "Responsive Design",
  "Accessibility",

  // State Management
  "Redux",
  "Context API",
  "Zustand",

  // Databases
  "Firebase",
  "Supabase",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "SQLite",

  // CMS & Platforms
  "WordPress",
  "Shopify",
  "Liquid",
  "Strapi",
  "Wix",

  // APIs & Data
  "GraphQL",
  "REST APIs",

  // Testing & QA
  "Jest",
  "Playwright",
  "A/B Testing",
  "User Testing",

  // Tools & Platforms
  "Git",
  "GitHub",
  "Docker",
  "Vercel",
  "Netlify",
  "Postman",
  "Figma",
  "Adobe XD",
  "Microsoft 365",
  "Slack",
  "Jira",
  "Asana",
  "Agile Methodologies",
  "CI/CD",
];

export default function SkillsSection() {
  return (
    <section id="skills" className="px-6 py-12 w-full lg:w-3/4 mx-auto">
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
