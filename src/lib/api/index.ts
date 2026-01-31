// Core exports
export { strapiAPI } from './core';

// Category exports
export {
  getAllCategories,
  getCategoryBySlug,
  getCategoryPostCount
} from './categories';

// Post exports
export {
  getAllPosts,
  getPostBySlug,
  getCategoryPosts,
  getRelatedPosts
} from './posts';
