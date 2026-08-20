import { getCanonicalUrl, getMetadataBase } from '../config';
import { buildBaseMetadata, buildOpenGraph, buildTwitterCard, buildRobots } from '../builders';
import { SearchMetadataParams, MetadataResult } from '../types';

export function generateSearchMetadata(params?: SearchMetadataParams): MetadataResult {
  const query = params?.query;
  
  const title = query
    ? `'${query}' 검색 결과`
    : 'Archive — 전체 글';

  const description = query
    ? `'${query}'에 대한 검색 결과입니다.`
    : 'EziLog에 쓴 글 전체를 한곳에 모았습니다. 카테고리·태그·키워드로 바로 걸러서 찾아보세요.';

  const keywords = ['Archive', '전체 글', '포스트 검색', '카테고리', '태그', 'EziLog'];

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
