import { Metadata } from "next";
import PostListGrid from "@/components/ui/PostListGrid";
import FeaturedPost from "@/components/ui/FeaturedPost";
import { getAllPosts } from "@/lib/content";
import { generateHomeMetadata } from "@/lib/metadata";

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateHomeMetadata();
}

// TODO: Strapi에 featured 필드를 추가해 CMS에서 관리하도록 이관
const FEATURED_POST_SLUGS = ['about-blog', 'how-i-do-harness-engineering', '2025-with-kakaotechcampus',
  'javascript-prototype-visual-guide', 'aws-3-tier-web-architecture', 'vite-to-nextjs-migration',
  'frontend-aws-serverless'];

export default function Home() {
  const allPosts = getAllPosts();
  const posts = FEATURED_POST_SLUGS
    .map((slug) => allPosts.find((post) => post.slug === slug))
    .filter((post) => post !== undefined);

  const [featuredPost, ...remainingPosts] = posts;

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="sr-only">EziLog — 개발 블로그</h1>
      {featuredPost && <FeaturedPost post={featuredPost} />}
      {remainingPosts.length > 0 && <PostListGrid posts={remainingPosts} preloadCount={2} />}
    </div>
  );
}
