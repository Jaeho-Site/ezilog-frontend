import { siteConfig, getCanonicalUrl, getMetadataBase } from '../config';
import { buildBaseMetadata, buildOpenGraph, buildTwitterCard, buildRobots } from '../builders';
import { MetadataResult } from '../types';

/** About 페이지 설명 — JSON-LD Person.description 과 문구를 공유한다. */
export const aboutDescription =
  `${siteConfig.author.name}는 EziLog를 직접 만들고 운영하는 개발자입니다. ` +
  `${siteConfig.author.jobTitle}로 시작해 프론트엔드를 강점으로 서비스 전체를 설계하는 소프트웨어 아키텍트를 목표로 하고 있습니다. ` +
  'EziLog는 기획부터 디자인, 구현, 배포까지 직접 만들어 운영하는 개발 블로그로, ' +
  'JavaScript와 웹의 기본 원리부터 프론트엔드와 백엔드, 인프라와 아키텍처, AI를 활용한 개발 방식까지 기록합니다.';

export function generateAboutMetadata(): MetadataResult {
  // 루트 레이아웃의 title 템플릿(`%s | EziLog`)이 붙으므로 사이트명은 넣지 않는다.
  const title = `소개 — ${siteConfig.author.name}`;
  const keywords = [
    '신재호',
    'EziLog',
    '프론트엔드 개발자',
    '소프트웨어 아키텍트',
    '개발 블로그 소개',
    'JavaScript',
    'Next.js',
    'Kubernetes',
    'AI 활용 개발',
  ];
  const canonicalUrl = getCanonicalUrl('/about');

  const baseMetadata = buildBaseMetadata({
    title,
    description: aboutDescription,
    keywords,
    canonicalUrl,
  });

  return {
    metadataBase: getMetadataBase(),
    ...baseMetadata,
    openGraph: buildOpenGraph({
      title,
      description: aboutDescription,
      url: canonicalUrl,
      type: 'website',
    }),
    twitter: buildTwitterCard({
      card: 'summary_large_image',
      title,
      description: aboutDescription,
    }),
    robots: buildRobots(),
  };
}
