import { notFound } from "next/navigation";
import { getAllPosts } from "../../utils/Posts";
import { ArrowLeft, Clock } from "lucide-react";
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

  const formattedDate = new Date(post.date + "T12:00:00").toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <div className="text-white pb-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-10">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition mb-8"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>

        {/* Hero image, no CSS text overlay on top of it */}
        <div className="relative w-full h-48 md:h-80 rounded-2xl overflow-hidden mb-10">
          <Image
            src={post.coverImage}
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 pb-8 mb-10 border-b border-white/10">
          <Image
            src="/media/welcome.png"
            alt="Ovie Matthew"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="text-gray-200 font-medium">Ovie Matthew</span>
          <span className="text-gray-600">·</span>
          <span>{formattedDate}</span>
          <span className="text-gray-600">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {readingTime}
          </span>
        </div>

        <article className="post-content w-full break-words overflow-hidden">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
