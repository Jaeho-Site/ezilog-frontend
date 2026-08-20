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
const API_TOKEN = process.env.STRAPI_API_TOKEN;

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
  cover?: { url?: string; alternativeText?: string | null } | null;
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
  coverAlt: string | null;
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
  const response = await fetch(url, {
    headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : undefined,
  });
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
      'populate[cover][fields][1]': 'alternativeText',
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

/** alt 값이 파일명 그대로인지 (CKEditor 삽입 시 기본값) */
function isFilenameLike(alt: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(alt.trim());
}

/** 직접 입력한 서술형 alternativeText 면 trim 해서 반환, 아니면 null */
function meaningfulAlt(alt: string | null | undefined): string | null {
  if (!alt || alt.trim() === '' || isFilenameLike(alt)) return null;
  return alt.trim();
}

/** 파일명 alt 폴백: 확장자 제거, 구분자 → 공백, 글번호 프리픽스(post15 01 …) 제거 */
function humanizeFilename(filename: string): string {
  const spaced = filename
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  const tokens = spaced.split(' ');
  let start = 0;
  while (start < tokens.length && /^[a-z]*\d+$/i.test(tokens[start])) start++;
  const stripped = tokens.slice(start).join(' ');
  return stripped || spaced;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * 미디어 라이브러리 전체 파일의 alternativeText 를 URL 파일명 → alt 맵으로 수집.
 * 권한이 없거나 실패하면 빈 맵으로 계속 진행한다 (파일명 humanize 폴백만 적용).
 */
async function fetchMediaAltMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const limit = 100;
  let start = 0;

  try {
    while (true) {
      const params = new URLSearchParams({
        'fields[0]': 'url',
        'fields[1]': 'alternativeText',
        start: String(start),
        limit: String(limit),
      });
      const json = await fetchJson(`${API_BASE_URL}/api/upload/files?${params}`);
      const files: Array<{ url?: string; alternativeText?: string | null }> = Array.isArray(json)
        ? json
        : json.results || json.data || [];

      for (const file of files) {
        const basename = file.url?.split('/').pop();
        const alt = meaningfulAlt(file.alternativeText);
        if (basename && alt) {
          map.set(decodeURIComponent(basename), alt);
        }
      }

      if (files.length < limit) break;
      start += limit;
    }
  } catch (error: any) {
    console.warn(
      `⚠️  미디어 라이브러리 alt 조회 실패 (${error.message || error}) — 파일명 폴백만 적용합니다.`
    );
  }

  return map;
}

/**
 * 본문 HTML의 img alt 를 빌드 타임에 보정한다.
 * 우선순위: 에디터에서 직접 쓴 서술형 alt > 미디어 라이브러리 alternativeText > 파일명 humanize
 */
function rewriteImageAlts(
  html: string,
  mediaAltMap: Map<string, string>,
  stats: { injected: number; humanized: number }
): string {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const srcMatch = tag.match(/\bsrc="([^"]*)"/);
    if (!srcMatch) return tag;

    const altMatch = tag.match(/\balt="([^"]*)"/);
    const currentAlt = altMatch ? altMatch[1] : '';

    // 에디터에서 직접 입력한 서술형 alt 는 그대로 둔다
    if (meaningfulAlt(currentAlt)) return tag;

    const basename = decodeURIComponent(srcMatch[1].split('/').pop() || '');
    const mediaAlt = mediaAltMap.get(basename);

    let nextAlt: string;
    if (mediaAlt) {
      nextAlt = mediaAlt;
      stats.injected++;
    } else {
      nextAlt = humanizeFilename(currentAlt || basename);
      stats.humanized++;
    }

    const escaped = escapeAttr(nextAlt);
    return altMatch
      ? tag.replace(altMatch[0], `alt="${escaped}"`)
      : tag.replace(/^<img\b/, `<img alt="${escaped}"`);
  });
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

  const [rawPosts, rawCategories, mediaAltMap] = await Promise.all([
    fetchAllPosts(),
    fetchAllCategories(),
    fetchMediaAltMap(),
  ]);

  const altStats = { injected: 0, humanized: 0 };

  const posts: ContentPost[] = rawPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description || '',
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt || post.publishedAt,
    publishedDate: post.PublishedDate || post.publishedAt,
    coverUrl: normalizeImageUrl(post.cover?.url),
    coverAlt: meaningfulAlt(post.cover?.alternativeText),
    tags: (post.tags || []).map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug })),
    category: post.category
      ? { id: post.category.id, name: post.category.name, slug: post.category.slug }
      : null,
    html: post.html ? rewriteImageAlts(post.html, mediaAltMap, altStats) : null,
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
  console.log(
    `   이미지 alt: 미디어 라이브러리 주입 ${altStats.injected}개, 파일명 폴백 ${altStats.humanized}개 (미디어 alt ${mediaAltMap.size}개 수집)`
  );
}

generate().catch((error) => {
  console.error('❌ 콘텐츠 수집 실패 — 빌드를 중단합니다:', error.message || error);
  process.exit(1);
});
