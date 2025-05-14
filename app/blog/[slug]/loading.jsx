"use client";

export default function BlogPostLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-pulse">
      {/* Back Button */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-4 w-16 bg-gray-700 rounded" />
        <div className="h-4 w-12 bg-gray-700 rounded" />
      </div>

      {/* Post Title */}
      <div className="h-6 w-3/4 bg-gray-700 rounded mb-4" />

      {/* Post Date */}
      <div className="h-4 w-32 bg-gray-700 rounded mb-6" />

      {/* Post Cover Image */}
      <div className="relative w-full h-72 bg-gray-700 rounded-lg mb-6" />

      {/* Post Content (Markdown) */}
      <div className="prose prose-invert prose-lg max-w-none space-y-4">
        {/* Placeholder for paragraphs */}
        <div className="h-4 w-full bg-gray-700 rounded mb-4" />
        <div className="h-4 w-5/6 bg-gray-700 rounded mb-4" />
        <div className="h-4 w-4/6 bg-gray-700 rounded mb-4" />
      </div>
    </div>
  );
}
