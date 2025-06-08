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
          fields: ['slug', 'updatedAt'], // updatedAt 추가
          pagination: {
            limit: 1000 // 모든 카테고리 가져오기
          }
        }
      });
      const categories = categoriesResponse.data.data || [];  
      // 중복 제거를 위해 Set 사용
      const addedCategories = new Set();
      
      categories.forEach(category => {
        if (!addedCategories.has(category.slug)) {
          addedCategories.add(category.slug);
          allPages.push({
            url: `${SITE_URL}/category/${category.slug}`,
            lastmod: new Date(category.updatedAt || category.createdAt || new Date()).toISOString()
          });
        }
      });
      
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