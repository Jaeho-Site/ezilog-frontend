const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
import axios from 'axios';
// axios 인스턴스 생성
export const strapiAPI = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`
  }
});
// 유틸리티 함수들 - 중복 로직 분리
function formatDate(data: any): string {
  return data?.PublishedDate || data?.publishedAt || new Date().toISOString().split('T')[0];
}
/**
 * 이미지 처리 함수
 * @param imageData 이미지 데이터
 * @param title 대체 텍스트로 사용할 제목
 * @returns 처리된 이미지 객체
 */
function formatImage(imageData: any, title: string = '이미지'): any {
  if (!imageData) return null;
  
  const cover = imageData.data ? imageData.data : imageData;
  const coverAttributes = cover.attributes || cover;
  
  return {
    url: coverAttributes.url || cover.url || '',
    alt: title || '이미지'
  };
}
function formatTags(tagsData: any): any[] {
  if (!tagsData) return [];
  
  const tagsList = tagsData.data ? tagsData.data : (Array.isArray(tagsData) ? tagsData : []);
  
  return tagsList.map((tag: any) => {
    const tagData = tag.attributes || tag;
    return {
      id: tag.id,
      name: tagData.name || '태그',
      slug: tagData.slug || `tag-${tag.id}`
    };
  });
}
function formatCategory(categoryData: any): any {
  if (!categoryData) return { name: "미분류", slug: "uncategorized" };
  
  if (categoryData.data) {
    const catData = categoryData.data.attributes || categoryData.data;
    return {
      id: categoryData.data.id,
      name: catData.name || '미분류',
      slug: catData.slug || 'uncategorized'
    };
  }
  return {
    id: categoryData.id || 0,
    name: categoryData.name || '미분류',
    slug: categoryData.slug || 'uncategorized'
  };
}
function formatPost(post: any): any {
  if (!post) return null;
  
  const attrs = post.attributes || post;
  const publishedDate = formatDate(attrs);
  const coverImage = formatImage(attrs.cover, attrs.title);
  const tags = formatTags(attrs.tags);
  const category = formatCategory(attrs.category);
  
  return {
    id: post.id,
    title: attrs.title || '제목 없음',
    description: attrs.description || '',
    slug: attrs.slug || `post-${post.id}`,
    coverImage,
    publishedDate,
    category,
    tags
  };
}

export async function getTopLevelCategories() {
  try {
    const response = await strapiAPI.get('/categories', {
      params: {
        filters: {
          level: { $eq: 1 }
        },
        populate: {
          categories: {
            fields: ['name', 'slug'],
          },
        },
        fields: ['name', 'slug']
      }
    });

    return response.data ?? { data: [] };
  } catch (error) {
    console.error('상위 카테고리 목록 가져오기 오류:', error);
    return { data: [] };
  }
}

export async function getAllCategories() {
  try {
    const response = await strapiAPI.get('/categories', {
      params: {
        pagination: {
          limit: 100
        }
      }
    });
    
    if (!response.data.data || !Array.isArray(response.data.data)) {
      return [];
    }
    
    return response.data.data.map((category: any) => {
      const attrs = category.attributes || category;
      return {
        id: category.id,
        name: attrs.name || '카테고리',
        slug: attrs.slug || `category-${category.id}`,
        level: attrs.level || 2
      };
    });
  } catch (error) {
    console.error('카테고리 목록을 가져오는 중 오류 발생:', error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const response = await strapiAPI.get('/categories', {
      params: {
        filters: { 
          slug: { $eq: slug } 
        },
      }  
    });
    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }
    return response.data.data[0];
  } catch (error: any) {
    return null;
  }
}
/**
 * 모든 포스트 가져오기
 * @param limit 가져올 포스트 수 (기본값: 10)
 * @param offset 건너뛸 포스트 수 (기본값: 0)
 * @returns 포스트 목록
 */
export async function getAllPosts(limit = 10, offset = 0) {
  try {
    const response = await strapiAPI.get('/posts', {
      params: {
        sort: 'publishedAt:desc',
        pagination: {
          limit: limit,
          start: offset
        },
        populate: '*'
      }
    });
    
    if (!response.data.data || !Array.isArray(response.data.data)) {
      return [];
    }
    
    return response.data.data.map(formatPost).filter(Boolean);
  } catch (error) {
    return [];
  }
}
/**
 * 포스트 슬러그로 단일 포스트 정보 가져오기
 * @param slug 포스트 슬러그
 * @returns 포스트 정보
 */
export async function getPostBySlug(slug: string) {
  try {
    const response = await strapiAPI.get('/posts', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: '*'
      }
    });
    
    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }
    
    const post = response.data.data[0];
    const attrs = post.attributes || post;
    const formattedPost = formatPost(post);
    
    // 추가 필드 포함
    return {
      ...formattedPost,
      markdown: attrs.markdown || '',
      html: attrs.html || '',
      htmlContent: attrs.html || '',
      markdownContent: attrs.markdown || '',
      publishedAt: attrs.publishedAt,
      attributes: attrs
    };  
  } catch (error: any) {
    return null;
  }
}
/**
 * 카테고리 슬러그로 해당 카테고리와 그 자식 카테고리의 포스트를 가져오는 함수
 * @param slug 카테고리 슬러그
 * @param limit 가져올 포스트 수 (기본값: 6)
 * @param offset 건너뛸 포스트 수 (기본값: 0)
 * @returns 포스트 목록
 */
export async function getCategoryPosts(slug: string, limit = 6, offset = 0) {
  try {
    // 카테고리 정보를 가져옵니다 (포스트와 자식 카테고리 정보 포함)
    const categoryResponse = await strapiAPI.get('/categories', {
      params: {
        filters: { 
          slug: { $eq: slug } 
        },
        populate: '*'
      }
    });

    if (!categoryResponse.data.data || categoryResponse.data.data.length === 0) {
      return [];
    }

    const category = categoryResponse.data.data[0];
    const level = category.level || 2; // 기본값은 2레벨로 가정
    
    let allCategoryIds = [category.id];
    
    // 1레벨 카테고리이고 자식 카테고리가 있는 경우, 자식 카테고리 ID도 포함
    if (level === 1 && category.categories && Array.isArray(category.categories) && category.categories.length > 0) {
      const childCategoryIds = category.categories.map((child: any) => child.id);
      allCategoryIds = [...allCategoryIds, ...childCategoryIds];
    }

    // 모든 관련 카테고리의 포스트를 한 번에 가져오기
    const postsResponse = await strapiAPI.get('/posts', {
      params: {
        filters: {
          category: { id: { $in: allCategoryIds } }
        },
        sort: ['publishedAt:desc'],
        pagination: {
          limit: 100 // 충분히 많은 포스트를 가져옴
        },
        populate: '*'
      }
    });
    
    if (!postsResponse.data.data || !Array.isArray(postsResponse.data.data)) {
      return [];
    } 
    // 중복 제거 및 페이지네이션 적용
    const uniquePosts = postsResponse.data.data
      .filter((post: any, index: number, self: any[]) => 
        index === self.findIndex((p: any) => p.id === post.id)
      )
      .sort((a: any, b: any) => new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime())
      .slice(offset, offset + limit);
    
    return uniquePosts.map(formatPost).filter(Boolean);
  } catch (error: any) {
    return [];
  }
}

