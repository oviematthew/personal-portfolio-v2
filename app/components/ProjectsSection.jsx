"use client";
import React, { useState } from "react";
import projectsData from "../data/projects.json";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const FILTERS = ["all", "web", "mobile"];

export default function ProjectsSection() {
  const [visible, setVisible] = useState(6);
  const [filter, setFilter] = useState("all"); // Default filter is "all"

  //   Filter projects based on the selected filter
  const filteredProjects = projectsData.filter((project) =>
    filter === "all" ? true : project.type === filter
  );

  //   Limit the number of projects displayed based on the "visible" state
  const displayedProjects = filteredProjects.slice(0, visible);

  return (
    //   Motion section for animation
    // animation works when the section is in view on every scroll (once:false)
    <section
      id="projects"
      className="min-h-screen max-w-6xl mx-auto px-6 py-30 lg:py-40 mt-10 "
    >
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-white font-heading">
          My Projects <span className="text-brand">.</span>
        </h2>

        {/* Filter Button based on project type */}
        <div className="filters flex gap-2 md:gap-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setVisible(6);
              }}
              className={`px-4 py-2  border cursor-pointer ${
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
        {displayedProjects.map((project) => (
          // Each project card
          // The key is the project slug to ensure uniqueness
          // The Link component wraps the entire card for easy navigation to dynamic routes
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group relative bg-white/5 rounded-xl overflow-hidden shadow hover:shadow-xl transition-transform transform hover:-translate-y-1 hover:scale-[1.01] duration-300"
          >
            {/* Image with sizing conditions */}
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

            {/* Project details */}
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-bold text-white group-hover:text-brand transition">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {project.description}
              </p>

              <div className="flex items-center flex-wrap gap-2 mt-3">
                {project.techStack.slice(0, 2).map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
                {/* Show the number of additional tech stacks if more than 2 */}
                {project.techStack.length > 2 && (
                  <span className="text-xs text-gray-400">
                    +{project.techStack.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {visible < filteredProjects.length && (
        // Load 3 more projects per click
        // This button will only show if there are more projects to load
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisible(visible + 3)}
            className="cursor-pointer inline-flex items-center gap-x-2 px-4 py-3 text-md font-semibold text-white bg-brand hover:bg-brand/90 hover:scale-95 transition duration-300 ease-in-out italic"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
