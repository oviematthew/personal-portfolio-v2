"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Loader } from "lucide-react";
import Reveal from "./Reveal";

const INITIAL_VISIBLE = 9;
const LOAD_STEP = 3;

const formatDate = (d) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function BlogGrid({ posts }) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [postsLoading, setPostsLoading] = useState(false);

  const loadMorePosts = () => {
    setPostsLoading(true);
    setTimeout(() => {
      setVisible((prev) => prev + LOAD_STEP);
      setPostsLoading(false);
    }, 200);
  };

  const [latest, ...rest] = posts;
  const shown = rest.slice(0, visible - 1);

  return (
    <>
      {/* Latest post, large */}
      {latest && (
        <Reveal className="mt-20">
          <Link href={`/blog-post/${latest.slug}`} className="group grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/10 bg-black lg:col-span-8">
              <Image
                src={latest.coverImage}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover object-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm text-neutral-400">
                {formatDate(latest.date)}, {latest.readingTime}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tighter transition-colors group-hover:text-brand md:text-4xl">
                {latest.title}
              </h2>
              <p className="mt-4 line-clamp-3 leading-relaxed text-neutral-400">{latest.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-white">
                Read post <ArrowUpRight size={18} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </Reveal>
      )}

      {/* Earlier posts, compact rows */}
      <ul className="mt-24 divide-y divide-white/10 border-y border-white/10">
        {shown.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog-post/${post.slug}`}
              className="group grid grid-cols-1 items-center gap-6 py-8 md:grid-cols-[10rem_1fr_9rem] md:gap-10"
            >
              <p className="text-sm text-neutral-400">
                {formatDate(post.date)}
                <span className="block text-neutral-500">{post.readingTime}</span>
              </p>
              <div className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                <h3 className="text-2xl font-medium tracking-tight transition-colors group-hover:text-brand md:text-3xl">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 max-w-2xl text-neutral-400">{post.excerpt}</p>
              </div>
              <div className="relative hidden h-20 w-36 justify-self-end overflow-hidden rounded-xl md:block">
                <Image
                  src={post.coverImage}
                  alt=""
                  fill
                  sizes="144px"
                  className="object-cover object-left grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {visible < posts.length && (
        <div className="mt-12">
          <button
            onClick={loadMorePosts}
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-white/15 px-8 text-[15px] font-medium text-white transition hover:border-white/40 active:scale-[0.98]"
          >
            {postsLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </>
  );
}
