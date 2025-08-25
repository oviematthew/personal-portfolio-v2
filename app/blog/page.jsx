import Link from "next/link";
import React from "react";
import { getAllPosts } from "../utils/Posts";
import Image from "next/image";
import readingDuration from "reading-duration";

export const metadata = {
  title: "Blog",
  description:
    "Discover the stories behind the lens. The Bedge Pictures blog shares real wedding experiences, creative insights, behind-the-scenes moments, and tips for couples preparing for their big day. It’s where inspiration meets intention — curated to spark ideas, evoke emotion, and celebrate love in all its forms.",
};

export default function Blog() {
  const posts = getAllPosts();

  const sortedBlogs = [...posts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <>
      <div className="sm:py-0 md:py-24 fade-up">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="w-full hidden md:block">
            <h1 className="text-4xl font-bold font-heading text-white mb-10">
              All Blog Posts
            </h1>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {sortedBlogs.map((post) => {
              // Calculate reading time for each post
              const readingTime = readingDuration(post.content, {
                wordsPerMinute: 200, // Standard WPM
                emoji: false,
              });

              return (
                <article
                  key={post.slug}
                  className="flex max-w-xl flex-col items-start justify-between hover:opacity-80"
                >
                  <div className="w-full object-contain mb-5">
                     <Link
              key={post.slug}
              href={`/blog-post/${post.slug}`}
              className="group bg-white/5 p-4 rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 flex flex-col"
            >
              <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content wrapper that grows */}
              <div className="flex-1">
                
                <h3 className="text-lg font-bold text-white group-hover:text-brand transition min-h-[4rem]">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              {/* Metadata pinned at bottom */}
              <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
                <span className="whitespace-nowrap">
                  {new Date(post.date + "T12:00:00").toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </span>
                <span className="whitespace-nowrap ">🕒 {readingTime}</span>
              </div>
            </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
