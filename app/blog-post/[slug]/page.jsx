import { notFound } from "next/navigation";
import MarkdownIt from "markdown-it";
import { getAllPosts } from "../../utils/Posts";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import readingDuration from "reading-duration";
import Image from "next/image";
import mdhljs from "markdown-it-highlightjs";
import ReactMarkdown from "react-markdown";
import GoBackUrl from "../../utils/GoBackUrl";

export const metadata = {
  title: "Blog Post - Ovie Mattheww",
};


const md = new MarkdownIt({
  html: true,          // allow HTML tags
  linkify: true,       // autolink URLs
  typographer: true,   // smart quotes
}).use(mdhljs);

async function fetchPosts(slug) {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug);
}

export default async function Post({ params }) {
  // fix dynamic route issues with newer nextjs dynamic routing by awaiting params first
  const { slug } = await params;

  // Redirect to 404 if no slug or post not found
  if (!slug) notFound();

  const post = await fetchPosts(slug);

  // Go to previous link
  const backUrl = await GoBackUrl();

  if (!post) notFound();

  const htmlConverter = md.render(post.content);

  // Use next/headers to get the current URL and ensure it's a full URL
  const currentUrl = `https://${(await headers()).get("host")}/posts/${slug}`;

  // Calculate reading time
  const readingTime = readingDuration(post.content, {
    wordsPerMinute: 200,
    emoji: false,
  });

  return (
    <div className="max-w-[90%] md:max-w-[50%] mx-auto px-4 py-12 text-white">
      <Link
        href={backUrl}
        className="flex items-center gap-2 mb-5 text-gray-300 hover:text-white transition"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </Link>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-6">
        {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>

      <div className="relative w-full h-72 mb-6">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <article className="prose prose-invert prose-lg w-full break-words overflow-hidden">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </div>
  );
}
