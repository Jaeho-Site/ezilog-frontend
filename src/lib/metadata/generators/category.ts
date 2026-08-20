import { Metadata } from 'next';
import { siteConfig, getCanonicalUrl, getMetadataBase } from '../config';
import { buildBaseMetadata, buildOpenGraph, buildTwitterCard, buildRobots } from '../builders';
import { CategoryMetadataParams, MetadataResult } from '../types';

export function generateCategoryMetadata(params: CategoryMetadataParams): MetadataResult {
  const { name, slug, totalPosts, pageNumber = 1 } = params;

  const isFirstPage = pageNumber === 1;
  
  const title = isFirstPage
    ? `${name} 카테고리`
    : `${name} 카테고리 ${pageNumber}페이지`;
  
  const description = isFirstPage
    ? `${name} 카테고리의 ${totalPosts}개 포스트를 확인해보세요.`
    : `${name} 카테고리의 포스트 목록 ${pageNumber}페이지입니다.`;
  
  const keywords = [name, '카테고리', 'EziLog'];
  
  const canonicalUrl = isFirstPage
    ? getCanonicalUrl(`/category/${slug}`)
    : getCanonicalUrl(`/category/${slug}/${pageNumber}`);

  const baseMetadata = buildBaseMetadata({
    title,
    description,
    keywords,
    canonicalUrl,
  });

  const ogTitle = isFirstPage
    ? `${name} 카테고리`
    : `${name} 카테고리 ${pageNumber}페이지`;
  
  const ogDescription = isFirstPage
    ? `${name} 카테고리의 ${totalPosts}개 포스트를 확인해보세요.`
    : `${name} 카테고리의 포스트 목록 ${pageNumber}페이지입니다.`;

  const openGraph = buildOpenGraph({
    title: ogTitle,
    description: ogDescription,
    url: canonicalUrl,
    type: 'website',
  });

  const twitter = buildTwitterCard({
    card: 'summary_large_image',
    title: ogTitle,
    description: ogDescription,
  });

  const robots = buildRobots();

  return {
    metadataBase: getMetadataBase(),
    ...baseMetadata,
    openGraph,
    twitter,
    robots,
  };
}

export function generateCategoryNotFoundMetadata(slug: string, pageNumber: number = 1): MetadataResult {
  const canonicalUrl = pageNumber === 1
    ? getCanonicalUrl(`/category/${slug}`)
    : getCanonicalUrl(`/category/${slug}/${pageNumber}`);
  
  return {
    metadataBase: getMetadataBase(),
    title: '카테고리',
    description: '카테고리별 포스트를 확인해보세요.',
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
