const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
import qs from 'qs';
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

function formatImage(imageData: any, title: string = '이미지'): any {
  if (!imageData) return null;
  
  const cover = imageData.data ? imageData.data : imageData;
  
  return {
    url: cover.url || '',
    alt: title || '이미지'
  };
}
function formatTags(tagsData: any): any[] {
  if (!tagsData) return [];
  
  const tagsList = tagsData.data ? tagsData.data : (Array.isArray(tagsData) ? tagsData : []);
  
  return tagsList.map((tag: any) => {
    return {
      id: tag.id,
      name: tag.name || '태그',
      slug: tag.slug || `tag-${tag.id}`
    };
  });
}
function formatCategory(categoryData: any): any {
  const data = categoryData?.data || categoryData;

  if (!data) {
    return { id: 0, name: "미분류", slug: "uncategorized" };
  }
  return {
    id: data.id || 0,
    name: data.name || '미분류',
    slug: data.slug || 'uncategorized'
  };
}
function formatPost(post: any): any {
  if (!post) return null;
  const publishedDate = formatDate(post);
  const coverImage = formatImage(post.cover, post.title);
  const tags = formatTags(post.tags);
  const category = formatCategory(post.category);
  
  return {
    id: post.id,
    title: post.title || '제목 없음',
    description: post.description || '',
    slug: post.slug || `post-${post.id}`,
    coverImage,
    publishedDate,
    category,
    tags
  };
}

export async function getTopLevelCategories() {
  try {
    const query = qs.stringify({
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
        }
      }
    }, {
      encodeValuesOnly: true
    });

    const response = await strapiAPI.get(`/categories?${query}`);

    return response.data ?? { data: [] };
  } catch (error) {
    return { data: [] };
  }
}
export async function getAllCategories() {
  try {
    const response = await strapiAPI.get('/categories', {
      params: {
        populate: {
          posts: {
            count: true
          }
        },
        pagination: {
          limit: 100
        }
      }
    });

    if (!response.data.data || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data.map((category: any) => {
      return {
        id: category.id,
        name: category.name || '카테고리',
        slug: category.slug || `category-${category.id}`,
        level: category.level || 2,
        postCount: category.posts?.count ?? 0 
      };
    });
  } catch (error) {
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
    const level = category.level || 2;
    // 레벨에 따라 다른 쿼리 전략 사용
    if (level === 1) {
      // 1레벨 카테고리인 경우: 자식 카테고리들의 포스트를 가져옴
      const childCategories = category.categories || [];
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
        fields: ['title', 'slug', 'publishedAt', 'description'],
        populate:  {
          cover: {
            fields: ['url']
          },
          tags: {
            fields: ['name', 'slug']
        }},
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
        populate: {
          cover: {
            fields: ['url']
          },
          tags: {
            fields: ['name', 'slug']
        }},
      }
    });
    
    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }  
    const post = response.data.data[0];
    const formattedPost = formatPost(post);
    return {
      ...formattedPost,
       markdown: post.markdown || '',
       html: post.html || '',
    };  
  } catch (error: any) {
    return null;
  }
}

export async function getRelatedPosts(slug: string) {
  const currentSlugNumber = Number(slug);
  if (isNaN(currentSlugNumber)) return [null, null];
  
  const prevSlug = (currentSlugNumber - 1).toString();
  const nextSlug = (currentSlugNumber + 1).toString();
  
  try {
    const response = await strapiAPI.get('/posts', {
      params: {
        filters: {
          slug: {
            $in: [prevSlug, nextSlug],
          },
        },
        fields: ['slug', 'title', 'description'], 
      },
    });
    
    const data = response.data?.data || [];
    const result: { 
      prev?: { title: string; description?: string }; 
      next?: { title: string; description?: string }; 
    } = {};

    for (const item of data) {
      const s = item.slug;
      const postData = {
        title: item.title,
        description: item.description || ''
      };
      
      if (s === prevSlug) result.prev = postData;
      else if (s === nextSlug) result.next = postData;
    }
    
    return [result.prev ?? null, result.next ?? null];
  } catch (error) {
    return [null, null];
  }
}
