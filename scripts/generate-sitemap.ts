import * as fs from 'fs';

if (!process.env.VERCEL && !process.env.NODE_ENV) {
  const { config } = require('dotenv');
  config();
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const API_BASE_URL = process.env.STRAPI_API_URL;

if (!SITE_URL || !API_BASE_URL) {
  console.error('❌ 필수 환경변수가 설정되지 않았습니다:');
  if (!SITE_URL) console.error('  - NEXT_PUBLIC_SITE_URL');
  if (!API_BASE_URL) console.error('  - STRAPI_API_URL 또는 NEXT_PUBLIC_STRAPI_API_URL');
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

async function getCategoryPostCount(slug: string, categoryId: number): Promise<number> {
  try {
    const countParams = new URLSearchParams({
      'filters[category][id][$eq]': categoryId.toString(),
      'pagination[limit]': '1'
    });

    const postsResponse = await fetch(`${API_BASE_URL}/api/posts?${countParams}`);
    if (!postsResponse.ok) return 0;
    
    const postsData = await postsResponse.json();
    return postsData.meta?.pagination?.total || 0;
  } catch (error) {
    console.warn(`⚠️ ${slug} 포스트 개수 가져오기 실패:`, error);
    return 0;
  }
}

async function generateSitemap(): Promise<void> {
  try {
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
 
    try {    
      const categoriesParams = new URLSearchParams({
        'fields[0]': 'name',
        'fields[1]': 'slug',
        'fields[2]': 'updatedAt',
        'sort': 'name:asc',
        'pagination[limit]': '100'
      });
      
      const categoriesResponse = await fetch(`${API_BASE_URL}/api/categories?${categoriesParams}`);
      
      if (!categoriesResponse.ok) {
        throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
      }
      
      const categoriesData = await categoriesResponse.json();
      const allCategories: any[] = categoriesData.data || [];
      
      const POSTS_PER_PAGE = 6;
      
      for (const category of allCategories) {
        const lastmod = new Date(category.updatedAt || new Date()).toISOString();

        allPages.push({
          url: `${SITE_URL}/category/${category.slug}`,
          lastmod: lastmod
        });

        try {
          const totalPosts = await getCategoryPostCount(category.slug, category.id);
          const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

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

    fs.writeFileSync('./public/sitemap.xml', sitemap);

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