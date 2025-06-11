// import { Suspense } from "react"; // Suspense 제거
import { Metadata } from "next";
import { getAllCategories, getCategoryBySlug, getCategoryPosts, getCategoryPostCount, getTopLevelCategories } from "@/lib/api";
import CategoryPostList, { POSTS_PER_PAGE } from "@/components/category/CategoryPostList";

// 정적 페이지 생성 설정
export const dynamic = 'force-static';

// 빌드 시 정적으로 생성할 경로 정의 (완전한 버전)
export async function generateStaticParams() {
  try {
    // 1레벨 카테고리와 자식 카테고리들을 모두 가져오기
    const topLevelCategoriesResponse = await getTopLevelCategories();
    const topLevelCategories = topLevelCategoriesResponse.data || [];
    
    // 모든 카테고리 수집 (1레벨 + 2레벨)
    const allCategories = [];
    
    // 1레벨 카테고리들 추가
    for (const topCategory of topLevelCategories) {
      allCategories.push({
        slug: topCategory.slug,
        level: 1
      });
      
      // 2레벨 카테고리들 추가
      if (topCategory.categories && topCategory.categories.length > 0) {
        for (const childCategory of topCategory.categories) {
          allCategories.push({
            slug: childCategory.slug,
            level: 2
          });
        }
      }
    } 
    // 병렬 처리로 빌드 시간 단축
    const categoryPromises = allCategories.map(async (category: any) => {
      try {
        const categoryPaths = [];
        
        // 1페이지: /category/react (page 파라미터 없음)
        categoryPaths.push({ slug: category.slug, page: undefined });
        
        // 포스트 총 개수를 한 번에 가져와서 필요한 페이지 수 계산
        const totalPosts = await getCategoryPostCount(category.slug);
        const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
        
        // 계산된 페이지 수만큼 정적 경로 생성 (최대 50페이지 제한)
        const maxPages = Math.min(totalPages, 50);
        
        for (let page = 2; page <= maxPages; page++) {
          categoryPaths.push({
            slug: category.slug,
            page: [page.toString()]
          });
        }
        
        return categoryPaths;
      } catch (error) {
        console.error(`Error generating paths for category ${category.slug}:`, error);
        // 에러 발생 시 최소한 첫 페이지는 생성
        return [{ slug: category.slug, page: undefined }];
      }
    });
    
    // 모든 카테고리의 페이지들을 병렬로 생성
    const allCategoryPaths = await Promise.all(categoryPromises);    
    // 2차원 배열을 1차원으로 평탄화
    const paths = allCategoryPaths.flat();

    return paths;
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    // 전체 실패 시 빈 배열 반환하여 런타임 생성으로 폴백
    return [];
  }
}

// SEO 최적화를 위한 메타데이터 생성
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const slug = params.slug;
  const pageNumber = getPageNumber(params.page);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  
  try {
    const category = await getCategoryBySlug(slug);
    const categoryName = category?.name || slug;
    const totalPosts = await getCategoryPostCount(slug);
    
    // Canonical URL 생성
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

// 페이지 번호 추출 함수 (옵셔널 라우팅용)
function getPageNumber(pageParam?: string[]): number {
  if (!pageParam || pageParam.length === 0) return 1;
  const pageNumber = parseInt(pageParam[0], 10);
  return isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
}

// 통합된 카테고리 페이지 컴포넌트
export default async function CategoryPage({ params }: any) {
  const slug = params.slug;
  const page = getPageNumber(params.page);
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <CategoryPostList slug={slug} page={page} />
    </div>
  );
} 