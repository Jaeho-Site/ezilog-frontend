import { Suspense } from "react";
import PostCard, { PostData } from "@/components/ui/PostCard";
import { getCategoryPosts, getCategoryBySlug } from "@/lib/api";
import Pagination from "@/components/ui/Pagination";
import { notFound } from "next/navigation";

// 페이지네이션을 위한 페이지당 포스트 수
const POSTS_PER_PAGE = 6;

// 카테고리별 포스트 목록을 가져오는 비동기 컴포넌트
async function CategoryPostList({ slug, page = 1 }: { slug: string, page: number }) {
  try {
    // 카테고리 정보 가져오기
    const category = await getCategoryBySlug(slug);
    
    if (!category) {
      return notFound();
    }
    
    // 카테고리 포스트 가져오기
    const posts = await getCategoryPosts(slug, POSTS_PER_PAGE, 0);
    
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">해당 카테고리에 포스트가 없습니다.</p>
        </div>
      );
    }
    
    // Strapi v5에서는 attributes가 최상위 레벨로 이동됨
    const categoryName = category.name || slug;
    const categoryLevel = category.level || 2;
    
    return (
      <>
        <h1 className="text-3xl font-bold mb-6">
          {categoryName}
          {categoryLevel === 2 && category.parent && (
            <span className="text-lg ml-2 text-gray-500">
              ({category.parent.name || '상위 카테고리'})
            </span>
          )}
        </h1>
        
        <div className="mt-10 grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {posts.filter(Boolean).map((post) => (
            <PostCard key={post!.id} post={post!} />
          ))}
        </div>
        
        {/* 페이지네이션 */}
        <Pagination 
          currentPage={page} 
          hasMore={posts.length === POSTS_PER_PAGE} 
          basePath={`/category/${slug}`}
        />
      </>
    );
  } catch (error) {
    console.error(`카테고리 '${slug}' 포스트 목록을 가져오는 중 오류 발생:`, error);
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">포스트를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }
}

// Next.js의 페이지 컴포넌트 (async/await 사용하지 않음)
export default function CategoryPage({ params }: { params: { slug: string } }) {  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
        </div>
      }>
        {/* CategoryPostList 컴포넌트에서 비동기 작업 처리 */}
        <CategoryPostList slug={params.slug} page={1} />
      </Suspense>
    </div>
  );
} 