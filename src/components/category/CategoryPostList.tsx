import { PostData } from "@/components/ui/PostCard";
import PostCard from "@/components/ui/PostCard";
import { getCategoryPosts, getCategoryBySlug } from "@/lib/api";
import Pagination from "@/components/ui/Pagination";
import { notFound } from "next/navigation";

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
      return notFound();
    }
    // 카테고리 포스트 가져오기
    const posts = await getCategoryPosts(slug, POSTS_PER_PAGE, (page - 1) * POSTS_PER_PAGE);
    
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">해당 카테고리에 포스트가 없습니다.</p>
        </div>
      );
    }
    const categoryName = category.name || slug;
    return (
      <>
        <h1 className="text-3xl font-bold mb-6">
          {categoryName}
        </h1>
        
        <div className="mt-10 grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {posts.filter(Boolean).map((post: PostData) => (
            <PostCard key={post.id} post={post} />
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