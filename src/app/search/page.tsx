import { Metadata } from "next";
import SearchResults from "@/components/search/SearchResults";
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

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

async function fetchAllPosts() {
  try {
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    const postsData = fs.readFileSync(postsPath, 'utf-8');
    const rawData = JSON.parse(postsData);

    const rawPosts = Array.isArray(rawData) ? rawData : rawData.posts;
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
    return [];
  }
}

export default async function SearchPage() {
  const allPosts = await fetchAllPosts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SearchResults initialPosts={allPosts} />
    </div>
  );
} 