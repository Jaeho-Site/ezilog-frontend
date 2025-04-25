import { Suspense } from "react";
import PostCard, { PostData } from "@/components/ui/PostCard";
import { getAllPosts } from "@/lib/api";
import Pagination from "@/components/ui/Pagination";

// 페이지네이션을 위한 페이지당 포스트 수
const POSTS_PER_PAGE = 6;

// 페이지 번호 확인 함수
function getPageNumber(params: { number: string }): number {
  const pageNumber = parseInt(params.number, 10);
  return isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
}

// 포스트 목록을 가져오는 비동기 컴포넌트
async function PostList({ page = 1 }: { page: number }) {
  try {
    // Strapi에서 포스트 가져오기 (페이지네이션 적용)
    const posts = await getAllPosts(POSTS_PER_PAGE, (page - 1) * POSTS_PER_PAGE);
    
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">포스트가 없습니다.</p>
        </div>
      );
    }
    
    return (
      <>
        <div className="mt-10 grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post: PostData) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        {/* 페이지네이션 */}
        <Pagination 
          currentPage={page} 
          hasMore={posts.length === POSTS_PER_PAGE} 
          basePath="/"
        />
      </>
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

export default function NumberedPage({ params }: { params: { number: string } }) {
  const pageNumber = getPageNumber(params);
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
        </div>
      }>
        <PostList page={pageNumber} />
      </Suspense>
    </div>
  );
} 