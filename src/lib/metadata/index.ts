export { siteConfig, getMetadataBase, getCanonicalUrl, getImageUrl } from './config';

export type {
  PostMetadataParams,
  CategoryMetadataParams,
  SearchMetadataParams,
  OpenGraphParams,
  TwitterCardParams,
  RobotsParams,
  MetadataResult,
} from './types';

export {
  buildBaseMetadata,
  buildOpenGraph,
  buildTwitterCard,
  buildRobots,
} from './builders';

export { generateHomeMetadata } from './generators/home';
export { generatePostMetadata, generatePostNotFoundMetadata } from './generators/post';
export { generateCategoryMetadata, generateCategoryNotFoundMetadata } from './generators/category';
export { generateSearchMetadata } from './generators/search';
