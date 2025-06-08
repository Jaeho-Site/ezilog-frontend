import { Suspense } from "react";
import PostCard, { PostData } from "@/components/ui/PostCard";
import PostListGrid from "@/components/ui/PostListGrid";
import FeaturedPost from "@/components/ui/FeaturedPost";
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
    
    // 첫 번째 포스트와 나머지 포스트 분리
    const [featuredPost, ...remainingPosts] = posts;
    
    return (
      <>
        {/* 첫 번째 포스트 - 특별한 레이아웃 */}
        {featuredPost && <FeaturedPost post={featuredPost} />}
        
        {/* 나머지 포스트 - 기존 그리드 레이아웃 */}
        {remainingPosts.length > 0 && <PostListGrid posts={remainingPosts} />}
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

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto py-12">
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
