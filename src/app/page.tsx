import { Suspense } from "react";
import { Metadata } from "next";
import { PostData } from "@/components/ui/PostCard";
import PostListGrid from "@/components/ui/PostListGrid";
import FeaturedPost from "@/components/ui/FeaturedPost";
import { getPostBySlug } from "@/lib/api";
import * as fs from 'fs';
import * as path from 'path';


export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    title: 'EziLog 개발자를 위한 기술 블로그',
    description: '최신 개발 기술과 프로그래밍 트렌드를 다루는 EziLog입니다. React, Next.js, JavaScript, TypeScript 등 웹 개발 정보를 제공합니다.',
    keywords: ['EziLog', '개발 블로그', 'React', 'Next.js', 'JavaScript', 'TypeScript', '웹 개발', '카카오테크 캠퍼스', 'aws'],
    authors: [{ name: 'EziLog' }],
    creator: 'EziLog',
    publisher: 'EziLog',
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: 'EziLog : 개발자를 위한 기술 블로그',
      description: '최신 개발 기술과 프로그래밍 트렌드를 다루는 EziLog입니다.',
      url: siteUrl,
      siteName: 'EziLog',
      type: 'website',
      locale: 'ko_KR',
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'EziLog : 개발자를 위한 기술 블로그',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'EziLog : 개발자를 위한 기술 블로그',
      description: '최신 개발 기술과 프로그래밍 트렌드를 다루는 EziLog입니다.',
      images: [`${siteUrl}/og-image.png`],
      creator: '@EziLog',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
  };
}

const FEATURED_POST_SLUGS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

async function loadStaticPosts(): Promise<PostData[]> {
  try {
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      const posts = Array.isArray(postsData) ? postsData : postsData.posts;

      return posts.map((post: any) => ({
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
    }
  } catch (error) {
  }
  return [];
}

async function PostList() {
  try {
    const staticPosts = await loadStaticPosts(); 
    let posts: PostData[] = [];
    
    if (staticPosts.length > 0) {
      posts = FEATURED_POST_SLUGS
        .map(slug => staticPosts.find(post => post.slug === slug))
        .filter((post): post is PostData => post !== undefined);
    } else {
      const postPromises = FEATURED_POST_SLUGS.map(slug => getPostBySlug(slug));
      const postsResults = await Promise.all(postPromises);
      posts = postsResults.filter((post): post is PostData => post !== null);
    }

    const [featuredPost, ...remainingPosts] = posts;
    
    return (
      <>
        {featuredPost && <FeaturedPost post={featuredPost} />}
        {remainingPosts.length > 0 && <PostListGrid posts={remainingPosts} />}
      </>
    );
  } catch (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">포스트를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }
}

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto py-12">
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
