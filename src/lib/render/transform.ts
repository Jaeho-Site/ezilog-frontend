/**
 * 빌드 타임 본문 HTML 변환 (서버 전용).
 *
 * - 코드 블록: Shiki로 하이라이팅 (light/dark dual theme, CSS 변수 방식 — 런타임 JS 불필요)
 * - 헤딩: 안정적인 id 부여 (목차 앵커가 정적 HTML에 포함되어 SEO에 유리)
 *
 * 기존에는 react-syntax-highlighter + MutationObserver 를 클라이언트 번들로 배송해
 * 브라우저에서 하이라이팅했다. 이제 모든 변환이 빌드 타임에 끝난다.
 */
import { codeToHtml, bundledLanguages } from 'shiki';

const LANG_REGEX = /(?:language-|hljs-)([a-zA-Z0-9-]+)/;

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function getLanguage(attrs: string): string {
  const match = attrs.match(LANG_REGEX);
  const lang = match ? match[1].toLowerCase() : 'text';
  return lang in bundledLanguages ? lang : 'text';
}

export interface TransformedContent {
  html: string;
  /** data-shiki-slot 인덱스 → 하이라이팅된 HTML */
  codeBlocks: string[];
}

async function highlight(code: string, lang: string): Promise<string> {
  const highlighted = await codeToHtml(code, {
    lang: lang === 'text' ? 'text' : lang,
    themes: { light: 'one-light', dark: 'one-dark-pro' },
    defaultColor: 'light',
  });

  const header =
    lang !== 'text'
      ? `<div class="code-block-header">${lang.toUpperCase()}</div>`
      : '';

  return `<div class="code-block">${header}${highlighted}</div>`;
}

/** 코드 블록을 슬롯 마커로 치환하고, 하이라이팅된 HTML을 배열로 반환 */
async function extractCodeBlocks(html: string): Promise<TransformedContent> {
  const pattern = /<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/g;
  const jobs: Array<Promise<string>> = [];

  const withSlots = html.replace(pattern, (_match, attrs: string, body: string) => {
    const code = decodeEntities(body).replace(/\n$/, '');
    if (!code.trim()) return '';
    const index = jobs.length;
    jobs.push(highlight(code, getLanguage(attrs || '')));
    return `<div data-shiki-slot="${index}"></div>`;
  });

  return { html: withSlots, codeBlocks: await Promise.all(jobs) };
}

function slugifyHeading(text: string, index: number): string {
  const slug = text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
  return slug || `heading-${index}`;
}

/** h2/h3에 id 부여 (이미 있으면 유지) */
function addHeadingIds(html: string): string {
  const seen = new Set<string>();
  let index = 0;

  return html.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/g, (match, tag, attrs, inner) => {
    index++;
    if (/\bid=/.test(attrs)) return match;

    let id = slugifyHeading(inner, index);
    while (seen.has(id)) id = `${id}-${index}`;
    seen.add(id);

    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
}

export async function transformPostHtml(html: string): Promise<TransformedContent> {
  const withIds = addHeadingIds(html);
  return extractCodeBlocks(withIds);
}
