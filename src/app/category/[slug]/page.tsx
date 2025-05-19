import { Suspense } from "react";
import { getAllCategories } from "@/lib/api";
import CategoryPostList from "@/components/category/CategoryPostList";

// 빌드 시 정적으로 생성할 경로 정의
export async function generateStaticParams() {
  const categories = await getAllCategories();
  
  return categories.map((category: { slug: string }) => ({
    slug: category.slug
  }));
}

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

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