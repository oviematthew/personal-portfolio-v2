import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts } from "../utils/Posts";

export default function WritingSection() {
  const posts = [...getAllPosts()]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <section id="writing" className="mx-auto max-w-[1400px] px-6 py-32 lg:py-48">
      <div className="mb-16 flex items-end justify-between gap-6">
        <h2 className="text-5xl font-semibold tracking-tighter md:text-8xl">
          Writing<span className="text-brand">.</span>
        </h2>
        <Link
          href="/blog"
          className="inline-flex shrink-0 items-center gap-2 text-neutral-300 transition hover:text-brand"
        >
          All posts <ArrowUpRight size={18} />
        </Link>
      </div>

      <ul className="divide-y divide-white/10 border-y border-white/10">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog-post/${post.slug}`}
              className="group grid grid-cols-1 items-center gap-6 py-8"
            >
              <div className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                <p className="text-sm text-neutral-400">
                  {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <h3 className="mt-2 max-w-3xl text-2xl font-medium tracking-tight transition-colors group-hover:text-brand md:text-4xl">
                  {post.title}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
