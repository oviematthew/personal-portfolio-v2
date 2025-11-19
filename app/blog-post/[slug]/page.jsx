import { notFound } from "next/navigation";
import { getAllPosts } from "../../utils/Posts";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import readingDuration from "reading-duration";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import GoBackUrl from "../../utils/GoBackUrl";


async function fetchPosts(slug) {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug);
}

export async function generateMetadata({ params }) {
  // await params first as required in nextjs14+
  const { slug } = await params;

  const posts = getAllPosts();

  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Blog Post - Ovie Matthew",
    };
  }

  return {
    title: `Blog Post: ${post.title}`,
    description: post.excerpt,
  };
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


  // Calculate reading time
  const readingTime = readingDuration(post.content, {
    wordsPerMinute: 200,
    emoji: false,
  });

  return (
    <div className="max-w-[90%] lg:max-w-[50%] mx-auto px-4 py-12 text-white">
      <div className=" flex justify-between items-center mb-15">
        <Link
          href={backUrl}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>

        <div className="reading-time">
          <span className="whitespace-nowrap text-gray-300">
            🕒 {readingTime}
          </span>
        </div>
      </div>

      {/* author */}
      <div className="mb-6 flex flex-col md:flex-row gap-5 items-center">
        <div className="rounded-full w-10 flex items-center h-[100%] bg-brand">
          <Image
            src="/media/welcome.png"
            alt="Blog Post Author"
            width={60}
            height={60}
            className="inline-block rounded-full mr-3"
          />
        </div>

        <h1 className="text-xl md:text-3xl font-bold text-center md:text-left">{post.title}</h1>
      </div>

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
