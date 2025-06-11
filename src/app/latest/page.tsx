import { Suspense } from "react";
import { Metadata } from "next";
import PostListGrid from "@/components/ui/PostListGrid";
import { getAllPosts } from "@/lib/api";

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// SEO 메타데이터 생성
export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const canonicalUrl = `${siteUrl}/latest`;
  
  return {
    title: '최신 포스트 | EziLog',
    description: 'EziLog의 최신 개발 관련 포스트 12개를 확인해보세요. 최신 기술 트렌드와 개발 팁을 놓치지 마세요.',
    keywords: ['최신 포스트', '개발', '프로그래밍', '기술', 'EziLog', '블로그', '최신 기술'],
    authors: [{ name: 'EziLog' }],
    creator: 'EziLog',
    publisher: 'EziLog',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: '최신 포스트 | EziLog',
      description: 'EziLog의 최신 개발 관련 포스트를 확인해보세요.',
      url: canonicalUrl,
      siteName: 'EziLog',
      type: 'website',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary',
      title: '최신 포스트 | EziLog',
      description: 'EziLog의 최신 개발 관련 포스트를 확인해보세요.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

// 가져올 포스트 수
const POSTS_COUNT = 12;

// 최신 포스트 목록을 가져오는 비동기 컴포넌트
async function PostList() {
  try {
    // Strapi에서 최신 12개 포스트 가져오기 (이미 publishedAt:desc로 정렬됨)
    const posts = await getAllPosts(POSTS_COUNT, 0);
    
    return <PostListGrid posts={posts} />;
  } catch (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">포스트를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }
}

export default function Latest() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
