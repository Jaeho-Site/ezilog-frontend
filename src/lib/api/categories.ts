import { strapiAPI } from './core';

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const params = new URLSearchParams({
      'pagination[limit]': '100',
      'sort': 'name:asc'
    });
    
    const response = await strapiAPI.get(`/categories?${params.toString()}`);

    if (!response.data.data || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data.map((category: any) => ({
      id: category.id,
      name: category.name || '카테고리',
      slug: category.slug || `category-${category.id}`,
    }));
  } catch (error: any) {
    console.error('[getAllCategories] Error:', error.response?.data || error.message);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug
    });
    
    const response = await strapiAPI.get(`/categories?${params.toString()}`);
    
    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }
    
    const category = response.data.data[0];
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
    };
  } catch (error: any) {
    console.error('[getCategoryBySlug] Error:', error.response?.data || error.message);
    return null;
  }
}

export async function getCategoryPostCount(slug: string): Promise<number> {
  try {
    const params = new URLSearchParams({
      'filters[category][slug][$eq]': slug,
      'pagination[limit]': '1'
    });
    
    const response = await strapiAPI.get(`/posts?${params.toString()}`);
    
    return response.data.meta?.pagination?.total ?? 0;
  } catch (error: any) {
    console.error('[getCategoryPostCount] Error:', error.response?.data || error.message);
    return 0;
  }
}
