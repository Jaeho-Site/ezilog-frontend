const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

// XML 이스케이프 함수
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function generateSitemap() {
  try {
    // 정적 페이지들 (빌드 시점을 lastmod로 사용)
    const buildTime = new Date().toISOString();
    const staticPages = [
      {
        url: SITE_URL,
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
    
    let allPages = [...staticPages];
    
    // 포스트 데이터 가져오기 (필요한 필드만)
    try {
      const postsResponse = await axios.get(`${API_BASE_URL}/api/posts`, {
        params: {
          fields: ['slug', 'publishedAt', 'updatedAt'],
          pagination: {
            limit: 1000 // 충분히 큰 수로 모든 포스트 가져오기
          },
          sort: 'publishedAt:desc'
        }
      });
      const posts = postsResponse.data.data || [];
      
              posts.forEach(post => {
          allPages.push({
            url: `${SITE_URL}/post/${post.slug}`,
            lastmod: new Date(post.publishedAt || post.updatedAt).toISOString()
          });
        });
    } catch (error) {
      console.warn('⚠️ 포스트 데이터 가져오기 실패:', error.message);
    }
    // 카테고리 데이터 가져오기 (getAllCategories와 동일한 방식)
    try {
      const categoriesResponse = await axios.get(`${API_BASE_URL}/api/categories`, {
        params: {
          fields: ['slug', 'updatedAt'],
          populate: {
            posts: {
              count: true
            }
          },
          pagination: {
            limit: 1000
          }
        }
      });
      const categories = categoriesResponse.data.data || [];  
      const addedCategories = new Set();
      const POSTS_PER_PAGE = 6; // CategoryPostList의 POSTS_PER_PAGE와 동일
      
      for (const category of categories) {
        if (!addedCategories.has(category.slug)) {
          addedCategories.add(category.slug);
          const lastmod = new Date(category.updatedAt || category.createdAt || new Date()).toISOString();
          
          // 1페이지 추가
          allPages.push({
            url: `${SITE_URL}/category/${category.slug}`,
            lastmod: lastmod
          });
          
          // 페이지네이션 페이지들 추가
          try {
            const postsCountResponse = await axios.get(`${API_BASE_URL}/api/posts`, {
              params: {
                filters: {
                  category: { id: { $eq: category.id } }
                },
                pagination: { limit: 1 }
              }
            });
            
            const totalPosts = postsCountResponse.data.meta?.pagination?.total || 0;
            const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
            
            // 2페이지부터 추가 (최대 10페이지까지만 사이트맵에 포함)
            for (let page = 2; page <= Math.min(totalPages, 10); page++) {
              allPages.push({
                url: `${SITE_URL}/category/${category.slug}/${page}`,
                lastmod: lastmod
              });
            }
            
          } catch (pageError) {
            console.warn(`⚠️ ${category.slug} 페이지네이션 처리 실패:`, pageError.message);
          }
        }
      }
      
    } catch (error) {
      console.warn('⚠️ 카테고리 데이터 가져오기 실패:', error.message);
    }
    // sitemap.xml 생성
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
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
  } catch (error) {
    process.exit(1);
  }
}

generateSitemap(); 