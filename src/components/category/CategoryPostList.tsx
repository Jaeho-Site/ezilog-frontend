import PostListGrid from "@/components/ui/PostListGrid";
import Pagination from "@/components/ui/Pagination";
import { getCategoryBySlug, getCategoryPosts } from "@/lib/api";
import * as fs from 'fs';
import * as path from 'path';

export const POSTS_PER_PAGE = 6;

interface CategoryPostListProps {
  slug: string;
  page?: number;
}

async function loadStaticCategories() {
  try {
    const categoriesPath = path.join(process.cwd(), 'public', 'data', 'categories.json');
    if (fs.existsSync(categoriesPath)) {
      const data = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
      return Array.isArray(data) ? data : data.categories;
    }
  } catch (error) {
  }
  return [];
}

async function loadStaticPosts() {
  try {
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const data = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      const posts = Array.isArray(data) ? data : data.posts;

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

function filterPostsByCategory(posts: any[], categorySlug: string, limit: number, offset: number) {
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
    let category: any = null;
    let posts: any[] = [];
    
    if (staticCategories.length > 0 && staticPosts.length > 0) {
      category = staticCategories.find((cat: any) => cat.slug === slug);
      
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
  } catch (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">포스트를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }
} 