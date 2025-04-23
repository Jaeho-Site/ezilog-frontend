import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import PostCard, { PostData } from "@/components/ui/PostCard";
import { getAllPosts } from "@/lib/api";

// 포스트 목록을 가져오는 비동기 컴포넌트
async function PostList() {
  try {
    // Strapi에서 최신 12개 포스트 가져오기
    const posts = await getAllPosts(12);
    
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">포스트가 없습니다.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: PostData) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <PostCard post={post} />
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error("포스트 목록을 가져오는 중 오류 발생:", error);
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">포스트를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* 헤더 섹션 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">EziLog</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Next.js, Strapi, Supabase로 구축된 헤드리스 블로그 플랫폼
        </p>
      </div>

      {/* 최근 게시물 */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">최근 게시물</h2>
        
        <Suspense fallback={
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
          </div>
        }>
          <PostList />
        </Suspense>
      </div>
      
      {/* CTA 섹션 */}
      <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">블로그 소개</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          EziLog는 Next.js, Strapi, Supabase를 활용한 현대적인 블로그 플랫폼입니다.
          정적 생성과 최신 웹 기술을 통해 빠른 성능과 뛰어난 사용자 경험을 제공합니다.
        </p>
        <Link 
          href="/about" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          자세히 알아보기
        </Link>
      </div>
    </div>
  );
}
