import { Metadata } from 'next';
import { siteConfig, getCanonicalUrl, getMetadataBase, getImageUrl } from '../config';
import { buildBaseMetadata, buildOpenGraph, buildTwitterCard, buildRobots } from '../builders';
import { MetadataResult } from '../types';

export function generateHomeMetadata(): MetadataResult {
  const title = 'EziLog 개발자를 위한 기술 블로그';
  const description = '학습과 개발 과정을 기록하며 웹 개발 경험을 공유합니다.';
  const keywords = [
    'EziLog',
    '개발 블로그',
    'React',
    'Next.js',
    'JavaScript',
    'TypeScript',
    '웹 개발',
    '카카오테크 캠퍼스',
    'aws',
  ];
  const canonicalUrl = getCanonicalUrl('/');

  const baseMetadata = buildBaseMetadata({
    title,
    description,
    keywords,
    canonicalUrl,
  });

  const openGraph = buildOpenGraph({
    title: 'EziLog 개발자를 위한 기술 블로그',
    description: '학습과 개발 과정을 기록하며 웹 개발 경험을 공유합니다.',
    url: siteConfig.url,
    type: 'website',
  });

  const twitter = buildTwitterCard({
    card: 'summary_large_image',
    title: 'EziLog 개발자를 위한 기술 블로그',
    description: '학습과 개발 과정을 기록하며 웹 개발 경험을 공유합니다.',
    images: [getImageUrl(siteConfig.defaultImage)],
  });

  const robots = buildRobots();

  return {
    metadataBase: getMetadataBase(),
    ...baseMetadata,
    openGraph,
    twitter,
    robots,
    verification: {
      google: 'your-google-verification-code',
    },
  };
}
