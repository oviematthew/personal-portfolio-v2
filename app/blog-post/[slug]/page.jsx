import { notFound } from "next/navigation";
import { getAllPosts } from "../../utils/Posts";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
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
      title: "Writing | Matthew Ovie Enamuotor",
    };
  }

  return {
    title: `${post.title} | Matthew Ovie Enamuotor`,
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

  // Next post in date order (wraps to the newest)
  const sorted = [...getAllPosts()].sort((a, b) => new Date(b.date) - new Date(a.date));
  const at = sorted.findIndex((p) => p.slug === slug);
  const nextPost = sorted[(at + 1) % sorted.length];


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
    <div className="pb-24">
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <Link
          href={backUrl}
          className="group inline-flex items-center gap-2 text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back
        </Link>

        <h1 className="mt-10 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-7xl">
          {post.title}
        </h1>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-neutral-400">
          <Image src="/media/welcome.png" alt="" width={36} height={36} className="rounded-full bg-white/10" />
          <span className="text-white">Matthew Ovie Enamuotor</span>
          <span>{formattedDate}</span>
          <span>{readingTime}</span>
        </div>

        <div className="relative mt-12 aspect-[16/8] overflow-hidden rounded-3xl border border-white/10 bg-black">
          <Image src={post.coverImage} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover object-left" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 pt-16">
        <article className="post-content w-full break-words overflow-hidden">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        <Link
          href={`/blog-post/${nextPost.slug}`}
          className="group mt-20 block border-t border-white/10 pt-8"
        >
          <p className="text-sm text-neutral-500">Next post</p>
          <p className="mt-3 flex items-start justify-between gap-6 text-2xl font-medium tracking-tight transition-colors group-hover:text-brand md:text-3xl">
            {nextPost.title}
            <ArrowUpRight className="mt-1 h-7 w-7 shrink-0 transition duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1.5} />
          </p>
        </Link>
      </div>
    </div>
  );
}
