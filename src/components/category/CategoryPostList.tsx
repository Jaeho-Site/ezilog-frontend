import PostListGrid from "@/components/ui/PostListGrid";
import Pagination from "@/components/ui/Pagination";
import { getCategoryBySlug, getCategoryPosts } from "@/lib/api";
import { Post, Category } from "@/types/models";
import * as fs from 'fs';
import * as path from 'path';

export const POSTS_PER_PAGE = 6;

interface CategoryPostListProps {
  slug: string;
  page?: number;
}

async function loadStaticCategories(): Promise<Category[]> {
  try {
    const categoriesPath = path.join(process.cwd(), 'public', 'data', 'categories.json');
    if (fs.existsSync(categoriesPath)) {
      const data = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
      return Array.isArray(data) ? data : data.categories;
    }
  } catch (error: unknown) { return []; }
  return [];
}

interface RawStaticPost {
  id: number;
  title: string;
  description?: string;
  slug: string;
  cover?: {
    url: string;
  };
  publishedAt: string;
  category?: {
    id?: number;
    name: string;
    slug: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

async function loadStaticPosts(): Promise<Post[]> {
  try {
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const data = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      const posts: RawStaticPost[] = Array.isArray(data) ? data : data.posts;

      return posts.map((post): Post => ({
        id: post.id,
        title: post.title,
        description: post.description || '',
        slug: post.slug,
        coverImage: post.cover ? {
          url: post.cover.url,
          alt: post.title
        } : null,
        publishedDate: post.publishedAt,
        category: {
          id: post.category?.id ?? 0,
          name: post.category?.name ?? '미분류',
          slug: post.category?.slug ?? 'uncategorized'
        },
        tags: post.tags || []
      }));
    }
  } catch (error: unknown) {
    // 에러 무시
  }
  return [];
}

function filterPostsByCategory(posts: Post[], categorySlug: string, limit: number, offset: number): Post[] {
  const filteredPosts = posts.filter(post => 
    post.category && post.category.slug === categorySlug
  );

  filteredPosts.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

  return filteredPosts.slice(offset, offset + limit);
}

export default async function CategoryPostList({ slug, page = 1 }: CategoryPostListProps) {
  try {
    const [staticCategories, staticPosts] = await Promise.all([
      loadStaticCategories(),
      loadStaticPosts()
    ]);
    let category: Category | null = null;
    let posts: Post[] = [];
    
    if (staticCategories.length > 0 && staticPosts.length > 0) {
      category = staticCategories.find((cat: Category) => cat.slug === slug) || null;
      
      if (category) {
        posts = filterPostsByCategory(
          staticPosts, 
          slug, 
          POSTS_PER_PAGE, 
          (page - 1) * POSTS_PER_PAGE
        );
      }
    } else {
      category = await getCategoryBySlug(slug);
      if (category) {
        posts = await getCategoryPosts(slug, POSTS_PER_PAGE, (page - 1) * POSTS_PER_PAGE);
      }
    }
    
    if (!category) {
      return (
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">카테고리를 찾을 수 없습니다</h1>
          <p className="text-gray-600 dark:text-gray-400">요청하신 카테고리가 존재하지 않습니다.</p>
        </div>
      );
    }
    
    const categoryName = category.name || slug;
    const filteredPosts = posts.filter(Boolean);
    return (
      <>
        <PostListGrid 
          posts={filteredPosts}
          showTitle={true}
          title={categoryName}
          emptyMessage="해당 카테고리에 포스트가 없습니다."
        />

        {filteredPosts.length > 0 && (
          <Pagination 
            currentPage={page} 
            hasMore={posts.length === POSTS_PER_PAGE} 
            basePath={`/category/${slug}`}
          />
        )}
      </>
    );
  } catch (error: unknown) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">포스트를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }
} 