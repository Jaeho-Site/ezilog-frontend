/**
 * 단일 콘텐츠 레이어 (서버 전용).
 *
 * prebuild(scripts/generate-static-data.ts)가 생성한 src/data/content.json 을
 * 메모리에 한 번 로드해 모든 페이지에 제공한다. 빌드 중 Strapi API 호출 없음.
 */
import * as fs from 'fs';
import * as path from 'path';
import { Post, Category, Tag, RelatedPost } from '@/types/models';

interface ContentPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  publishedDate: string;
  coverUrl: string | null;
  coverAlt: string | null;
  tags: Tag[];
  category: Category | null;
  html: string | null;
  markdown: string | null;
}

interface ContentCategory extends Category {
  updatedAt: string;
  postCount: number;
}

interface ContentData {
  buildTime: string;
  posts: ContentPost[];
  categories: ContentCategory[];
}

export interface PostWithContent extends Post {
  html: string | null;
  markdown: string | null;
  updatedAt: string;
}

export interface CategoryWithCount extends Category {
  postCount: number;
  updatedAt: string;
}

const UNCATEGORIZED: Category = { id: 0, name: '미분류', slug: 'uncategorized' };

let cache: ContentData | null = null;

function loadContent(): ContentData {
  if (cache) return cache;

  const contentPath = path.join(process.cwd(), 'src', 'data', 'content.json');
  if (!fs.existsSync(contentPath)) {
    throw new Error(
      'src/data/content.json 이 없습니다. 빌드 전에 prebuild(npm run generate:data)를 실행하세요.'
    );
  }

  cache = JSON.parse(fs.readFileSync(contentPath, 'utf-8')) as ContentData;
  return cache;
}

function toPost(post: ContentPost): Post {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    slug: post.slug,
    coverImage: post.coverUrl
      ? { url: post.coverUrl, alt: post.coverAlt || post.title }
      : null,
    publishedDate: post.publishedDate,
    category: post.category ?? UNCATEGORIZED,
    tags: post.tags,
  };
}

/** 전체 포스트 (최신순, 본문 제외) */
export function getAllPosts(): Post[] {
  return loadContent().posts.map(toPost);
}

/** 슬러그로 포스트 1개 (본문 포함) */
export function getPostBySlug(slug: string): PostWithContent | null {
  const post = loadContent().posts.find((p) => p.slug === slug);
  if (!post) return null;
  return { ...toPost(post), html: post.html, markdown: post.markdown, updatedAt: post.updatedAt };
}

/** 이전/다음 포스트 — 정렬된 목록의 인덱스로 로컬 계산 (API 호출 없음) */
export function getAdjacentPosts(slug: string): [RelatedPost | null, RelatedPost | null] {
  const posts = loadContent().posts;
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return [null, null];

  const toRelated = (p: ContentPost | undefined): RelatedPost | null =>
    p ? { slug: p.slug, title: p.title, description: p.description } : null;

  return [toRelated(posts[index + 1]), toRelated(posts[index - 1])];
}

/** 전체 카테고리 (이름순, 포스트 수 포함) */
export function getAllCategories(): CategoryWithCount[] {
  return loadContent().categories;
}

export function getCategoryBySlug(slug: string): CategoryWithCount | null {
  return loadContent().categories.find((c) => c.slug === slug) ?? null;
}

/** 카테고리별 포스트 (최신순) */
export function getPostsByCategory(categorySlug: string): Post[] {
  return loadContent()
    .posts.filter((p) => p.category?.slug === categorySlug)
    .map(toPost);
}

export function getBuildTime(): string {
  return loadContent().buildTime;
}
