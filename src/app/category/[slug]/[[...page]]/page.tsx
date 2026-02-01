import { Metadata } from "next";
import { getAllCategories, getCategoryBySlug, getCategoryPostCount } from "@/lib/api";
import CategoryPostList, { POSTS_PER_PAGE } from "@/components/category/CategoryPostList";

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const category = await getCategoryBySlug(slug);
    const categoryName = category?.name || slug;
    const totalPosts = await getCategoryPostCount(slug);

    const canonicalUrl = pageNumber === 1 
      ? `${siteUrl}/category/${slug}`
      : `${siteUrl}/category/${slug}/${pageNumber}`;
    
    if (pageNumber === 1) {
      return {
        title: `${categoryName} 카테고리 | EziLog`,
        description: `${categoryName} 카테고리의 ${totalPosts}개 포스트를 확인해보세요. 최신 기술 동향과 개발 팁을 만나보세요.`,
        keywords: [`${categoryName}`, '개발', '프로그래밍', '기술', 'EziLog'],
        authors: [{ name: 'EziLog' }],
        creator: 'EziLog',
        publisher: 'EziLog',
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title: `${categoryName} 카테고리 | EziLog`,
          description: `${categoryName} 카테고리의 ${totalPosts}개 포스트를 확인해보세요.`,
          url: canonicalUrl,
          siteName: 'EziLog',
          type: 'website',
          locale: 'ko_KR',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${categoryName} 카테고리 | EziLog`,
          description: `${categoryName} 카테고리의 ${totalPosts}개 포스트를 확인해보세요.`,
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
    } else {
      return {
        title: `${categoryName} 카테고리 ${pageNumber}페이지 | EziLog`,
        description: `${categoryName} 카테고리의 포스트 목록 ${pageNumber}페이지입니다. 더 많은 개발 관련 포스트를 확인해보세요.`,
        keywords: [`${categoryName}`, '개발', '프로그래밍', '기술', 'EziLog'],
        authors: [{ name: 'EziLog' }],
        creator: 'EziLog',
        publisher: 'EziLog',
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title: `${categoryName} 카테고리 ${pageNumber}페이지 | EziLog`,
          description: `${categoryName} 카테고리의 포스트 목록 ${pageNumber}페이지입니다.`,
          url: canonicalUrl,
          siteName: 'EziLog',
          type: 'website',
          locale: 'ko_KR',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${categoryName} 카테고리 ${pageNumber}페이지 | EziLog`,
          description: `${categoryName} 카테고리의 포스트 목록 ${pageNumber}페이지입니다.`,
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
  } catch (error) {
    const canonicalUrl = pageNumber === 1 
      ? `${siteUrl}/category/${slug}`
      : `${siteUrl}/category/${slug}/${pageNumber}`;
      
    return {
      title: '카테고리 | EziLog',
      description: '카테고리별 포스트를 확인해보세요.',
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
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