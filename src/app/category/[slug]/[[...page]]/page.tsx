import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategories, getCategoryBySlug, getPostsByCategory } from "@/lib/content";
import PostListGrid from "@/components/ui/PostListGrid";
import Pagination from "@/components/ui/Pagination";
import { generateCategoryMetadata, generateCategoryNotFoundMetadata } from "@/lib/metadata";

export const dynamic = 'force-static';
const POSTS_PER_PAGE = 6;

export async function generateStaticParams() {
  return getAllCategories().flatMap((category) => {
    const totalPages = Math.max(1, Math.ceil(category.postCount / POSTS_PER_PAGE));

    return Array.from({ length: totalPages }, (_, i) => ({
      slug: category.slug,
      page: i === 0 ? undefined : [String(i + 1)],
    }));
  });
}

interface PageParams {
  params: Promise<{ slug: string; page?: string[] }>;
}

function getPageNumber(pageParam?: string[]): number {
  if (!pageParam || pageParam.length === 0) return 1;
  const pageNumber = parseInt(pageParam[0], 10);
  return isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug, page } = await params;
  const pageNumber = getPageNumber(page);
  const category = getCategoryBySlug(slug);

  if (!category) {
    return generateCategoryNotFoundMetadata(slug, pageNumber);
  }

  return generateCategoryMetadata({
    name: category.name,
    slug,
    totalPosts: category.postCount,
    pageNumber,
  });
}

export default async function CategoryPage({ params }: PageParams) {
  const { slug, page: pageParam } = await params;
  const page = getPageNumber(pageParam);

  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const allPosts = getPostsByCategory(slug);
  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const posts = allPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PostListGrid
        posts={posts}
        showTitle={true}
        title={category.name}
        emptyMessage="해당 카테고리에 포스트가 없습니다."
      />

      {posts.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`/category/${slug}`}
        />
      )}
    </div>
  );
}
