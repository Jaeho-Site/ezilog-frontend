import Link from "next/link";
import { Suspense } from "react";
import PostCard, { PostData } from "@/components/ui/PostCard";
import PostListGrid from "@/components/ui/PostListGrid";
import { getAllPosts } from "@/lib/api";

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// 가져올 포스트 수
const POSTS_COUNT = 12;

// 최신 포스트 목록을 가져오는 비동기 컴포넌트
async function PostList() {
  try {
    // Strapi에서 최신 12개 포스트 가져오기 (이미 publishedAt:desc로 정렬됨)
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
