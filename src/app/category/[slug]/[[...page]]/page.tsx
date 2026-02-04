import { Metadata } from "next";
import { getAllCategories, getCategoryBySlug, getCategoryPostCount } from "@/lib/api";
import CategoryPostList, { POSTS_PER_PAGE } from "@/components/category/CategoryPostList";
import { generateCategoryMetadata, generateCategoryNotFoundMetadata } from "@/lib/metadata";

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const allCategoriesData = await getAllCategories();

    const categoryPromises = allCategoriesData.map(async (category: any) => {
      try {
        const categoryPaths = [];

        categoryPaths.push({ slug: category.slug, page: undefined });

        const totalPosts = await getCategoryPostCount(category.slug);
        const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
        const maxPages = Math.min(totalPages, 50);
        
        for (let page = 2; page <= maxPages; page++) {
          categoryPaths.push({
            slug: category.slug,
            page: [page.toString()]
          });
        }
        
        return categoryPaths;
      } catch (error) {
        return [{ slug: category.slug, page: undefined }];
      }
    });

    const allCategoryPaths = await Promise.all(categoryPromises);    
    const paths = allCategoryPaths.flat();
    return paths;
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug, page } = await params;
  const pageNumber = getPageNumber(page);

  try {
    const category = await getCategoryBySlug(slug);
    const categoryName = category?.name || slug;
    const totalPosts = await getCategoryPostCount(slug);

    return generateCategoryMetadata({
      name: categoryName,
      slug,
      totalPosts,
      pageNumber,
    });
  } catch (error) {
    return generateCategoryNotFoundMetadata(slug, pageNumber);
  }
}
function getPageNumber(pageParam?: string[]): number {
  if (!pageParam || pageParam.length === 0) return 1;
  const pageNumber = parseInt(pageParam[0], 10);
  return isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
}

export default async function CategoryPage({ params }: any) {
  const { slug, page: pageParam } = await params;
  const page = getPageNumber(pageParam);
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <CategoryPostList slug={slug} page={page} />
    </div>
  );
} 