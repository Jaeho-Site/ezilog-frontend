import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

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
    
    // 1레벨 카테고리와 자식 카테고리들을 모두 가져오기
    const response = await axios.get(`${API_BASE_URL}/api/categories`, {
      params: {
        filters: {
          level: {
            $eq: 1
          }
        },
        fields: ['name', 'slug'],
        populate: {
          categories: {
            fields: ['name', 'slug'],
            populate: {
              posts: {
                fields: ['id'] 
              }
            }
          },
          posts: {
            fields: ['id']
          }
        }
      }
    });

    const categories: any[] = response.data.data || [];
    
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
    // 🎯 환경변수에서 도메인 정보 가져오기 (빌드 타임에만 사용)
    const S3_DOMAIN = process.env.S3_DOMAIN || '';
    const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || '';
    
    // 모든 포스트 가져오기 (페이지네이션으로 모두 가져옴)
    let allPosts: CleanedPost[] = [];
    let page = 1;
    const pageSize = 25;
    
    while (true) {
      const response = await axios.get(`${API_BASE_URL}/api/posts`, {
        params: {
          sort: 'publishedAt:desc',
          pagination: {
            page: page,
            pageSize: pageSize
          },
          fields: ['title', 'slug', 'publishedAt', 'description'],
          populate: {
            cover: {
              fields: ['url']
            },
            tags: {
              fields: ['name', 'slug']
            },
            category: {
              fields: ['name', 'slug']
            }
          }
        }
      });
      
      const posts: any[] = response.data.data || [];
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