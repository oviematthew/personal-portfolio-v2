"use client";
import React from "react";

export default function ProjectPageLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-20 bg-gray-700 rounded" />
        <div className="h-6 w-40 bg-gray-700 rounded" />
        <div className="h-4 w-16 bg-gray-700 rounded" />
      </div>

      {/* Job Type */}
      <div className="h-4 w-32 bg-gray-700 rounded mx-auto mb-5" />

      {/* Description */}
      <div className="space-y-2 mb-10">
        <div className="h-4 w-full bg-gray-700 rounded" />
        <div className="h-4 w-5/6 bg-gray-700 rounded" />
        <div className="h-4 w-4/6 bg-gray-700 rounded" />
      </div>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-4 mb-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 w-20 bg-gray-700 rounded-full" />
        ))}
      </div>

      {/* Featured Image */}
      <div className="h-64 w-full bg-gray-700 rounded-lg mb-6" />

      {/* More Screenshots Title */}
      <div className="h-6 w-40 bg-gray-700 rounded mb-5" />

      {/* Screenshots Grid */}
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 w-full bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  );
}
