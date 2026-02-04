import { StrapiEntity, StrapiMedia, StrapiRelation, StrapiRelationArray } from './strapi';

export interface CategoryAttributes {
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface TagAttributes {
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface PostAttributes {
  title: string;
  description: string | null;
  slug: string;
  cover: StrapiMedia;
  markdown: string | null;
  html: string | null;
  PublishedDate: string | null;
  category: StrapiRelation<StrapiEntity<CategoryAttributes>>;
  tags: StrapiRelationArray<StrapiEntity<TagAttributes>>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FormattedImage {
  url: string;
  alt: string;
}

export interface Post {
  id: number;
  title: string;
  description: string;
  slug: string;
  coverImage: FormattedImage | null;
  publishedDate: string;
  markdown?: string | null;
  html?: string | null;
  category: Category;
  tags: Tag[];
}

export interface RelatedPost {
  slug: string;
  title: string;
  description: string;
}

export interface RawPostData {
  id: number;
  title: string;
  description?: string | null;
  slug: string;
  cover?: {
    data?: {
      id: number;
      url?: string;
      alternativeText?: string | null;
    } | null;
    url?: string;
  } | null;
  markdown?: string | null;
  html?: string | null;
  PublishedDate?: string | null;
  publishedAt?: string;
  category?: {
    data?: {
      id: number;
      name?: string;
      slug?: string;
    } | null;
    id?: number;
    name?: string;
    slug?: string;
  } | null;
  tags?: {
    data?: Array<{
      id: number;
      name?: string;
      slug?: string;
    }>;
  } | Array<{
    id: number;
    name?: string;
    slug?: string;
  }> | null;
}

export interface RawCategoryData {
  id: number;
  name?: string;
  slug?: string;
}
