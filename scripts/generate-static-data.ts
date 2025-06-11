import * as fs from 'fs';
import * as path from 'path';

// 🎯 로컬 개발환경에서만 .env 파일 로드
if (!process.env.VERCEL && !process.env.NODE_ENV) {
  const { config } = require('dotenv');
  config();
}

const API_BASE_URL = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL;

if (!API_BASE_URL) {
  console.error('❌ API URL 환경변수가 설정되지 않았습니다:');
  console.error('  - STRAPI_API_URL (권장) 또는 NEXT_PUBLIC_STRAPI_API_URL');
  process.exit(1);
}

interface Category {
  id: number;
  name: string;
  slug: string;
  level: number;
  categories?: Category[];
  posts?: Array<{ id: number }>;
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
    // public/data 디렉토리 생성
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 1. 카테고리 데이터 생성
    await generateCategoriesData(dataDir);
    
    // 2. 모든 포스트 데이터 생성
    await generatePostsData(dataDir);

  } catch (error) {
    console.error('❌ 정적 데이터 생성 중 오류 발생:', error);
    process.exit(1);
  }
}

async function generateCategoriesData(dataDir: string): Promise<void> {
  try {
    // URLSearchParams를 사용하여 쿼리 파라미터 생성
    const params = new URLSearchParams({
      'filters[level][$eq]': '1',
      'fields[0]': 'name',
      'fields[1]': 'slug',
      'populate[categories][fields][0]': 'name',
      'populate[categories][fields][1]': 'slug',
      'populate[categories][populate][posts][fields][0]': 'id',
      'populate[posts][fields][0]': 'id'
    });

    const response = await fetch(`${API_BASE_URL}/api/categories?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const categories: any[] = data.data || [];
    
    // 카테고리 데이터 정리
    const cleanedCategories: Category[] = categories.map((category: any) => {
      const childCategories = category.categories || [];
      
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        level: 1,
        categories: childCategories.map((child: any) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          level: 2,
          posts: child.posts || []
        })),
        posts: category.posts || []
      };
    });

    // categories.json 파일 생성
    const categoriesPath = path.join(dataDir, 'categories.json');
    fs.writeFileSync(categoriesPath, JSON.stringify(cleanedCategories, null, 2));
  } catch (error: any) {
    console.error('❌ 카테고리 데이터 생성 실패:', error.message);
    throw error;
  }
}

async function generatePostsData(dataDir: string): Promise<void> {
  try {   
    // 🎯 환경변수에서 도메인 정보 가져오기
    const S3_DOMAIN = process.env.S3_DOMAIN || '';
    const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || '';
    
    // 모든 포스트 가져오기 (페이지네이션으로 모두 가져옴)
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
      
      // 포스트 데이터 정리
      const cleanedPosts: CleanedPost[] = posts.map((post: any) => {
        // 🎯 이미지 URL을 CloudFront URL로 변환 (빌드 타임에 처리)
        let coverUrl: string | null = null;
        if (post.cover?.url) {
          const url: string = post.cover.url;
          
          // S3 URL을 CloudFront URL로 변환
          if (url.includes('amazonaws.com') && S3_DOMAIN && CLOUDFRONT_DOMAIN) {
            coverUrl = url.replace(
              new RegExp(`https://${S3_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
              CLOUDFRONT_DOMAIN.replace(/\/$/, '')
            );
          }
          // 상대 경로 처리
          else if (url.startsWith('/')) {
            coverUrl = `${CLOUDFRONT_DOMAIN || API_BASE_URL}${url}`;
          } 
          // 이미 완전한 URL인 경우
          else if (url.startsWith('http://') || url.startsWith('https://')) {
            coverUrl = url;
          } 
          // 기타 경우
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

    // posts.json 파일 생성
    const postsPath = path.join(dataDir, 'posts.json');
    fs.writeFileSync(postsPath, JSON.stringify(allPosts, null, 2));
  } catch (error: any) {
    console.error('❌ 포스트 데이터 생성 실패:', error.message);
    throw error;
  }
}

generateStaticData(); 