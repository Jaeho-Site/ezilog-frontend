import { Metadata } from "next";
import { Suspense } from "react";
import SearchResults from "@/components/search/SearchResults";
import { getAllPosts } from "@/lib/content";
import { generateSearchMetadata } from "@/lib/metadata";

export const dynamic = 'force-static';

// searchParams를 읽으면 페이지가 Dynamic으로 전환되므로 metadata는 정적으로 생성한다.
// (검색어별 결과는 클라이언트 필터링이라 서버 메타데이터에 반영할 수 없음)
export async function generateMetadata(): Promise<Metadata> {
  return generateSearchMetadata({});
}

export default function SearchPage() {
  const allPosts = getAllPosts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={null}>
        <SearchResults initialPosts={allPosts} />
      </Suspense>
    </div>
  );
}
