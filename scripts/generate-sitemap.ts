import * as fs from 'fs';

// 🎯 로컬 개발환경에서만 .env 파일 로드
if (!process.env.VERCEL && !process.env.NODE_ENV) {
  const { config } = require('dotenv');
  config();
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const API_BASE_URL = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL;

if (!SITE_URL || !API_BASE_URL) {
  console.error('❌ 필수 환경변수가 설정되지 않았습니다:');
  if (!SITE_URL) console.error('  - NEXT_PUBLIC_SITE_URL');
  if (!API_BASE_URL) console.error('  - STRAPI_API_URL (권장) 또는 NEXT_PUBLIC_STRAPI_API_URL');
  process.exit(1);
}

interface PageInfo {
  url: string;
  lastmod: string;
}

interface PostData {
  slug: string;
  publishedAt?: string;
  updatedAt?: string;
}

// XML 이스케이프 함수
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

async function generateSitemap(): Promise<void> {
  try {
    // 정적 페이지들 (빌드 시점을 lastmod로 사용)
    const buildTime = new Date().toISOString();
    const staticPages: PageInfo[] = [
      {
        url: SITE_URL!,
        lastmod: buildTime
      },
      {
        url: `${SITE_URL}/search`,
        lastmod: buildTime
      },
      {
        url: `${SITE_URL}/latest`,
        lastmod: buildTime
      },
      {
        url: `${SITE_URL}/search?type=tags`,
        lastmod: buildTime
      }
    ];
    
    let allPages: PageInfo[] = [...staticPages];
    
    // 포스트 데이터 가져오기 (필요한 필드만)
    try {
      const postsParams = new URLSearchParams({
        'fields[0]': 'slug',
        'fields[1]': 'publishedAt',
        'fields[2]': 'updatedAt',
        'pagination[limit]': '1000',
        'sort': 'publishedAt:desc'
      });
      
      const postsResponse = await fetch(`${API_BASE_URL}/api/posts?${postsParams}`);
      
      if (!postsResponse.ok) {
        throw new Error(`HTTP error! status: ${postsResponse.status}`);
      }
      
      const postsData = await postsResponse.json();
      const posts: PostData[] = postsData.data || [];
      
      posts.forEach((post: PostData) => {
        allPages.push({
          url: `${SITE_URL}/post/${post.slug}`,
          lastmod: new Date(post.publishedAt || post.updatedAt || new Date()).toISOString()
        });
      });

    } catch (error: any) {
      console.warn('⚠️ 포스트 데이터 가져오기 실패:', error.message);
    }
    // 카테고리 데이터 가져오기 (page.tsx와 동일한 방식으로 수정)
    try {    
      // 1레벨 카테고리와 자식 카테고리들을 모두 가져오기
      const categoriesParams = new URLSearchParams({
        'filters[level][$eq]': '1',
        'fields[0]': 'name',
        'fields[1]': 'slug',
        'fields[2]': 'updatedAt',
        'populate[categories][fields][0]': 'name',
        'populate[categories][fields][1]': 'slug',
        'populate[categories][populate][posts][fields][0]': 'id',
        'populate[posts][fields][0]': 'id'
      });
      
      const categoriesResponse = await fetch(`${API_BASE_URL}/api/categories?${categoriesParams}`);
      
      if (!categoriesResponse.ok) {
        throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
      }
      
      const categoriesData = await categoriesResponse.json();
      const topLevelCategories: any[] = categoriesData.data || [];
      const addedCategories = new Set<string>();
      const POSTS_PER_PAGE = 6; // CategoryPostList의 POSTS_PER_PAGE와 동일
      
      // 모든 카테고리 수집 (1레벨 + 2레벨)
      const allCategories: any[] = [];
      
      // 1레벨 카테고리들 추가
      for (const topCategory of topLevelCategories) {
        allCategories.push({
          ...topCategory,
          level: 1
        });
        
        // 2레벨 카테고리들 추가
        if (topCategory.categories && topCategory.categories.length > 0) {
          for (const childCategory of topCategory.categories) {
            allCategories.push({
              ...childCategory,
              level: 2
            });
          }
        }
      }
      
      for (const category of allCategories) {
        if (!addedCategories.has(category.slug)) {
          addedCategories.add(category.slug);
          const lastmod = new Date(category.updatedAt || category.createdAt || new Date()).toISOString();
          
          // 1페이지 추가
          allPages.push({
            url: `${SITE_URL}/category/${category.slug}`,
            lastmod: lastmod
          });
          
          // 페이지네이션 페이지들 추가 - getCategoryPostCount와 동일한 로직 사용
          try {
            let totalPosts = 0;
            
            if (category.level === 1) {
              // 1레벨 카테고리인 경우: 자식 카테고리들의 포스트 개수 합산
              const topCategoryData = topLevelCategories.find(tc => tc.slug === category.slug);
              if (topCategoryData?.categories) {
                const childCategoryIds = topCategoryData.categories.map((child: any) => child.id);
                
                if (childCategoryIds.length > 0) {
                  const postsCountParams = new URLSearchParams({
                    'filters[category][id][$in]': childCategoryIds.join(','),
                    'pagination[limit]': '1'
                  });
                  
                  const postsCountResponse = await fetch(`${API_BASE_URL}/api/posts?${postsCountParams}`);
                  
                  if (postsCountResponse.ok) {
                    const postsCountData = await postsCountResponse.json();
                    totalPosts = postsCountData.meta?.pagination?.total || 0;
                  }
                }
              }
            } else {
              // 2레벨 카테고리인 경우: 해당 카테고리의 포스트 개수
              const postsCountParams = new URLSearchParams({
                'filters[category][id][$eq]': category.id.toString(),
                'pagination[limit]': '1'
              });
              
              const postsCountResponse = await fetch(`${API_BASE_URL}/api/posts?${postsCountParams}`);
              
              if (postsCountResponse.ok) {
                const postsCountData = await postsCountResponse.json();
                totalPosts = postsCountData.meta?.pagination?.total || 0;
              }
            }
            
            const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
            
            // 2페이지부터 추가 (최대 10페이지까지만 사이트맵에 포함)
            for (let page = 2; page <= Math.min(totalPages, 10); page++) {
              allPages.push({
                url: `${SITE_URL}/category/${category.slug}/${page}`,
                lastmod: lastmod
              });
            }
            
          } catch (pageError: any) {
            console.warn(`⚠️ ${category.slug} 페이지네이션 처리 실패:`, pageError.message);
          }
        }
      }
      
    } catch (error: any) {
      console.warn('⚠️ 카테고리 데이터 가져오기 실패:', error.message);
    }

    // sitemap.xml 생성
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page: PageInfo) => `  <url>
    <loc>${escapeXml(page.url)}</loc>
    <lastmod>${page.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`;

    // public/sitemap.xml에 저장
    fs.writeFileSync('./public/sitemap.xml', sitemap);
    
    // robots.txt 생성
    const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml`;
    
    fs.writeFileSync('./public/robots.txt', robotsTxt);
    
  } catch (error: any) {
    console.error('❌ 사이트맵 생성 실패:', error);
    process.exit(1);
  }
}

generateSitemap(); 