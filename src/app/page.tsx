import { Suspense } from "react";
import PostCard, { PostData } from "@/components/ui/PostCard";
import { getPostBySlug } from "@/lib/api";

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// 원하는 포스트들의 slug 목록 (10개 선택)
const FEATURED_POST_SLUGS = ['1', '2', '3', '4', '14', '6', '13', '8', '9', '10'];

// 선택된 포스트 목록을 가져오는 비동기 컴포넌트
async function PostList() {
  try {
    // 각 slug로 개별 포스트 가져오기
    const postPromises = FEATURED_POST_SLUGS.map(slug => getPostBySlug(slug));
    const postsResults = await Promise.all(postPromises);
    
    // null이 아닌 포스트들만 필터링
    const posts = postsResults.filter((post): post is PostData => post !== null);
    
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">포스트가 없습니다.</p>
        </div>
      );
    }
    
    return (
      <div className="mt-10 grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post: PostData) => (
          <PostCard key={post.id} post={post} />
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
