import { Suspense } from "react";
import { Metadata } from "next";
import { getAllCategories, getCategoryBySlug, getCategoryPosts } from "@/lib/api";
import CategoryPostList, { POSTS_PER_PAGE } from "@/components/category/CategoryPostList";

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// 빌드 시 정적으로 생성할 경로 정의 (최적화됨)
export async function generateStaticParams() {
  const categories = await getAllCategories();
  const paths = [];
  
  // 병렬 처리로 빌드 시간 단축
  const categoryPromises = categories.map(async (category: any) => {
    const categoryPaths = [];
    
    // 1페이지: /category/react
    categoryPaths.push({ slug: category.slug });
    
    // 실제 포스트 수를 정확히 계산하여 필요한 페이지만 생성
    let page = 2;
    let hasMore = true;
    
    while (hasMore && page <= 50) { // 최대 50페이지까지 (필요시 조정)
      const posts = await getCategoryPosts(category.slug, POSTS_PER_PAGE, (page - 1) * POSTS_PER_PAGE);
      
      if (posts.length > 0) {
        // 2페이지 이상: /category/react/2, /category/react/3, ...
        categoryPaths.push({
          slug: category.slug,
          page: [page.toString()]
        });
        page++;
      } else {
        hasMore = false;
      }
    }
    
    return categoryPaths;
  });
  
  // 모든 카테고리의 페이지들을 병렬로 생성
  const allCategoryPaths = await Promise.all(categoryPromises);
  
  // 2차원 배열을 1차원으로 평탄화
  return allCategoryPaths.flat();
}

// SEO 최적화를 위한 메타데이터 생성
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const slug = params.slug;
  const pageNumber = getPageNumber(params.page);
  
  try {
    const category = await getCategoryBySlug(slug);
    const categoryName = category?.name || slug;
    
    if (pageNumber === 1) {
      return {
        title: `${categoryName} | EziLog`,
        description: `${categoryName} 카테고리의 모든 포스트를 확인해보세요.`,
        openGraph: {
          title: `${categoryName} | EziLog`,
          description: `${categoryName} 카테고리의 모든 포스트를 확인해보세요.`,
        },
      };
    } else {
      return {
        title: `${categoryName} - 페이지 ${pageNumber} | EziLog`,
        description: `${categoryName} 카테고리의 포스트 목록 ${pageNumber}페이지입니다.`,
        openGraph: {
          title: `${categoryName} - 페이지 ${pageNumber} | EziLog`,
          description: `${categoryName} 카테고리의 포스트 목록 ${pageNumber}페이지입니다.`,
        },
      };
    }
  } catch (error) {
    return {
      title: '카테고리 | EziLog',
      description: '카테고리별 포스트를 확인해보세요.',
    };
  }
}

// 페이지 번호 추출 함수 (옵셔널 라우팅용)
function getPageNumber(pageParam?: string[]): number {
  if (!pageParam || pageParam.length === 0) return 1;
  const pageNumber = parseInt(pageParam[0], 10);
  return isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
}

// 통합된 카테고리 페이지 컴포넌트
export default async function CategoryPage({ params }: any) {
  const slug = params.slug;
  const page = getPageNumber(params.page);
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
        </div>
      }>
        <CategoryPostList slug={slug} page={page} />
      </Suspense>
    </div>
  );
} 