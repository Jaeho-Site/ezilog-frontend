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

async function getPostsByCategoryFilter(categoryFilter: any, limit: number, offset: number) {
  const postsResponse = await strapiAPI.get('/posts', {
    params: {
      filters: {
        category: categoryFilter
      },
      sort: ['publishedAt:desc'],
      pagination: {
        limit: limit,
        start: offset
      },
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
      },
      fields: ['title', 'description', 'slug', 'publishedAt']
    }
  });

  if (!postsResponse.data.data) {
    return [];
  }
  return postsResponse.data.data.map(formatPost).filter(Boolean);
}

export async function getCategoryPosts(slug: string, limit = 6, offset = 0) {
  try {
    // 1. 먼저 카테고리 정보를 가져옴
    const categoryResponse = await strapiAPI.get('/categories', {
      params: {
        filters: { 
          slug: { $eq: slug } 
        },
        populate: {
          categories: {
            fields: ['id']
          }
        },
        fields: ['level']
      }
    });

    if (!categoryResponse.data.data || categoryResponse.data.data.length === 0) {
      return [];
    }

    const category = categoryResponse.data.data[0];
    const categoryData = category.attributes || category;
    const level = categoryData.level || 2;
    
    // 레벨에 따라 다른 쿼리 전략 사용
    if (level === 1) {
      // 1레벨 카테고리인 경우: 자식 카테고리들의 포스트를 가져옴
      const childCategories = categoryData.categories || [];
      const childCategoryIds = childCategories.map((child: any) => child.id);

      return getPostsByCategoryFilter(
        { id: { $in: childCategoryIds } },
        limit,
        offset
      );  
    } else {
      // 2레벨 카테고리인 경우: 해당 카테고리의 포스트만 직접 가져옴
      return getPostsByCategoryFilter(
        { id: { $eq: category.id } },
        limit,
        offset
      );
    }
  } catch (error) {
    console.error('카테고리 포스트 가져오기 오류:', error);
    return [];
  }
}

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
