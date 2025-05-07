"use client";
import React from "react";

const skills = {
  Languages: [
    "HTML5",
    "CSS3",
    "JavaScript (ES6+)",
    "TypeScript",
    "Swift",
    "Kotlin",
    "Java",
  ],
  Frameworks: [
    "React",
    "Next.js",
    "React Native",
    "Expo",
    "Node.js",
    "Express.js",
  ],
  Styling: [
    "Tailwind CSS",
    "Bootstrap",
    "Material UI",
    "Shadcn",
    "Headless UI",
    "Framer Motion",
    "GSAP",
    "Responsive Design",
    "Accessibility",
  ],
  Databases: ["Firebase", "PostgreSQl", "MySQL", "MongoDB"],
  CMS_Ecom: ["Wordpress", "Shopify", "Liuqid"],
  APIs: ["GraphQL", "REST APIs"],
  Tools: [
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
  ],
};

export default function SkillsSection() {
  const allSkills = Object.values(skills).flat();

  const groupedSkills = [
    allSkills.slice(0, 15), // Row 1
    allSkills.slice(15, 31), // Row 2
    allSkills.slice(31), // Row 3
  ];

  return (
    <section id="skills" className="px-6 py-12 w-full mx-auto">
      <h2 className="text-3xl font-bold text-white text-center mb-8 font-heading">
        My Skills <span className="text-brand">.</span>
      </h2>

      {/* Mobile: all pills in one column */}
      <div className="flex flex-wrap gap-3 justify-center md:hidden">
        {allSkills.map((skill) => (
          <span
            key={skill}
            className="whitespace-nowrap bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-full border border-white/20 hover:bg-brand/90 hover:text-white transition"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Desktop: 3 horizontal rows */}
      <div className="hidden md:flex flex-col gap-4">
        {groupedSkills.map((row, idx) => (
          <div key={idx} className="flex gap-3 justify-center flex-wrap py-2">
            {row.map((skill) => (
              <span
                key={skill}
                className="whitespace-nowrap bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-full border border-white/20 hover:bg-brand/90 hover:text-white transition"
              >
                {skill}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
