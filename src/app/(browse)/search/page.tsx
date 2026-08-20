import { Metadata } from "next";
import { Suspense } from "react";
import SearchResults from "@/components/search/SearchResults";
import { getAllPosts, getAllCategories } from "@/lib/content";
import { generateSearchMetadata } from "@/lib/metadata";

// `dynamic = 'force-static'` 을 쓰면 안 된다.
// 그 옵션은 useSearchParams() 가 빈 값을 반환하게 만들어서, 새 탭에서 연
// /search?q=HTTP&type=tag 같은 주소가 필터 없이 전체 목록으로 열린다.
// (클라이언트 라우팅으로 들어올 때만 동작해서 눈치채기 어려웠다.)
// Suspense 경계 안에서 useSearchParams 를 쓰면 셸은 그대로 정적으로 프리렌더된다.

// generateMetadata 는 searchParams 를 읽지 않으므로 메타데이터는 정적으로 생성된다.
// (검색어별 결과는 클라이언트 필터링이라 서버 메타데이터에 반영할 수 없음)
export async function generateMetadata(): Promise<Metadata> {
  return generateSearchMetadata({});
}

export default function SearchPage() {
  const allPosts = getAllPosts();
  // 글이 없는 카테고리는 눌러도 빈 화면이라 탭에서 제외한다.
  const categories = getAllCategories().filter((category) => category.postCount > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={null}>
        <SearchResults initialPosts={allPosts} categories={categories} />
      </Suspense>
    </div>
  );
}
