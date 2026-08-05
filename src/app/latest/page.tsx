import { Metadata } from "next";
import PostListGrid from "@/components/ui/PostListGrid";
import { getAllPosts } from "@/lib/content";
import { generateLatestMetadata } from "@/lib/metadata";

export const dynamic = 'force-static';
const POSTS_COUNT = 12;

export async function generateMetadata(): Promise<Metadata> {
  return generateLatestMetadata();
}

export default function Latest() {
  const posts = getAllPosts().slice(0, POSTS_COUNT);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="sr-only">최신 포스트</h1>
      <PostListGrid posts={posts} />
    </div>
  );
}
