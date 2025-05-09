import blogsData from "../data/blogs.json";
import Link from "next/link";
import Image from "next/image";
import readingDuration from "reading-duration";

export default function BlogPage() {
  const sortedBlogs = [...blogsData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold font-heading text-white mb-10">
        All Blog Posts
      </h1>
      <div className="grid md:grid-cols-2  gap-6">
        {sortedBlogs.map((post) => {
          const readingTime = readingDuration(post.content, {
            wordsPerMinute: 200,
            emoji: false,
          });

          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
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
                <h3 className="text-lg font-bold text-white group-hover:text-brand transition line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                  {post.description}
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
          );
        })}
      </div>
    </section>
  );
}
