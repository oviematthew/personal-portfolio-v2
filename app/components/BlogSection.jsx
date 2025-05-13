"use client";
import blogsData from "../data/blogs.json";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import readingDuration from "reading-duration";

export default function BlogSection() {
  const latestPost = [...blogsData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];

  // Calculate reading time
  const readingTime = readingDuration(latestPost.content, {
    wordsPerMinute: 200,
    emoji: false,
  });

  return (
    <section id="blog" className="px-6 py-30 w-full lg:w-1/2 mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-white font-heading">
          Latest Blog Post <span className="text-brand">.</span>
        </h2>
        <Link
          href="/blog"
          className="flex items-center hover:underline gap-2 text-gray-300 text-md hover:scale-95"
        >
          Blog
          <ArrowUpRight />
        </Link>
      </div>

      <Link
        href={`/blog/${latestPost.slug}`}
        className="group bg-white/5 p-4 rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300"
      >
        <div className="relative w-full h-60 mb-4 overflow-hidden rounded-lg">
          <Image
            src={latestPost.coverImage}
            alt={latestPost.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h3 className="text-lg font-bold text-white group-hover:text-brand transition">
          {latestPost.title}
        </h3>
        <p className="text-sm text-gray-400 mt-2 line-clamp-2">
          {latestPost.excerpt}
        </p>
        <div className="flex w-full justify-between items-center mt-4 text-xs text-gray-500">
          <span>
            {new Date(latestPost.date + "T12:00:00").toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            )}
          </span>
          <span className="text-gray-400">🕒 {readingTime}</span>
        </div>
      </Link>
    </section>
  );
}
