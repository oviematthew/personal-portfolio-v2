import projectsData from "../../data/projects.json";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import Link from "next/link";
import Reveal from "../../components/Reveal";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projectsData.find((p) => p.slug === slug);

  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.name} | Matthew Ovie Enamuotor`,
    description: project.description,
  };
}

export async function generateStaticParams() {
  return projectsData.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const index = projectsData.findIndex((p) => p.slug === slug);
  if (index === -1) return notFound();

  const project = projectsData[index];
  const next = projectsData[(index + 1) % projectsData.length];

  return (
    <article className="mx-auto max-w-[1400px] px-6 pb-24">
      <Link
        href="/#work"
        className="group mt-10 inline-flex items-center gap-2 text-neutral-400 transition hover:text-white"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        All work
      </Link>

      <Reveal>
        <h1 className="mt-10 text-[clamp(3rem,10vw,10rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
          {project.name}
          <span className="text-brand">.</span>
        </h1>
      </Reveal>

      <Reveal delay={0.1} className="relative mt-14 aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-black md:aspect-[16/8]">
        <Image
          src={project.featuredImage}
          alt={`${project.name} featured image`}
          fill
          priority
          sizes="(min-width: 1400px) 1352px, 100vw"
          className="object-cover object-top"
        />
      </Reveal>

      <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <dl className="flex flex-col gap-8 lg:sticky lg:top-28">
            <div>
              <dt className="text-sm text-neutral-500">Engagement</dt>
              <dd className="mt-1 text-lg">{project.jobType}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Stack</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {project.techStack.map((t) => (
                  <span key={t} className="rounded-full border border-white/15 px-3 py-1 text-sm text-neutral-300">
                    {t}
                  </span>
                ))}
              </dd>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={project.live}
                target="_blank"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-cta px-7 text-[15px] font-medium text-white transition hover:bg-brand active:scale-[0.98]"
              >
                Visit site
                <ArrowUpRight size={16} />
              </Link>
              {project.github && (
                <Link
                  href={project.github}
                  target="_blank"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-7 text-[15px] transition hover:border-white/40 active:scale-[0.98]"
                >
                  <Github size={16} />
                  Code
                </Link>
              )}
            </div>
          </dl>
        </aside>

        <Reveal className="space-y-6 text-xl leading-relaxed text-neutral-300 lg:col-span-8 md:text-2xl">
          {project.longDescription.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </Reveal>
      </div>

      {project.images.length > 0 && (
        <div className="mt-24 columns-1 gap-6 md:columns-2 [&>*]:mb-6">
          {project.images.map((img, i) => (
            <Reveal key={img} className="break-inside-avoid">
              <Image
                src={img}
                alt={`${project.name} screenshot ${i + 1}`}
                width={1200}
                height={800}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="h-auto w-full rounded-2xl border border-white/10"
              />
            </Reveal>
          ))}
        </div>
      )}

      <Link
        href={`/project/${next.slug}`}
        className="group mt-28 block border-t border-white/10 pt-10"
      >
        <p className="text-sm text-neutral-500">Next project</p>
        <p className="mt-3 flex items-center justify-between gap-6 text-5xl font-semibold tracking-tighter transition-colors group-hover:text-brand md:text-8xl">
          {next.name}
          <ArrowUpRight className="h-10 w-10 shrink-0 transition duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 md:h-20 md:w-20" strokeWidth={1.25} />
        </p>
      </Link>
    </article>
  );
}
