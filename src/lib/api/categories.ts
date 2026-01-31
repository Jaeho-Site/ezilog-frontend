import { strapiAPI } from './core';

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
        },
        sort: ['name:asc']
      }
    });

    if (!response.data.data || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data.map((category: any) => ({
      id: category.id,
      name: category.name || '카테고리',
      slug: category.slug || `category-${category.id}`,
      postCount: category.posts?.count ?? 0 
    }));
  } catch (error) {
    console.error('[getAllCategories] Error:', error);
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
        fields: ['id', 'name', 'slug']
      }  
    });
    
    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }
    
    return response.data.data[0];
  } catch (error) {
    console.error('[getCategoryBySlug] Error:', error);
    return null;
  }
}

export async function getCategoryPostCount(slug: string): Promise<number> {
  try {
    const response = await strapiAPI.get('/categories', {
      params: {
        filters: { 
          slug: { $eq: slug } 
        },
        fields: ['id'],
        populate: {
          posts: {
            count: true
          }
        }
      }
    });

    if (!response.data.data || response.data.data.length === 0) {
      return 0;
    }

    return response.data.data[0].posts?.count ?? 0;
  } catch (error) {
    console.error('[getCategoryPostCount] Error:', error);
    return 0;
  }
}
