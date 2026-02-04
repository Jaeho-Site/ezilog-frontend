import axios from 'axios';
import { Category, Tag, Post, FormattedImage, RawPostData } from '@/types/models';

const API_URL = process.env.STRAPI_API_URL;
const API_TOKEN = process.env.STRAPI_API_TOKEN;

export const strapiAPI = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`
  }
});

export function formatDate(data: RawPostData | null | undefined): string {
  if (!data) return new Date().toISOString().split('T')[0];
  return data.PublishedDate || data.publishedAt || new Date().toISOString().split('T')[0];
}

export function formatImage(
  imageData: RawPostData['cover'] | null | undefined,
  title: string = '이미지'
): FormattedImage | null {
  if (!imageData) return null;
  
  const cover = imageData.data || imageData;
  
  if (!cover || typeof cover !== 'object') return null;
  
  return {
    url: cover.url || '',
    alt: title || '이미지'
  };
}

export function formatTags(
  tagsData: RawPostData['tags'] | null | undefined
): Tag[] {
  if (!tagsData) return [];
  
  const tagsList = Array.isArray(tagsData) 
    ? tagsData 
    : (tagsData.data || []);
  
  return tagsList.map((tag) => ({
    id: tag.id,
    name: tag.name || '태그',
    slug: tag.slug || `tag-${tag.id}`
  }));
}

export function formatCategory(
  categoryData: RawPostData['category'] | null | undefined
): Category {
  if (!categoryData) {
    return { id: 0, name: "미분류", slug: "uncategorized" };
  }
  
  const data = categoryData.data || categoryData;

  if (!data || typeof data !== 'object') {
    return { id: 0, name: "미분류", slug: "uncategorized" };
  }
  
  return {
    id: data.id || 0,
    name: data.name || '미분류',
    slug: data.slug || 'uncategorized'
  };
}

export function formatPost(post: RawPostData | null | undefined): Post | null {
  if (!post) return null;
  
  return {
    id: post.id,
    title: post.title || '제목 없음',
    description: post.description || '',
    slug: post.slug || `post-${post.id}`,
    coverImage: formatImage(post.cover, post.title),
    publishedDate: formatDate(post),
    category: formatCategory(post.category),
    tags: formatTags(post.tags)
  };
}
