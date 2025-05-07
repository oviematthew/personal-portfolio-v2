"use client";
import React, { useState } from "react";
import blogsData from "../data/blogs.json";
import Link from "next/link";
import Image from "next/image";

export default function BlogSection() {
  const [visible, setVisible] = useState(3);

  //   Limit the number of blogs displayed based on the "visible" state
  //   Sort blogs by date in descending order
  //   and slice the array to get the first "visible" number of blogs
  const displayedBlogs = [...blogsData]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, visible);

  return (
    <section
      id="blog"
      className="px-6 py-30 lg:py-40 mt-10 w-full lg:w-1/2 mx-auto"
    >
      <h2 className="text-3xl font-bold text-center text-white mb-10 font-heading">
        Latest Blog Posts <span className="text-brand">.</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedBlogs.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-white/5 p-4 rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300"
          >
            <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-brand transition">
              {post.title}
            </h3>
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
              {post.description}
            </p>
            <div className="mt-3 text-xs text-gray-500">{post.date}</div>
          </Link>
        ))}
      </div>

      {visible < blogsData.length && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisible(visible + 3)}
            className="cursor-pointer px-5 py-3 bg-brand text-white rounded hover:bg-brand/80 transition"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
