import { getCanonicalUrl, getMetadataBase } from '../config';
import { buildBaseMetadata, buildOpenGraph, buildTwitterCard, buildRobots } from '../builders';
import { SearchMetadataParams, MetadataResult } from '../types';

export function generateSearchMetadata(params?: SearchMetadataParams): MetadataResult {
  const query = params?.query;
  
  const title = query
    ? `'${query}' 검색 결과 `
    : '포스트 검색';
  
  const description = query
    ? `'${query}'에 대한 검색 결과입니다.`
    : '카테고리별, 태그별, 키워드별로 원하는 기술 정보를 빠르게 찾아보세요.';
  
  const keywords = ['검색', '포스트 검색', 'EziLog', '블로그'];

  const canonicalUrl = getCanonicalUrl('/search');

  const baseMetadata = buildBaseMetadata({
    title,
    description,
    keywords,
    canonicalUrl,
  });

  const openGraph = buildOpenGraph({
    title,
    description,
    url: canonicalUrl,
    type: 'website',
  });

  const twitter = buildTwitterCard({
    card: 'summary',
    title,
    description,
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
