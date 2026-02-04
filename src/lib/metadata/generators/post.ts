import { Metadata } from 'next';
import { siteConfig, getCanonicalUrl, getImageUrl, getMetadataBase } from '../config';
import { buildBaseMetadata, buildOpenGraph, buildTwitterCard, buildRobots } from '../builders';
import { PostMetadataParams, MetadataResult } from '../types';

export function generatePostMetadata(params: PostMetadataParams): MetadataResult {
  const { title, description, slug, coverImage, publishedDate, tags } = params;

  const pageTitle = `${title} | EziLog`;
  const pageDescription =
    description || `${title}에 대한 개발 포스트입니다.`;
  
  const tagNames = tags?.map((tag) => tag.name) || [];
  const coreKeywords = ['frontend', 'EziLog', '웹 개발'];
  const keywords = [...coreKeywords, ...tagNames.slice(0, 5)];
  
  const canonicalUrl = getCanonicalUrl(`/post/${slug}`);
  const imageUrl = coverImage?.url ? getImageUrl(coverImage.url) : getImageUrl(siteConfig.defaultImage);

  const baseMetadata = buildBaseMetadata({
    title: pageTitle,
    description: pageDescription,
    keywords,
    canonicalUrl,
  });

  const openGraph = buildOpenGraph({
    title,
    description: description || `${title}에 대한 개발 포스트입니다.`,
    url: canonicalUrl,
    type: 'article',
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    publishedTime: publishedDate,
    authors: ['EziLog'],
    tags: tagNames,
  });

  const twitter = buildTwitterCard({
    card: 'summary_large_image',
    title,
    description: description || `${title}에 대한 개발 포스트입니다.`,
    images: [imageUrl],
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

export function generatePostNotFoundMetadata(slug: string): MetadataResult {
  const canonicalUrl = getCanonicalUrl(`/post/${slug}`);
  
  return {
    metadataBase: getMetadataBase(),
    title: '게시물을 찾을 수 없습니다',
    alternates: { canonical: canonicalUrl },
    robots: { index: false, follow: true },
  };
}
