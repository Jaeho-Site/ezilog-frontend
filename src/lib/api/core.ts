import axios from 'axios';

const API_URL = process.env.STRAPI_API_URL;
const API_TOKEN = process.env.STRAPI_API_TOKEN;

export const strapiAPI = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`
  }
});

export function formatDate(data: any): string {
  return data?.PublishedDate || data?.publishedAt || new Date().toISOString().split('T')[0];
}

export function formatImage(imageData: any, title: string = '이미지'): any {
  if (!imageData) return null;
  
  const cover = imageData.data || imageData;
  
  return {
    url: cover.url || '',
    alt: title || '이미지'
  };
}

export function formatTags(tagsData: any): any[] {
  if (!tagsData) return [];
  
  const tagsList = tagsData.data || (Array.isArray(tagsData) ? tagsData : []);
  
  return tagsList.map((tag: any) => ({
    id: tag.id,
    name: tag.name || '태그',
    slug: tag.slug || `tag-${tag.id}`
  }));
}

export function formatCategory(categoryData: any): any {
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

export function formatPost(post: any): any {
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
