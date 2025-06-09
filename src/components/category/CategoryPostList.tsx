// import { notFound } from "next/navigation"; // 정적 생성을 위해 제거
import PostListGrid from "@/components/ui/PostListGrid";
import Pagination from "@/components/ui/Pagination";
import { getCategoryBySlug, getCategoryPosts } from "@/lib/api";

// 페이지네이션을 위한 페이지당 포스트 수
export const POSTS_PER_PAGE = 6;

interface CategoryPostListProps {
  slug: string;
  page?: number;
}

export default async function CategoryPostList({ slug, page = 1 }: CategoryPostListProps) {
  try {
    // 카테고리 정보 가져오기
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return (
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">카테고리를 찾을 수 없습니다</h1>
          <p className="text-gray-600 dark:text-gray-400">요청하신 카테고리가 존재하지 않습니다.</p>
        </div>
      );
    }
    // 카테고리 포스트 가져오기
    const posts = await getCategoryPosts(slug, POSTS_PER_PAGE, (page - 1) * POSTS_PER_PAGE);
    
    const categoryName = category.name || slug;
    const filteredPosts = posts.filter(Boolean);
    
    return (
      <>
        <PostListGrid 
          posts={filteredPosts}
          showTitle={true}
          title={categoryName}
          emptyMessage="해당 카테고리에 포스트가 없습니다."
        />
        
        {/* 페이지네이션 */}
        {filteredPosts.length > 0 && (
          <Pagination 
            currentPage={page} 
            hasMore={posts.length === POSTS_PER_PAGE} 
            basePath={`/category/${slug}`}
          />
        )}
      </>
    );
  } catch (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">포스트를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }
} 