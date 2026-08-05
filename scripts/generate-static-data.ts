/**
 * 빌드 타임 콘텐츠 수집 스크립트 (prebuild).
 *
 * Strapi에서 본문(html/markdown)을 포함한 전체 콘텐츠를 한 번에 가져와
 * src/data/content.json 으로 직렬화한다. 이후의 모든 페이지 생성(next build)과
 * postbuild(sitemap/rss/llms.txt)는 이 파일만 읽으며 Strapi API를 다시 호출하지 않는다.
 *
 * API 호출 수: ceil(포스트 수 / 100) + 1 (카테고리 목록)
 */
import * as fs from 'fs';
import * as path from 'path';

if (!process.env.VERCEL && !process.env.CI) {
  const { config } = require('dotenv');
  config();
}

const API_BASE_URL = process.env.STRAPI_API_URL;

if (!API_BASE_URL) {
  console.error('❌ STRAPI_API_URL 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const PAGE_SIZE = 100; // Strapi maxLimit

interface RawTag {
  id: number;
  name: string;
  slug: string;
}

interface RawCategory {
  id: number;
  name: string;
  slug: string;
  updatedAt?: string;
}

interface RawPost {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  publishedAt: string;
  updatedAt?: string;
  PublishedDate?: string | null;
  markdown?: string | null;
  html?: string | null;
  cover?: { url?: string } | null;
  tags?: RawTag[];
  category?: RawCategory | null;
}

export interface ContentPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  publishedDate: string; // PublishedDate ?? publishedAt (표시·정렬 기준 단일화)
  coverUrl: string | null;
  tags: Array<{ id: number; name: string; slug: string }>;
  category: { id: number; name: string; slug: string } | null;
  html: string | null;
  markdown: string | null;
}

export interface ContentCategory {
  id: number;
  name: string;
  slug: string;
  updatedAt: string;
  postCount: number;
}

export interface ContentData {
  buildTime: string;
  posts: ContentPost[];
  categories: ContentCategory[];
}

function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    const S3_DOMAIN = process.env.S3_DOMAIN;
    const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

    if (S3_DOMAIN && CLOUDFRONT_DOMAIN && url.includes(S3_DOMAIN)) {
      return url.replace(`https://${S3_DOMAIN}`, CLOUDFRONT_DOMAIN.replace(/\/$/, ''));
    }
    return url;
  }

  const baseUrl = process.env.CLOUDFRONT_DOMAIN || API_BASE_URL || '';
  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — ${url}`);
  }
  return response.json();
}

async function fetchAllPosts(): Promise<RawPost[]> {
  const all: RawPost[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      sort: 'publishedAt:desc',
      'pagination[page]': String(page),
      'pagination[pageSize]': String(PAGE_SIZE),
      'fields[0]': 'title',
      'fields[1]': 'slug',
      'fields[2]': 'description',
      'fields[3]': 'publishedAt',
      'fields[4]': 'updatedAt',
      'fields[5]': 'PublishedDate',
      'fields[6]': 'markdown',
      'fields[7]': 'html',
      'populate[cover][fields][0]': 'url',
      'populate[tags][fields][0]': 'name',
      'populate[tags][fields][1]': 'slug',
      'populate[category][fields][0]': 'name',
      'populate[category][fields][1]': 'slug',
    });

    const data = await fetchJson(`${API_BASE_URL}/api/posts?${params}`);
    const posts: RawPost[] = data.data || [];
    all.push(...posts);

    const pageCount = data.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount || posts.length === 0) break;
    page++;
  }

  return all;
}

async function fetchAllCategories(): Promise<RawCategory[]> {
  const params = new URLSearchParams({
    'fields[0]': 'name',
    'fields[1]': 'slug',
    'fields[2]': 'updatedAt',
    sort: 'name:asc',
    'pagination[limit]': '100',
  });

  const data = await fetchJson(`${API_BASE_URL}/api/categories?${params}`);
  return data.data || [];
}

async function generate(): Promise<void> {
  const started = Date.now();

  const [rawPosts, rawCategories] = await Promise.all([fetchAllPosts(), fetchAllCategories()]);

  const posts: ContentPost[] = rawPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description || '',
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt || post.publishedAt,
    publishedDate: post.PublishedDate || post.publishedAt,
    coverUrl: normalizeImageUrl(post.cover?.url),
    tags: (post.tags || []).map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug })),
    category: post.category
      ? { id: post.category.id, name: post.category.name, slug: post.category.slug }
      : null,
    html: post.html || null,
    markdown: post.markdown || null,
  }));

  posts.sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1));

  const categories: ContentCategory[] = rawCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    updatedAt: category.updatedAt || new Date().toISOString(),
    postCount: posts.filter((p) => p.category?.slug === category.slug).length,
  }));

  const data: ContentData = {
    buildTime: new Date().toISOString(),
    posts,
    categories,
  };

  const outDir = path.join(process.cwd(), 'src', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'content.json'), JSON.stringify(data));

  console.log(
    `✅ 콘텐츠 수집 완료: 포스트 ${posts.length}개, 카테고리 ${categories.length}개 (${Date.now() - started}ms)`
  );
}

generate().catch((error) => {
  console.error('❌ 콘텐츠 수집 실패 — 빌드를 중단합니다:', error.message || error);
  process.exit(1);
});
