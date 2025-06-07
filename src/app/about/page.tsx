import { getAllPosts } from "@/lib/api";
import { Metadata } from "next";
import SearchResults from "@/components/search/SearchResults";
import TagsOverview from "@/components/ui/TagsOverview";
import { extractUniqueTagsFromPosts } from "@/utils/tagUtils";

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// SEO 메타데이터
export const metadata: Metadata = {
  title: '태그별 탐색 | EziLog',
  description: '모든 태그를 확인하고 관심 있는 주제의 포스트를 찾아보세요.',
};

// 서버 컴포넌트에서 모든 포스트 데이터 가져오기
async function fetchAllPosts() {
  const posts = await getAllPosts(100, 0);
  return posts;
}

// About 페이지 - 태그 중심의 탐색 페이지
export default async function AboutPage() {
  // 모든 포스트 데이터 가져오기
  const allPosts = await fetchAllPosts();
  
  // 포스트에서 유니크한 태그들 추출
  const allTags = extractUniqueTagsFromPosts(allPosts);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 페이지 헤더 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          태그별 탐색
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          관심 있는 태그를 클릭하여 관련 포스트를 확인해보세요.
        </p>
      </div>

      {/* 태그 목록 */}
      <TagsOverview tags={allTags} />

      {/* 구분선 */}
      <div className="border-t border-gray-200 dark:border-gray-700 mb-8"></div>

      {/* 검색 결과 (SearchResults 컴포넌트 재사용) */}
      <SearchResults initialPosts={allPosts} />
    </div>
  );
}