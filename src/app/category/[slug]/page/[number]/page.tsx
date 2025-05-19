import { Suspense } from "react";
import { getAllCategories } from "@/lib/api";
import CategoryPostList from "@/components/category/CategoryPostList";

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// 빌드 시 정적으로 생성할 경로 정의
export async function generateStaticParams() {
  const categories = await getAllCategories();
  const pages = [1, 2, 3]; // 기본적으로 각 카테고리당 3개 페이지까지 생성
  
  const paths = [];
  for (const category of categories) {
    for (const page of pages) {
      paths.push({
        slug: category.slug,
        number: page.toString()
      });
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