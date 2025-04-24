/**
 * Strapi API 통신을 위한 유틸리티 함수
 */
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// axios 라이브러리 import
import axios from 'axios';

// axios 인스턴스 생성
export const strapiAPI = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`
  }
});

/**
 * 기본 Strapi API 요청 함수
 * @param endpoint API 엔드포인트 경로
 * @param options 추가 fetch 옵션
 * @returns 응답 데이터
 */
export async function fetchAPI(endpoint: string, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
    },
  };
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };
  try {
    const res = await fetch(`${API_URL}${endpoint}`, mergedOptions);   
    if (!res.ok) {
      throw new Error(`API 오류: ${res.status} ${res.statusText}`);
    }  
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
}
/**
 * 최상위 카테고리(level=1)와 그 자식 카테고리들을 가져오는 함수
 * @returns 카테고리 트리 구조
 */
export async function getTopLevelCategories() {
  // level=1인 카테고리만 필터링하고, 자식 카테고리들을 함께 가져옴
  // populate=* 를 사용하여 모든 관계 필드를 가져옴
  const data = await fetchAPI('/api/categories?filters[level]=1&populate=*');
  return data;
}
/**
 * 카테고리 슬러그로 카테고리 정보 가져오기
 * @param slug 카테고리 슬러그
 * @returns 카테고리 정보
 */
export async function getCategoryBySlug(slug: string) {
  const data = await fetchAPI(`/api/categories?filters[slug]=${slug}&populate=*`);
  return data.data[0] || null;
}
/**
 * 특정 카테고리에 속한 포스트 가져오기
 * @param categoryId 카테고리 ID
 * @returns 해당 카테고리의 포스트 목록
 */
export async function getPostsByCategory(categoryId: string) {
  const data = await fetchAPI(`/api/posts?filters[category][id]=${categoryId}&populate=*`);
  return data;
}
/**
 * 모든 포스트 가져오기
 * @param limit 가져올 포스트 수 (기본값: 10)
 * @param offset 건너뛸 포스트 수 (기본값: 0)
 * @returns 포스트 목록
 */
export async function getAllPosts(limit = 10, offset = 0) {
  try {
    // 포스트를 최신순(발행일 기준)으로 정렬하고 태그 정보도 함께 가져옴
    // publishedAt을 기준으로 정렬 (PublishedDate가 null일 수 있으므로)
    const data = await fetchAPI(`/api/posts?sort=publishedAt:desc&pagination[limit]=${limit}&pagination[start]=${offset}&populate=*`);
    
    // Strapi v4 응답 구조 처리
    if (data && data.data && Array.isArray(data.data)) {
      // 포스트 데이터 매핑 (실제 응답 구조에 맞게 변환)
      const posts = data.data.map((post: any) => {
        // post가 없는 경우를 처리
        if (!post) {
          console.warn('유효하지 않은 포스트 데이터');
          return null;
        }   
        // 응답에서 attributes가 없고 직접 필드를 포함하는 구조로 반환될 수 있음
        const attrs = post.attributes || post;       
        // 날짜 처리 - PublishedDate가 없으면 publishedAt 사용
        const publishedDate = attrs.PublishedDate || attrs.publishedAt || new Date().toISOString().split('T')[0];       
        // 이미지 URL 처리
        let coverImage = null;
        if (attrs.cover) {
          // 실제 응답에서 cover는 이미 객체이고 data 래퍼가 없을 수 있음
          const cover = attrs.cover.data ? attrs.cover.data : attrs.cover;
          coverImage = {
            url: cover.url || '',
            alt: attrs.title || '이미지'
          };
        }   
        // 태그 처리
        let tags: any[] = [];
        if (attrs.tags) {
          // tags가 이미 배열이거나 data.map 구조일 수 있음
          const tagsList = attrs.tags.data ? attrs.tags.data : attrs.tags;
          tags = tagsList.map((tag: any) => {
            const tagData = tag.attributes || tag;
            return {
              id: tag.id,
              name: tagData.name || '태그',
              slug: tagData.slug || `tag-${tag.id}`
            };
          });
        }
        
        // 카테고리 처리
        const category = attrs.category?.data 
          ? {
              id: attrs.category.data.id,
              name: attrs.category.data.attributes?.name || '미분류',
              slug: attrs.category.data.attributes?.slug || 'uncategorized'
            }
          : attrs.category 
            ? {
                id: attrs.category.id || 0,
                name: attrs.category.name || '미분류',
                slug: attrs.category.slug || 'uncategorized'
              }
            : { name: "미분류", slug: "uncategorized" };
        
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
      }).filter(Boolean); // null 값 필터링
      
      return posts;
    }   
    return [];
  } catch (error) {
    console.error('포스트 목록 가져오기 실패:', error);
    return [];
  }
}

/**
 * 포스트 슬러그로 단일 포스트 정보 가져오기 (axios 사용)
 * @param slug 포스트 슬러그
 * @returns 포스트 정보
 */
export async function getPostBySlug(slug: string) {
  try {
    console.log(`getPostBySlug 함수 호출: slug=${slug}`);
    
    const response = await strapiAPI.get('/posts', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: '*'
      }
    });
    
    if (!response.data.data || response.data.data.length === 0) {
      console.log('해당 slug와 일치하는 포스트가 없습니다:', slug);
      return null;
    }
    const post = response.data.data[0];
    const attrs = post.attributes || post;
    // 중첩 객체 구조 로깅
    if (attrs.cover) {
      console.log('cover 구조:', JSON.stringify(attrs.cover, null, 2));
    } 
    if (attrs.tags) {
      console.log('tags 구조:', JSON.stringify(attrs.tags, null, 2));
    }
    
    // 날짜 처리
    const publishedDate = attrs.PublishedDate || attrs.publishedAt || new Date().toISOString().split('T')[0];
    
    // 이미지 URL 처리
    let coverImage = null;
    if (attrs.cover && attrs.cover.data) {
      const cover = attrs.cover.data.attributes || attrs.cover.data;
      coverImage = {
        url: cover.url || '',
        alt: attrs.title || '이미지'
      };
    }
    
    // 태그 처리
    let tags: any[] = [];
    if (attrs.tags && attrs.tags.data) {
      tags = attrs.tags.data.map((tag: any) => {
        const tagData = tag.attributes || tag;
        return {
          id: tag.id,
          name: tagData.name || '태그',
          slug: tagData.slug || `tag-${tag.id}`
        };
      });
    }
    
    // 최종 반환 데이터 로깅
    const result = {
      id: post.id,
      title: attrs.title || '제목 없음',
      description: attrs.description || '',
      slug: attrs.slug,
      coverImage,
      cover: coverImage, // 두 형식 모두 지원
      publishedDate,
      publishedAt: attrs.publishedAt,
      tags,
      markdown: attrs.markdown || '',
      html: attrs.html || '',
      htmlContent: attrs.html || '',
      markdownContent: attrs.markdown || '',
      attributes: attrs
    };  
    return result;
  } catch (error: any) {
    console.error('포스트 가져오기 실패:', error.message);
    
    if (error.response) {
      console.error('에러 응답 데이터:', error.response.data);
      console.error('에러 상태 코드:', error.response.status);
    }
    
    return null;
  }
}
