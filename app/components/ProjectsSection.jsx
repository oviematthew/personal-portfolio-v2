"use client";
import React, { useState } from "react";
import projectsData from "../data/projects.json";
import Link from "next/link";
import Image from "next/image";

const FILTERS = ["all", "web", "mobile"];

export default function ProjectsSection() {
  const [visible, setVisible] = useState(9);
  const [filter, setFilter] = useState("all");

  const filteredProjects = projectsData.filter((project) =>
    filter === "all" ? true : project.type === filter
  );

  const displayedProjects = filteredProjects.slice(0, visible);

  return (
    <section id="projects" className="px-6 py-12 max-w-7xl mx-auto">
      <div className="flex gap-4 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setVisible(9);
            }}
            className={`px-4 py-2 rounded-full border ${
              filter === f
                ? "bg-brand text-white"
                : "text-gray-300 border-gray-600"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {displayedProjects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group bg-white/5 rounded-xl overflow-hidden shadow hover:scale-[1.02] transition"
          >
            <Image
              src={project.featuredImage}
              alt={project.name}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-left">
              <h3 className="text-lg font-semibold text-white">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400">{project.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {visible < filteredProjects.length && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisible(visible + 3)}
            className="px-5 py-3 bg-brand text-white rounded hover:bg-brand/80 transition"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
