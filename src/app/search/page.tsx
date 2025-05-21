import { getAllPosts } from "@/lib/api";
import { Metadata } from "next";
import SearchResults from "@/components/search/SearchResults";

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// SEO 메타데이터
export const metadata: Metadata = {
  title: '포스트 검색 | EziLog',
  description: '블로그의 모든 포스트를 검색할 수 있습니다.',
};

// 서버 컴포넌트에서 모든 포스트 데이터 가져오기
async function fetchAllPosts() {
  // 일단 최대 100개 포스트 가져오기 (실제로는 페이지네이션으로 모두 가져와야 함)
  const posts = await getAllPosts(100, 0);
  return posts;
}

// 검색 페이지 - 서버 컴포넌트
export default async function SearchPage() {
  // 모든 포스트 데이터 가져오기 (build time에 실행)
  const allPosts = await fetchAllPosts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 클라이언트 컴포넌트에 모든 포스트 데이터 전달 */}
      <SearchResults initialPosts={allPosts} />
    </div>
  );
} 