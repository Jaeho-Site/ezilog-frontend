import { strapiAPI, formatPost } from './core';

export async function getAllPosts(limit = 10, offset = 0) {
  try {
    const response = await strapiAPI.get('/posts', {
      params: {
        sort: ['publishedAt:desc'],
        pagination: {
          limit,
          start: offset
        },
        fields: ['title', 'slug', 'publishedAt', 'PublishedDate', 'description'],
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
    
    return response.data.data.map(formatPost).filter(Boolean);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getAllPosts] Error:', error);
    }
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
    
    return {
      ...formattedPost,
      markdown: post.markdown || '',
      html: post.html || ''
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getPostBySlug] Error:', error);
    }
    return null;
  }
}

export async function getCategoryPosts(slug: string, limit = 6, offset = 0) {
  try {
    const categoryResponse = await strapiAPI.get('/categories', {
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

    const postsResponse = await strapiAPI.get('/posts', {
      params: {
        filters: {
          category: { id: { $eq: categoryId } }
        },
        sort: ['publishedAt:desc'],
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
        fields: ['title', 'description', 'slug', 'publishedAt', 'PublishedDate']
      }
    });

    if (!postsResponse.data.data) {
      return [];
    }
    
    return postsResponse.data.data.map(formatPost).filter(Boolean);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getCategoryPosts] Error:', error);
    }
    return [];
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
            $in: [prevSlug, nextSlug]
          }
        },
        fields: ['slug', 'title', 'description']
      }
    });
    
    const data = response.data?.data || [];
    const result: { 
      prev?: { title: string; description?: string }; 
      next?: { title: string; description?: string }; 
    } = {};

    for (const item of data) {
      const postData = {
        title: item.title,
        description: item.description || ''
      };
      
      if (item.slug === prevSlug) {
        result.prev = postData;
      } else if (item.slug === nextSlug) {
        result.next = postData;
      }
    }
    
    return [result.prev ?? null, result.next ?? null];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getRelatedPosts] Error:', error);
    }
    return [null, null];
  }
}
