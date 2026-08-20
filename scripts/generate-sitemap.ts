/**
 * 빌드 후 메타 파일 생성 (postbuild).
 *
 * prebuild가 생성한 src/data/content.json 만 읽는다 — Strapi API 호출 0회.
 * (기존: sitemap 생성을 위해 posts/categories/카테고리별 count를 전부 재호출)
 *
 * 생성 파일:
 *  - public/sitemap.xml  : 쿼리스트링 URL 제외, lastmod는 updatedAt 우선
 *  - public/rss.xml      : RSS 2.0 (네이버 서치어드바이저 제출용, 전문 포함)
 *  - public/robots.txt   : AI 크롤러(GEO) 명시적 허용 정책 포함
 *  - public/llms.txt     : 생성형 엔진용 사이트/콘텐츠 인덱스
 */
import * as fs from 'fs';
import * as path from 'path';

if (!process.env.VERCEL && !process.env.CI) {
  const { config } = require('dotenv');
  config();
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');

if (!SITE_URL) {
  console.error('❌ NEXT_PUBLIC_SITE_URL 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

interface ContentPost {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  publishedDate: string;
  html: string | null;
  markdown: string | null;
  category: { name: string; slug: string } | null;
  tags: Array<{ name: string; slug: string }>;
}

interface ContentCategory {
  name: string;
  slug: string;
  updatedAt: string;
  postCount: number;
}

const POSTS_PER_PAGE = 6;

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string
  ));
}

function loadContent(): { buildTime: string; posts: ContentPost[]; categories: ContentCategory[] } {
  const contentPath = path.join(process.cwd(), 'src', 'data', 'content.json');
  if (!fs.existsSync(contentPath)) {
    console.error('❌ src/data/content.json 이 없습니다. generate:data 를 먼저 실행하세요.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(contentPath, 'utf-8'));
}

function generateSitemap(posts: ContentPost[], categories: ContentCategory[]): string {
  const buildTime = new Date().toISOString();

  const pages: Array<{ url: string; lastmod: string }> = [
    { url: `${SITE_URL}`, lastmod: buildTime },
    { url: `${SITE_URL}/search`, lastmod: buildTime },
  ];

  for (const post of posts) {
    pages.push({
      url: `${SITE_URL}/post/${post.slug}`,
      lastmod: new Date(post.updatedAt || post.publishedAt).toISOString(),
    });
  }

  for (const category of categories) {
    const lastmod = new Date(category.updatedAt).toISOString();
    pages.push({ url: `${SITE_URL}/category/${category.slug}`, lastmod });

    const totalPages = Math.ceil(category.postCount / POSTS_PER_PAGE);
    for (let page = 2; page <= totalPages; page++) {
      pages.push({ url: `${SITE_URL}/category/${category.slug}/${page}`, lastmod });
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${escapeXml(page.url)}</loc>
    <lastmod>${page.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateRss(posts: ContentPost[], buildTime: string): string {
  const items = posts.slice(0, 50).map((post) => {
    const url = `${SITE_URL}/post/${post.slug}`;
    const pubDate = new Date(post.publishedDate).toUTCString();
    const categoryTag = post.category ? `\n      <category>${escapeXml(post.category.name)}</category>` : '';
    const summary = post.description || stripHtml(post.html || post.markdown || '').slice(0, 200);

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(summary)}</description>${categoryTag}
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>EziLog - 개발 블로그</title>
    <link>${SITE_URL}</link>
    <description>프론트엔드, 백엔드, 풀스택 개발 경험과 지식을 공유하는 기술 블로그입니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date(buildTime).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;
}

function generateRobots(): string {
  return `# ezilog.dev robots.txt
User-agent: *
Allow: /

# --- AI/생성형 엔진 크롤러 (GEO) — 명시적 허용 ---
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function generateLlmsTxt(posts: ContentPost[], categories: ContentCategory[]): string {
  const byCategory = categories
    .filter((c) => c.postCount > 0)
    .map((category) => {
      const categoryPosts = posts
        .filter((p) => p.category?.slug === category.slug)
        .map((p) => `- [${p.title}](${SITE_URL}/post/${p.slug}): ${p.description || ''}`.trim());
      return `## ${category.name}\n\n${categoryPosts.join('\n')}`;
    });

  return `# EziLog

> 프론트엔드·백엔드·풀스택 개발 경험과 지식을 공유하는 한국어 기술 블로그.
> Next.js SSG + Headless CMS(Strapi) 기반으로 직접 설계·운영합니다.

- 사이트: ${SITE_URL}
- RSS: ${SITE_URL}/rss.xml
- 전체 글 목록: ${SITE_URL}/search

${byCategory.join('\n\n')}
`;
}

function main(): void {
  const { buildTime, posts, categories } = loadContent();
  const publicDir = path.join(process.cwd(), 'public');

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), generateSitemap(posts, categories));
  fs.writeFileSync(path.join(publicDir, 'rss.xml'), generateRss(posts, buildTime));
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), generateRobots());
  fs.writeFileSync(path.join(publicDir, 'llms.txt'), generateLlmsTxt(posts, categories));

  console.log(`✅ sitemap.xml / rss.xml / robots.txt / llms.txt 생성 완료 (포스트 ${posts.length}개, API 호출 0회)`);
}

main();
