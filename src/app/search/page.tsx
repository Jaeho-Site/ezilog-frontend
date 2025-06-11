import { Metadata } from "next";
import SearchResults from "@/components/search/SearchResults";
import fs from 'fs';
import path from 'path';

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// SEO 메타데이터 강화
export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_UR;
  const canonicalUrl = `${siteUrl}/search`;
  
  return {
    title: '포스트 검색 | EziLog',
    description: 'EziLog의 모든 개발 관련 포스트를 검색할 수 있습니다. 카테고리별, 태그별, 키워드별로 원하는 기술 정보를 빠르게 찾아보세요.',
    keywords: ['검색', '포스트 검색', '개발', '프로그래밍', '기술', 'EziLog', '블로그'],
    authors: [{ name: 'EziLog' }],
    creator: 'EziLog',
    publisher: 'EziLog',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: '포스트 검색 | EziLog',
      description: 'EziLog의 모든 개발 관련 포스트를 검색할 수 있습니다.',
      url: canonicalUrl,
      siteName: 'EziLog',
      type: 'website',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary',
      title: '포스트 검색 | EziLog',
      description: 'EziLog의 모든 개발 관련 포스트를 검색할 수 있습니다.',
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

// 서버 컴포넌트에서 정적 포스트 데이터 가져오기
async function fetchAllPosts() {
  try {
    // 빌드 시점에 생성된 정적 데이터 읽기
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    const postsData = fs.readFileSync(postsPath, 'utf-8');
    const rawPosts = JSON.parse(postsData);
    
    // PostCard 컴포넌트가 기대하는 형태로 데이터 변환
    const transformedPosts = rawPosts.map((post: any) => ({
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
    
    return transformedPosts;
  } catch (error) {
    console.error('포스트 데이터 로드 실패:', error);
    return [];
  }
}

// 검색 페이지 - 서버 컴포넌트 (SSG)
export default async function SearchPage() {
  // 정적 포스트 데이터 가져오기 (build time에 실행)
  const allPosts = await fetchAllPosts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 클라이언트 컴포넌트에 모든 포스트 데이터 전달 */}
      <SearchResults initialPosts={allPosts} />
    </div>
  );
} 