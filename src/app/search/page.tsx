import { Metadata } from "next";
import SearchResults from "@/components/search/SearchResults";
import fs from 'fs';
import path from 'path';
import { generateSearchMetadata } from "@/lib/metadata";

export const dynamic = 'force-static';

type SearchPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : undefined;
  
  return generateSearchMetadata({ query });
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