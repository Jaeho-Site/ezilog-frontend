import { Suspense } from "react";
import { PostData } from "@/components/ui/PostCard";
import PostListGrid from "@/components/ui/PostListGrid";
import FeaturedPost from "@/components/ui/FeaturedPost";
import { getPostBySlug } from "@/lib/api";
import * as fs from 'fs';
import * as path from 'path';

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// 원하는 포스트들의 slug 목록 (10개 선택)
const FEATURED_POST_SLUGS = ['1', '2', '3', '4', '14', '6', '13', '8', '9', '10'];

// 정적 포스트 데이터 로드 함수 (성능 최적화)
async function loadStaticPosts(): Promise<PostData[]> {
  try {
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      
      // PostData 형태로 변환
      return postsData.map((post: any) => ({
        id: post.id,
        title: post.title,
        description: post.description || '',
        slug: post.slug,
        coverImage: post.cover ? {
          url: post.cover.url,
          alt: post.title
        } : null,
        publishedDate: post.publishedAt,
        category: post.category || {
          name: '미분류',
          slug: 'uncategorized'
        },
        tags: post.tags || []
      }));
    }
  } catch (error) {
    console.warn('[loadStaticPosts] Failed to load static data, falling back to API');
  }
  return [];
}

// 선택된 포스트 목록을 가져오는 비동기 컴포넌트 (최적화됨)
async function PostList() {
  try {
    // 정적 데이터 우선 사용
    const staticPosts = await loadStaticPosts();
    
    let posts: PostData[] = [];
    
    if (staticPosts.length > 0) {
      // 정적 데이터에서 원하는 포스트들 찾기 (API 호출 0회)
      posts = FEATURED_POST_SLUGS
        .map(slug => staticPosts.find(post => post.slug === slug))
        .filter((post): post is PostData => post !== undefined);
      
      console.log(`[홈페이지] 정적 데이터에서 ${posts.length}개 포스트 로드`);
    } else {
      // 정적 데이터가 없는 경우에만 API 호출 (폴백)
      const postPromises = FEATURED_POST_SLUGS.map(slug => getPostBySlug(slug));
      const postsResults = await Promise.all(postPromises);
      posts = postsResults.filter((post): post is PostData => post !== null);
      
      console.log(`[홈페이지] API에서 ${posts.length}개 포스트 로드`);
    }
    
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
