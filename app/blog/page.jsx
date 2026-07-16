import { getAllPosts } from "../utils/Posts";
import readingDuration from "reading-duration";
import BlogGrid from "../components/BlogGrid";

export const metadata = {
  title: "Blog - Ovie Matthew",
  description:
    "I chose to start writing about technical stuff I come across on my software journey. Hope you find them useful.",
};

export default function Blog() {
  const posts = getAllPosts();

  const sortedBlogs = [...posts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(({ content, ...post }) => ({
      ...post,
      readingTime: readingDuration(content, {
        wordsPerMinute: 200, // Standard WPM
        emoji: false,
      }),
    }));

  return (
    <div className="sm:py-0 md:py-24 fade-up">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="w-full">
          <h1 className="text-4xl font-bold font-heading text-white mb-10">
            All Blog Posts
          </h1>
        </div>
        <BlogGrid posts={sortedBlogs} />
      </div>
    </div>
  );
}
