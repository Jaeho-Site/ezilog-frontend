function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://ezilog.dev';
  const withProtocol = raw.startsWith('http') ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, '');
}

export const siteConfig = {
  name: 'EziLog',
  title: 'EziLog - 개발 블로그',
  description: '프론트엔드, 백엔드, 풀스택 개발 경험과 지식을 공유하는 기술 블로그입니다.',
  url: resolveSiteUrl(),
  defaultImage: '/og-image.png',
  locale: 'ko_KR',
  author: {
    name: 'EziLog',
    twitter: '@EziLog',
  },
  robots: {
    index: true,
    follow: true,
  },
} as const;

export function getMetadataBase(): URL {
  return new URL(siteConfig.url);
}

export function getCanonicalUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

export function getImageUrl(imagePath: string): string {
  return imagePath.startsWith('http') ? imagePath : `${siteConfig.url}${imagePath}`;
}

/** WebSite + SearchAction 구조화 데이터 (전역) */
export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'ko-KR',
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
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
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
