import { getCanonicalUrl, getMetadataBase } from '../config';
import { buildBaseMetadata, buildOpenGraph, buildTwitterCard, buildRobots } from '../builders';
import { MetadataResult } from '../types';

export function generateLatestMetadata(): MetadataResult {
  const title = '최신 포스트 | EziLog';
  const description = 'EziLog의 최신 개발 관련 포스트를 확인해보세요.';
  const keywords = ['최신 포스트', 'EziLog', '블로그', '최신 기술'];
  const canonicalUrl = getCanonicalUrl('/latest');

  const baseMetadata = buildBaseMetadata({
    title,
    description,
    keywords,
    canonicalUrl,
  });

  const openGraph = buildOpenGraph({
    title,
    description: 'EziLog의 최신 개발 관련 포스트를 확인해보세요.',
    url: canonicalUrl,
    type: 'website',
  });

  const twitter = buildTwitterCard({
    card: 'summary',
    title,
    description: 'EziLog의 최신 개발 관련 포스트를 확인해보세요.',
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
