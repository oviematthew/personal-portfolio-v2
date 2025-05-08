import blogsData from "../../data/blogs.json";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default async function BlogPost({ params }) {
// await params first as required in nextjs14+
  const { slug } = await params;
  const post = blogsData.find((b) => b.slug === slug);

  if (!post) return notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-white">
      <Link href="/#blog" className="flex items-center gap-2 mb-5 text-gray-300 hover:text-white transition">
        <ArrowLeft size={18} />
        <span>Back</span>
      </Link>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-6">
        {new Date(post.date).toDateString()}
      </div>

      <div className="relative w-full h-72 mb-6">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <article className="prose prose-invert prose-lg max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </div>
  );
}
