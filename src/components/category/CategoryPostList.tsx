// import { notFound } from "next/navigation"; // 정적 생성을 위해 제거
import PostListGrid from "@/components/ui/PostListGrid";
import Pagination from "@/components/ui/Pagination";
import { getCategoryBySlug, getCategoryPosts } from "@/lib/api";
import * as fs from 'fs';
import * as path from 'path';

// 페이지네이션을 위한 페이지당 포스트 수
export const POSTS_PER_PAGE = 6;

interface CategoryPostListProps {
  slug: string;
  page?: number;
}

// 정적 데이터 로드 함수들 (성능 최적화)
async function loadStaticCategories() {
  try {
    const categoriesPath = path.join(process.cwd(), 'public', 'data', 'categories.json');
    if (fs.existsSync(categoriesPath)) {
      return JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
    }
  } catch (error) {
    console.warn('[CategoryPostList] Failed to load static categories');
  }
  return [];
}

async function loadStaticPosts() {
  try {
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      
      // PostListGrid가 기대하는 형태로 변환
      return posts.map((post: any) => ({
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
    console.warn('[CategoryPostList] Failed to load static posts');
  }
  return [];
}

// 정적 데이터에서 카테고리별 포스트 필터링
function filterPostsByCategory(posts: any[], categorySlug: string, allCategories: any[], limit: number, offset: number) {
  // 카테고리 찾기
  const category = allCategories.find(cat => cat.slug === categorySlug);
  if (!category) return [];
  
  let filteredPosts: any[] = [];
  
  if (category.level === 1) {
    // 1레벨 카테고리: 자식 카테고리들의 포스트 모두 포함
    const childCategorySlugs = (category.categories || []).map((child: any) => child.slug);
    filteredPosts = posts.filter(post => 
      post.category && childCategorySlugs.includes(post.category.slug)
    );
  } else {
    // 2레벨 카테고리: 해당 카테고리의 포스트만
    filteredPosts = posts.filter(post => 
      post.category && post.category.slug === categorySlug
    );
  }
  
  // 정렬 (최신순)
  filteredPosts.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  
  // 페이지네이션 적용
  return filteredPosts.slice(offset, offset + limit);
}

export default async function CategoryPostList({ slug, page = 1 }: CategoryPostListProps) {
  try {
    // 정적 데이터 우선 로드
    const [staticCategories, staticPosts] = await Promise.all([
      loadStaticCategories(),
      loadStaticPosts()
    ]);
    
    let category: any = null;
    let posts: any[] = [];
    
    if (staticCategories.length > 0 && staticPosts.length > 0) {
      // 정적 데이터에서 처리 (API 호출 0회)
      category = staticCategories.find((cat: any) => cat.slug === slug);
      
      if (category) {
        posts = filterPostsByCategory(
          staticPosts, 
          slug, 
          staticCategories, 
          POSTS_PER_PAGE, 
          (page - 1) * POSTS_PER_PAGE
        );
      }
    } else {
      // 정적 데이터가 없는 경우에만 API 호출 (폴백)
      category = await getCategoryBySlug(slug);
      if (category) {
        posts = await getCategoryPosts(slug, POSTS_PER_PAGE, (page - 1) * POSTS_PER_PAGE);
      }
    }
    
    if (!category) {
      return (
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">카테고리를 찾을 수 없습니다</h1>
          <p className="text-gray-600 dark:text-gray-400">요청하신 카테고리가 존재하지 않습니다.</p>
        </div>
      );
    }
    
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