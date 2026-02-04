import { strapiAPI, formatPost } from './core';
import { Post, RawPostData, RelatedPost } from '@/types/models';
import { StrapiMeta } from '@/types/strapi';
import { AxiosError } from 'axios';

interface PostsResponse {
  data: RawPostData[];
  meta: StrapiMeta;
}

export async function getAllPosts(limit = 10, offset = 0): Promise<Post[]> {
  try {
    const response = await strapiAPI.get<PostsResponse>('/posts', {
      params: {
        sort: ['PublishedDate:desc'],
        pagination: {
          limit,
          start: offset
        },
        fields: ['title', 'slug','PublishedDate', 'description'],
        populate: {
          cover: {
            fields: ['url']
          },
          tags: {
            fields: ['name', 'slug']
          }
        }
      }
    });
    
    if (!response.data.data || !Array.isArray(response.data.data)) {
      return [];
    }
    
    return response.data.data.map(formatPost).filter((post): post is Post => post !== null);
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getAllPosts] Error:', error);
    }
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await strapiAPI.get<PostsResponse>('/posts', {
      params: {
        filters: { slug: { $eq: slug } },
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
    
    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }
    
    const post = response.data.data[0];
    const formattedPost = formatPost(post);
    
    if (!formattedPost) return null;
    
    return {
      ...formattedPost,
      markdown: post.markdown || null,
      html: post.html || null
    };
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getPostBySlug] Error:', error);
    }
    return null;
  }
}

export async function getCategoryPosts(slug: string, limit = 6, offset = 0): Promise<Post[]> {
  try {
    interface CategoryIdResponse {
      data: Array<{ id: number }>;
    }
    
    const categoryResponse = await strapiAPI.get<CategoryIdResponse>('/categories', {
      params: {
        filters: { 
          slug: { $eq: slug } 
        },
        fields: ['id']
      }
    });

    if (!categoryResponse.data.data || categoryResponse.data.data.length === 0) {
      return [];
    }

    const categoryId = categoryResponse.data.data[0].id;

    const postsResponse = await strapiAPI.get<PostsResponse>('/posts', {
      params: {
        filters: {
          category: { id: { $eq: categoryId } }
        },
        sort: ['PublishedDate:desc'],
        pagination: {
          limit,
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
        fields: ['title', 'description', 'slug', 'PublishedDate']
      }
    });

    if (!postsResponse.data.data) {
      return [];
    }
    
    return postsResponse.data.data.map(formatPost).filter((post): post is Post => post !== null);
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getCategoryPosts] Error:', error);
    }
    return [];
  }
}

export async function getRelatedPosts(slug: string): Promise<[RelatedPost | null, RelatedPost | null]> {
  try {
    const response = await strapiAPI.get<PostsResponse>('/posts', {
      params: {
        sort: ['PublishedDate:desc', 'publishedAt:desc'],
        pagination: { limit: 100 },
        fields: ['slug', 'title', 'description', 'PublishedDate', 'publishedAt']
      }
    });
    
    const allPosts = response.data?.data || [];
    if (allPosts.length === 0) return [null, null];

    const currentIndex = allPosts.findIndex((post) => post.slug === slug);
    if (currentIndex === -1) return [null, null];

    const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    
    return [
      prevPost ? { 
        slug: prevPost.slug,
        title: prevPost.title, 
        description: prevPost.description || '' 
      } : null,
      nextPost ? { 
        slug: nextPost.slug,
        title: nextPost.title, 
        description: nextPost.description || '' 
      } : null
    ];
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getRelatedPosts] Error:', error);
    }
    return [null, null];
  }
}
