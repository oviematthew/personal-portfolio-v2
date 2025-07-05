import projectsData from "../../data/projects.json";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

// ✅ 1. Add dynamic metadata
export async function generateMetadata({ params }) {
  // await params first as required in nextjs14+
  const { slug } = await params;

  const project = projectsData.find((p) => p.slug === params.slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `Project: ${project.name}`,
    description: project.description,
  };
}

export async function generateStaticParams() {
  return projectsData.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = projectsData.find((p) => p.slug === slug);

  if (!project) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="title-section flex items-center justify-between mb-6 ">
        <div className="back-link hover:scale-95">
          <Link
            href="/#projects"
            className="flex items-center gap-2 text-gray-300 text-sm md:text-md hover:scale-95"
          >
            <ArrowLeft className="text-gray-300" />
            <span className="hidden md:flex">Back</span>
          </Link>
        </div>

        <div className="title">
          <h1 className="text-lg md:text-3xl font-bold font-heading">
            {project.name}
          </h1>
        </div>

        <div className="forward-link hover:scale-95">
          <Link
            href={project.live}
            target="_blank"
            className="ml-auto flex items-center gap-2 text-gray-300 text-sm md:text-md "
          >
            Visit
            <ArrowUpRight className="text-gray-300" />
          </Link>
        </div>
      </div>
      <p className="text-sm text-center italic text-gray-400 mb-5">
        Job Type: {project.jobType}
      </p>

      <p className="text-gray-300 mb-10 font-text text-center md:text-start">
        {project.longDescription}
      </p>
      <div className="flex justify-center flex-wrap gap-4 mb-10">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="featuredImage">
        <Image
          src={project.featuredImage}
          alt={`${project.name} featured image`}
          width={1200}
          height={800}
          className="rounded-lg mb-6"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM3NDE1MSIvPjwvc3ZnPg=="
        />
      </div>

      <h2 className="text-lg text-center font-bold text-gray-300 mb-5 mt-10">
        More Screenshot(s)
      </h2>

      <div className="grid grid-cols-1 place-items-center gap-4">
        {project.images.map((img, index) => (
          <Image
            key={index}
            src={img}
            alt={`${project.name} screenshot ${index + 1}`}
            width={600}
            height={400}
            className="rounded"
            unoptimized={project.featuredImage.endsWith(".gif")} // Important: disables Next.js optimization for GIFs
          />
        ))}
      </div>
    </div>
  );
}
