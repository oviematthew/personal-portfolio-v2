import projectsData from "../../data/projects.json";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return projectsData.map((project) => ({ slug: project.slug }));
}

export default function ProjectPage({ params }) {
  const project = projectsData.find((p) => p.slug === params.slug);

  if (!project) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
      <p className="text-gray-300 mb-6">{project.description}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {project.images.map((img, index) => (
          <Image
            key={index}
            src={img}
            alt={`${project.name} screenshot ${index + 1}`}
            width={600}
            height={400}
            className="rounded"
          />
        ))}
      </div>
    </div>
  );
}
