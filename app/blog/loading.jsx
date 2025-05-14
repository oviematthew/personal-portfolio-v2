"use client";

export default function BlogPageLoading() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20 animate-pulse">
      <h1 className="text-4xl font-bold font-heading text-gray-300 mb-10">
        All Blog Posts
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/5 p-4 rounded-xl shadow flex flex-col"
          >
            {/* Image placeholder */}
            <div className="relative w-full h-48 mb-4 rounded-lg bg-gray-700" />

            {/* Title */}
            <div className="h-4 w-3/4 bg-gray-700 rounded mb-2" />
            {/* Description lines */}
            <div className="h-3 w-full bg-gray-700 rounded mb-1" />
            <div className="h-3 w-5/6 bg-gray-700 rounded mb-1" />

            {/* Metadata */}
            <div className="flex justify-between mt-4">
              <div className="h-3 w-20 bg-gray-700 rounded" />
              <div className="h-3 w-16 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
