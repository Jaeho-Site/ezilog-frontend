// 이미지 URL 최적화 함수
export const getImageUrl = (url: string) => {
  if (!url) return '';
  
  // CloudFront 도메인
  const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || '';
  
  // 이미 http나 https로 시작하는 완전한 URL인 경우
  if (url.startsWith('http')) {
    // S3 URL을 CloudFront URL로 변환
    if (url.includes('amazonaws.com')) {
      return url.replace(
        /https:\/\/jaehomade-ezilog\.s3\.ap-northeast-2\.amazonaws\.com/g,
        CLOUDFRONT_DOMAIN.replace(/\/$/, '')
      );
    }
    return url;
  }
  
  // 상대 경로인 경우 그대로 사용
  if (url.startsWith('/')) return url;
  
  // 그 외의 경우 CDN URL과 결합
  return `${process.env.NEXT_PUBLIC_CDN_URL || ''}/${url}`;
};

// 마크다운 이미지 URL 변환
export const transformMarkdownImageUrls = (markdown: string) => {
  if (!markdown) return '';
  
  const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || '';
  return markdown.replace(
    /!\[(.*?)\]\((https:\/\/jaehomade-ezilog\.s3\.ap-northeast-2\.amazonaws\.com\/[^)]+)\)/g,
    (_: string, alt: string, url: string) => {
      const cloudFrontUrl = url.replace(
        /https:\/\/jaehomade-ezilog\.s3\.ap-northeast-2\.amazonaws\.com/g,
        CLOUDFRONT_DOMAIN.replace(/\/$/, '')
      );
      return `![${alt}](${cloudFrontUrl})`;
    }
  );
};
