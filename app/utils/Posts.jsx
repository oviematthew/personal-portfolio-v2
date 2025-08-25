import fs from "fs";
import matter from "gray-matter";
import path from "path";

const postsDir = path.join(process.cwd(), "public/posts");

export const getAllPosts = () => {
  const fileNames = fs.readdirSync(postsDir);

  return fileNames.map((fileName) => {
    // remove md part of post
    const slug = fileName.replace(/\.md$/, "");

    const filePath = path.join(postsDir, fileName);
    const fileContents = fs.readFileSync(filePath, "utf-8");

    // transform filecontents to readable data
    const { content, data } = matter(fileContents);

    return {
      slug,
      content,
      ...data,
    };
  });
};

// Get recent post
export const getRecentPost = () => {
  const posts = getAllPosts();
  const latestPost = [...posts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];
  return latestPost ? [latestPost] : [];
};
