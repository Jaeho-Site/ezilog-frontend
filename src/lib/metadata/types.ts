import { Metadata } from 'next';

export interface PostMetadataParams {
  title: string;
  description?: string;
  slug: string;
  coverImage?: {
    url: string;
    alt?: string;
  } | null;
  publishedDate?: string;
  tags?: Array<{ name: string; id: string | number }>;
}

export interface CategoryMetadataParams {
  name: string;
  slug: string;
  totalPosts: number;
  pageNumber?: number;
}

export interface SearchMetadataParams {
  query?: string;
}

export interface OpenGraphParams {
  title: string;
  description: string;
  url: string;
  type: 'website' | 'article';
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
}

export interface TwitterCardParams {
  card: 'summary' | 'summary_large_image';
  title: string;
  description: string;
  images?: string[];
  creator?: string;
}

export interface RobotsParams {
  index?: boolean;
  follow?: boolean;
}

export type MetadataResult = Metadata;
