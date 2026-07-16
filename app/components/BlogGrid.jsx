"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader } from "lucide-react";

const INITIAL_VISIBLE = 12;
const LOAD_STEP = 3;

export default function BlogGrid({ posts }) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [postsLoading, setPostsLoading] = useState(false);

  // Function to handle loading more posts
  const loadMorePosts = () => {
    setPostsLoading(true);
    setTimeout(() => {
      setVisible((prev) => prev + LOAD_STEP);
      setPostsLoading(false);
    }, 200);
  };

  const displayedPosts = posts.slice(0, visible);

  return (
    <>
      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {displayedPosts.map((post) => (
          <article
            key={post.slug}
            className="flex max-w-xl flex-col items-start justify-between hover:opacity-80"
          >
            <div className="w-full object-contain mb-5">
              <Link
                href={`/blog-post/${post.slug}`}
                className="group bg-white/5 p-4 rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 flex flex-col"
              >
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover object-left group-hover:scale-105 transition-transform duration-300"
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
                  <span className="whitespace-nowrap">🕒 {post.readingTime}</span>
                </div>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {visible < posts.length && (
        // Load 3 more posts per click
        // This button will only show if there are more posts to load
        <div className="mt-8 text-center">
          <button
            onClick={loadMorePosts}
            className="cursor-pointer inline-flex items-center gap-x-2 px-4 py-3 text-md font-semibold text-white bg-brand hover:bg-brand/90 hover:scale-95 transition duration-300 ease-in-out italic"
          >
            {postsLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </>
  );
}
