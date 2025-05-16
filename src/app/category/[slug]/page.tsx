import { Suspense } from "react";
import PostCard, { PostData } from "@/components/ui/PostCard";
import { getCategoryPosts, getCategoryBySlug, getAllCategories } from "@/lib/api";
import Pagination from "@/components/ui/Pagination";
import { notFound } from "next/navigation";

// 페이지네이션을 위한 페이지당 포스트 수
const POSTS_PER_PAGE = 6;

// 빌드 시 정적으로 생성할 경로 정의
export async function generateStaticParams() {
  const categories = await getAllCategories();
  console.dir(categories, { depth: null });
  
  return categories.map((category: { slug: string }) => ({
    slug: category.slug
  }));
}

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// 카테고리별 포스트 목록을 가져오는 비동기 컴포넌트
async function CategoryPostList({ slug }: { slug: string }) {
  try {
    // 카테고리 정보 가져오기
    const category = await getCategoryBySlug(slug);
    
    if (!category) {
      return notFound();
    }
    
    // 카테고리 포스트 가져오기 (첫 페이지)
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
          {posts.filter(Boolean).map((post: PostData) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        {/* 페이지네이션 */}
        <Pagination 
          currentPage={1} 
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

// // 올바른 Next.js 페이지 컴포넌트
// export default async function CategoryPage({ params }: { params: { slug: string } }) {
//   // params 객체를 먼저 await
//   const resolvedParams = await params;
//   const slug = resolvedParams.slug;
  
//   return (
//     <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <Suspense fallback={
//         <div className="text-center py-10">
//           <p className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
//         </div>
//       }>
//         <CategoryPostList slug={slug} />
//       </Suspense>
//     </div>
//   );
// }
// /category/[slug]/page.tsx
// 내장 Next.js 타입 대신 any 타입 사용
export default async function CategoryPage({ params }: any) {
  const slug = params.slug;
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<div className="text-center py-10">포스트를 불러오는 중...</div>}>
        <CategoryPostList slug={slug} />
      </Suspense>
    </div>
  );
}