function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://ezilog.dev';
  const withProtocol = raw.startsWith('http') ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, '');
}

const SITE_URL = resolveSiteUrl();

/**
 * 구조화 데이터 엔티티의 고정 @id.
 * 모든 글의 author/publisher가 이 하나의 Person을 가리켜야
 * 검색·생성형 엔진이 사이트 전체를 한 저자의 저작물로 인식한다.
 */
export const entityIds = {
  person: `${SITE_URL}/about#person`,
  website: `${SITE_URL}/#website`,
} as const;

export const siteConfig = {
  name: 'EziLog',
  title: 'EziLog - 개발 블로그',
  description: '프론트엔드, 백엔드, 풀스택 개발 경험과 지식을 공유하는 기술 블로그입니다.',
  url: SITE_URL,
  defaultImage: '/og-image.png',
  locale: 'ko_KR',
  author: {
    /** 표시 이름 — meta author/creator, JSON-LD Person.name 에 모두 쓰인다. */
    name: '신재호',
    alternateName: 'EziLog',
    jobTitle: '프론트엔드 개발자',
    /** Person 엔티티의 정식 URL (About 페이지) */
    url: `${SITE_URL}/about`,
    twitter: '@EziLog',
    email: 'sjaeho348@gmail.com',
    github: 'https://github.com/Jaeho-Site',
    notes: 'https://notes.ezilog.dev',
  },
  robots: {
    index: true,
    follow: true,
  },
} as const;

/** Person.sameAs — 흩어진 프로필을 한 사람으로 묶는 신호 */
export const authorSameAs: string[] = [
  siteConfig.author.github,
  siteConfig.author.notes,
];

export function getMetadataBase(): URL {
  return new URL(siteConfig.url);
}

export function getCanonicalUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

export function getImageUrl(imagePath: string): string {
  return imagePath.startsWith('http') ? imagePath : `${siteConfig.url}${imagePath}`;
}

/** 다른 스키마에서 저자를 참조할 때 쓰는 축약 노드 */
function authorRef(): Record<string, unknown> {
  return { '@type': 'Person', '@id': entityIds.person, name: siteConfig.author.name };
}

/** Person 구조화 데이터 (About 페이지에서 전체 정의) */
export function buildPersonJsonLd(params: {
  description: string;
  knowsAbout: string[];
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': entityIds.person,
    name: siteConfig.author.name,
    alternateName: siteConfig.author.alternateName,
    jobTitle: siteConfig.author.jobTitle,
    description: params.description,
    url: siteConfig.author.url,
    email: `mailto:${siteConfig.author.email}`,
    image: getImageUrl(siteConfig.defaultImage),
    knowsAbout: params.knowsAbout,
    knowsLanguage: ['ko', 'en'],
    sameAs: authorSameAs,
  };
}

/** About 페이지 자체를 저자 프로필 페이지로 선언 */
export function buildProfilePageJsonLd(params: {
  description: string;
  dateModified: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${siteConfig.url}/about#profilepage`,
    url: `${siteConfig.url}/about`,
    name: `${siteConfig.author.name} — ${siteConfig.name} 소개`,
    description: params.description,
    inLanguage: 'ko-KR',
    dateModified: params.dateModified,
    mainEntity: { '@id': entityIds.person },
    isPartOf: { '@id': entityIds.website },
  };
}

/** 질문-답변 쌍 구조화 데이터 (About 페이지 하단 Q&A) */
export function buildFaqJsonLd(
  items: Array<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** WebSite + SearchAction 구조화 데이터 (전역) */
export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': entityIds.website,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'ko-KR',
    author: authorRef(),
    publisher: authorRef(),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBlogPostingJsonLd(params: {
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
  datePublished: string;
  dateModified?: string;
  tags: string[];
}): Record<string, unknown> {
  const url = getCanonicalUrl(`/post/${params.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: params.title,
    description: params.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: params.imageUrl,
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    inLanguage: 'ko-KR',
    keywords: params.tags.join(', '),
    isPartOf: { '@id': entityIds.website },
    author: authorRef(),
    publisher: authorRef(),
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path),
    })),
  };
}
