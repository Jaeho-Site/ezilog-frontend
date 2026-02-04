import { Suspense } from "react";
import { Metadata } from "next";
import PostListGrid from "@/components/ui/PostListGrid";
import { getAllPosts } from "@/lib/api";
import { generateLatestMetadata } from "@/lib/metadata";

export const dynamic = 'force-static';
const POSTS_COUNT = 12;

export async function generateMetadata(): Promise<Metadata> {
  return generateLatestMetadata();
}

async function PostList() {
  try {
    const posts = await getAllPosts(POSTS_COUNT, 0);    
    return <PostListGrid posts={posts} />;
  } catch (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">포스트를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }
}

export default function Latest() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
        </div>
      }>
        <PostList />
      </Suspense>
    </div>
  );
}
