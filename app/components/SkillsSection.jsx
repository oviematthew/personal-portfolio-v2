import Reveal from "./Reveal";

const GROUPS = [
  {
    name: "Frontend",
    items: ["React", "Next.js", "Vue", "TypeScript", "Tailwind CSS", "Sass", "Motion", "GSAP", "Accessibility"],
  },
  { name: "Mobile", items: ["React Native", "Expo", "Swift", "Kotlin", "Java"] },
  {
    name: "Backend and data",
    items: ["Node.js", "Express", "GraphQL", "REST", "Supabase", "Firebase", "PostgreSQL", "MySQL", "MongoDB"],
  },
  { name: "CMS and commerce", items: ["Shopify", "Liquid", "Strapi", "WordPress"] },
  { name: "Quality and tooling", items: ["AI-assisted coding", "Playwright", "Jest", "Git", "Docker", "Vercel", "Figma", "CI/CD"] },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="mx-auto max-w-[1400px] px-6 py-32 lg:py-48">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="text-5xl font-semibold tracking-tighter md:text-8xl lg:sticky lg:top-32">
            Skills<span className="text-brand">.</span>
          </h2>
        </div>

        <div className="flex flex-col gap-14 lg:col-span-8">
          {GROUPS.map((g, gi) => (
            <Reveal key={g.name} delay={gi * 0.04}>
              <h3 className="mb-4 text-sm text-neutral-500">{g.name}</h3>
              <ul className="group/items flex flex-wrap gap-x-5 gap-y-1 text-3xl font-medium tracking-tight md:text-5xl">
                {g.items.map((item) => (
                  <li
                    key={item}
                    className="cursor-default text-white transition duration-300 group-hover/items:opacity-25 hover:!text-brand hover:!opacity-100"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
