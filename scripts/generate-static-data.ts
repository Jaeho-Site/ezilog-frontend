import * as fs from 'fs';
import * as path from 'path';

if (!process.env.VERCEL && !process.env.NODE_ENV) {
  const { config } = require('dotenv');
  config();
}

const API_BASE_URL = process.env.STRAPI_API_URL;

if (!API_BASE_URL) {
  console.error('❌ API URL 환경변수가 설정되지 않았습니다:');
  console.error('  - STRAPI_API_URL');
  process.exit(1);
}

interface Category {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}

interface CleanedPost {
  id: number;
  title: string;
  slug: string;
  description?: string;
  publishedAt: string;
  cover: {
    url: string;
  } | null;
  tags: Array<{
    name: string;
    slug: string;
  }>;
  category: {
    name: string;
    slug: string;
  } | null;
}

async function generateStaticData(): Promise<void> {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    await generateCategoriesData(dataDir);
    await generatePostsData(dataDir);

  } catch (error) {
    console.error('❌ 정적 데이터 생성 중 오류 발생:', error);
    process.exit(1);
  }
}

async function generateCategoriesData(dataDir: string): Promise<void> {
  try {
    const params = new URLSearchParams({
      'fields[0]': 'name',
      'fields[1]': 'slug',
      'populate[posts][fields][0]': 'id',
      'sort': 'name:asc',
      'pagination[limit]': '100'
    });

    const response = await fetch(`${API_BASE_URL}/api/categories?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const categories: any[] = data.data || [];

    const cleanedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      postCount: Array.isArray(category.posts) ? category.posts.length : 0
    }));

    const categoriesPath = path.join(dataDir, 'categories.json');
    fs.writeFileSync(categoriesPath, JSON.stringify(cleanedCategories, null, 2));
    console.log(`✅ 카테고리 데이터 생성 완료: ${cleanedCategories.length}개`);
  } catch (error: any) {
    console.error('❌ 카테고리 데이터 생성 실패:', error.message);
    throw error;
  }
}

async function generatePostsData(dataDir: string): Promise<void> {
  try {   
    const S3_DOMAIN = process.env.S3_DOMAIN || '';
    const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || '';

    let allPosts: CleanedPost[] = [];
    let page = 1;
    const pageSize = 25;
    
    while (true) {
      const params = new URLSearchParams({
        'sort': 'publishedAt:desc',
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        'fields[0]': 'title',
        'fields[1]': 'slug', 
        'fields[2]': 'publishedAt',
        'fields[3]': 'description',
        'populate[cover][fields][0]': 'url',
        'populate[tags][fields][0]': 'name',
        'populate[tags][fields][1]': 'slug',
        'populate[category][fields][0]': 'name',
        'populate[category][fields][1]': 'slug'
      });

      const response = await fetch(`${API_BASE_URL}/api/posts?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const posts: any[] = data.data || [];
      
      if (posts.length === 0) break;

      const cleanedPosts: CleanedPost[] = posts.map((post: any) => {
        let coverUrl: string | null = null;
        if (post.cover?.url) {
          const url: string = post.cover.url;
          if (url.includes('amazonaws.com') && S3_DOMAIN && CLOUDFRONT_DOMAIN) {
            coverUrl = url.replace(
              new RegExp(`https://${S3_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
              CLOUDFRONT_DOMAIN.replace(/\/$/, '')
            );
          }
          else if (url.startsWith('/')) {
            coverUrl = `${CLOUDFRONT_DOMAIN || API_BASE_URL}${url}`;
          } 
          else if (url.startsWith('http://') || url.startsWith('https://')) {
            coverUrl = url;
          } 
          else {
            coverUrl = `${CLOUDFRONT_DOMAIN || API_BASE_URL}/${url}`;
          }
        }

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          description: post.description,
          publishedAt: post.publishedAt,
          cover: coverUrl ? {
            url: coverUrl
          } : null,
          tags: (post.tags || []).map((tag: any) => ({
            name: tag.name,
            slug: tag.slug
          })),
          category: post.category ? {
            name: post.category.name,
            slug: post.category.slug
          } : null
        };
      });
      
      allPosts = allPosts.concat(cleanedPosts);
      if (posts.length < pageSize) break;
      page++;
    }

    const postsPath = path.join(dataDir, 'posts.json');
    fs.writeFileSync(postsPath, JSON.stringify(allPosts, null, 2));
  } catch (error: any) {
    console.error('❌ 포스트 데이터 생성 실패:', error.message);
    throw error;
  }
}

generateStaticData(); 