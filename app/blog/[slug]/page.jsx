import blogsData from "../../data/blogs.json";
import Image from "next/image";
import { notFound } from "next/navigation";
import { content } from "../../../tailwind.config";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BlogPost({ params }) {
  // fix dynamic route issues with newer nextjs dynamic routing by awaiting params first
  const { slug } = await params;
  const post = blogsData.find((b) => b.slug === slug);

  if (!post) return notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-white">
      <Link href="/#blog" className="flex mb-5 text-gray-300 text-md">
        <ArrowLeft className="text-gray-300 " />
        Back
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
      <p className="text-lg text-gray-300">{post.content}</p>
    </div>
  );
}
