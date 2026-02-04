import { Suspense } from "react";
import { Metadata } from "next";
import { PostData } from "@/components/ui/PostCard";
import PostListGrid from "@/components/ui/PostListGrid";
import FeaturedPost from "@/components/ui/FeaturedPost";
import { getPostBySlug } from "@/lib/api";
import { generateHomeMetadata } from "@/lib/metadata";
import * as fs from 'fs';
import * as path from 'path';


export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateHomeMetadata();
}

const FEATURED_POST_SLUGS = ['about-blog', '2025-with-kakaotechcampus', 
  'nextjs-kubernetes-1', 'nextjs-kubernetes-2', 'vite-to-nextjs-migration', 
  'authentication-authorization-jwt', 'frontend-aws-serverless'];

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
        publishedDate: post.PublishedDate || post.publishedAt,
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
