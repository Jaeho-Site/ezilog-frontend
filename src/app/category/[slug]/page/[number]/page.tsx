import { Suspense } from "react";
import { getAllCategories } from "@/lib/api";
import CategoryPostList, { POSTS_PER_PAGE } from "@/components/category/CategoryPostList";

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// 빌드 시 정적으로 생성할 경로 정의
export async function generateStaticParams() {
  const categories = await getAllCategories();
  const paths = [];
  
  for (const category of categories) {
    // 카테고리가 가진 포스트 수 확인
    const postCount = category.postCount || 0;
    // 필요한 페이지 수 계산 (올림)
    const totalPages = Math.ceil(postCount / POSTS_PER_PAGE);
    // 1페이지는 [slug]/page.tsx에서 처리하므로 2페이지부터 생성
    // 포스트가 충분히 있어 2페이지 이상 필요한 경우에만 생성
    if (totalPages >= 2) {
      // 최대 5페이지까지만 정적 생성 (필요에 따라 조정 가능)
      const maxPages = Math.min(totalPages, 5); 
      
      for (let page = 2; page <= maxPages; page++) {
        paths.push({
          slug: category.slug,
          number: page.toString()
        });
      }
    }
  }
  return paths;
}

// 페이지 번호 확인 함수
function getPageNumber(params: { number: string }): number {
  const pageNumber = parseInt(params.number, 10);
  return isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
}

export default async function CategoryNumberedPage({ params }: any) {
  const pageNumber = getPageNumber(params);
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
        </div>
      }>
        <CategoryPostList slug={params.slug} page={pageNumber} />
      </Suspense>
    </div>
  );
}