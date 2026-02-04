import { strapiAPI, formatPost } from './core';

export async function getAllPosts(limit = 10, offset = 0) {
  try {
    const response = await strapiAPI.get('/posts', {
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
    
    return postsResponse.data.data.map(formatPost).filter(Boolean);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getCategoryPosts] Error:', error);
    }
    return [];
  }
}

export async function getRelatedPosts(slug: string) {
  try {
    const currentPostResponse = await strapiAPI.get('/posts', {
      params: {
        filters: { slug: { $eq: slug } },
        fields: ['PublishedDate']
      }
    });
    
    if (!currentPostResponse.data.data || currentPostResponse.data.data.length === 0) {
      return [null, null];
    }
    
    const currentPost = currentPostResponse.data.data[0];
    const currentDate = currentPost.PublishedDate || currentPost.publishedAt;
    
    if (!currentDate) return [null, null];

    const prevResponse = await strapiAPI.get('/posts', {
      params: {
        filters: {
          $or: [
            { PublishedDate: { $lt: currentDate } },
            { publishedAt: { $lt: currentDate } }
          ]
        },
        sort: ['PublishedDate:desc'],
        pagination: { limit: 1 },
        fields: ['slug', 'title', 'description']
      }
    });

    const nextResponse = await strapiAPI.get('/posts', {
      params: {
        filters: {
          $or: [
            { PublishedDate: { $gt: currentDate } },
            { publishedAt: { $gt: currentDate } }
          ]
        },
        sort: ['PublishedDate:asc'],
        pagination: { limit: 1 },
        fields: ['slug', 'title', 'description']
      }
    });
    
    const prevPost = prevResponse.data?.data?.[0];
    const nextPost = nextResponse.data?.data?.[0];
    
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
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getRelatedPosts] Error:', error);
    }
    return [null, null];
  }
}
