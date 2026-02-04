export const siteConfig = {
  name: 'EziLog',
  url: process.env.NEXT_PUBLIC_SITE_URL || '',
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

export function getMetadataBase(): URL | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  return url ? new URL(url) : null;
}

export function getCanonicalUrl(path: string): string {
  const baseUrl = siteConfig.url;
  return `${baseUrl}${path}`;
}

export function getImageUrl(imagePath: string): string {
  const baseUrl = siteConfig.url;
  return imagePath.startsWith('http') 
    ? imagePath 
    : `${baseUrl}${imagePath}`;
}
