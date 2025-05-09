import blogsData from "../data/blogs.json";
import Link from "next/link";
import Image from "next/image";

export default function BlogPage() {
  const sortedBlogs = [...blogsData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-10">All Blog Posts</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedBlogs.map((post) => (
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
            <div className="mt-3 text-xs text-gray-500">
              {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
