import { getAllPosts } from "../utils/Posts";
import readingDuration from "reading-duration";
import BlogGrid from "../components/BlogGrid";

export const metadata = {
  title: "Writing | Matthew Ovie Enamuotor",
  description:
    "Technical writing on frontend, mobile, and AI tooling from things I come across on my software journey.",
};

export default function Blog() {
  const posts = getAllPosts();

  const sortedBlogs = [...posts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(({ content, ...post }) => ({
      ...post,
      readingTime: readingDuration(content, { wordsPerMinute: 200, emoji: false }),
    }));

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24 pt-16 lg:pt-24">
      <h1 className="text-[clamp(3.5rem,12vw,12rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
        Writing<span className="text-brand">.</span>
      </h1>
      <p className="mt-8 max-w-md text-lg leading-relaxed text-neutral-400">
        Notes on frontend, mobile, and building with AI tools.
      </p>

      <BlogGrid posts={sortedBlogs} />
    </div>
  );
}
