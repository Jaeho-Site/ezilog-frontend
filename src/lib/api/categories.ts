import { strapiAPI } from './core';
import { Category, RawCategoryData } from '@/types/models';
import { StrapiResponse, StrapiMeta } from '@/types/strapi';
import { AxiosError } from 'axios';

interface CategoriesResponse {
  data: RawCategoryData[];
  meta: StrapiMeta;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const params = new URLSearchParams({
      'pagination[limit]': '100',
      'sort': 'name:asc'
    });
    
    const response = await strapiAPI.get<CategoriesResponse>(`/categories?${params.toString()}`);

    if (!response.data.data || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data.map((category) => ({
      id: category.id,
      name: category.name || '카테고리',
      slug: category.slug || `category-${category.id}`,
    }));
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      const axiosError = error as AxiosError;
      console.error('[getAllCategories] Error:', axiosError.response?.data || axiosError.message);
    }
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug
    });
    
    const response = await strapiAPI.get<CategoriesResponse>(`/categories?${params.toString()}`);
    
    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }
    
    const category = response.data.data[0];
    return {
      id: category.id,
      name: category.name || '카테고리',
      slug: category.slug || `category-${category.id}`,
    };
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      const axiosError = error as AxiosError;
      console.error('[getCategoryBySlug] Error:', axiosError.response?.data || axiosError.message);
    }
    return null;
  }
}

export async function getCategoryPostCount(slug: string): Promise<number> {
  try {
    const params = new URLSearchParams({
      'filters[category][slug][$eq]': slug,
      'pagination[limit]': '1'
    });
    
    const response = await strapiAPI.get<{ meta: StrapiMeta }>(`/posts?${params.toString()}`);
    
    return response.data.meta?.pagination?.total ?? 0;
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      const axiosError = error as AxiosError;
      console.error('[getCategoryPostCount] Error:', axiosError.response?.data || axiosError.message);
    }
    return 0;
  }
}
