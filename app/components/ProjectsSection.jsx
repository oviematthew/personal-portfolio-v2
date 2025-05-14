"use client";
import React, { useState } from "react";
import projectsData from "../data/projects.json";
import Link from "next/link";
import Image from "next/image";

const FILTERS = ["all", "web", "mobile"];

export default function ProjectsSection() {
  const [visible, setVisible] = useState(6);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const filteredProjects = projectsData.filter((project) =>
    filter === "all" ? true : project.type === filter
  );

  const displayedProjects = filteredProjects.slice(0, visible);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisible((prev) => prev + 3);
      setLoading(false);
    }, 200); // simulate loading for images
  };

  const handleFilter = (f) => {
    setFilter(f);
    setVisible(6);
  };

  return (
    <section
      id="projects"
      className="min-h-screen max-w-6xl mx-auto px-6 py-30 lg:py-40 mt-10"
    >
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-white font-heading">
          My Projects <span className="text-brand">.</span>
        </h2>

        <div className="filters flex gap-2 md:gap-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-4 py-2 border cursor-pointer ${
                filter === f
                  ? "bg-brand text-white"
                  : "text-gray-300 border-gray-600 hover:scale-95"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Project cards */}
        {displayedProjects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group relative bg-white/5 rounded-xl overflow-hidden shadow hover:shadow-xl transition-transform transform hover:-translate-y-1 hover:scale-[1.01] duration-300"
          >
            <div className="relative w-full h-64 overflow-hidden bg-black">
              <Image
                src={project.featuredImage}
                alt={project.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className={`w-full h-full ${
                  project.type === "mobile" ? "object-contain" : "object-cover"
                } group-hover:scale-105 transition duration-300`}
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-bold text-white group-hover:text-brand transition">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center flex-wrap gap-2 mt-5">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{project.techStack.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="rounded-xl bg-white/5 h-[400px] animate-pulse"
            >
              <div className="h-64 bg-gray-700 w-full rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-600 rounded w-2/3" />
                <div className="h-3 bg-gray-600 rounded w-full" />
                <div className="h-3 bg-gray-600 rounded w-5/6" />
                <div className="flex gap-2 mt-4">
                  <div className="w-14 h-5 bg-gray-600 rounded-full" />
                  <div className="w-16 h-5 bg-gray-600 rounded-full" />
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Load more button */}
      {!loading && visible < filteredProjects.length && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="cursor-pointer inline-flex items-center gap-x-2 px-4 py-3 text-md font-semibold text-white bg-brand hover:bg-brand/90 hover:scale-95 transition duration-300 ease-in-out italic"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
