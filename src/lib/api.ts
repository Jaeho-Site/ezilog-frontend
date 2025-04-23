/**
 * Strapi API 통신을 위한 유틸리티 함수
 */

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

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
