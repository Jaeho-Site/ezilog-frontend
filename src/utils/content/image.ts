// 🎯 빌드 타임에 이미 CloudFront URL로 변환된 URL을 사용하는 단순화된 함수
export const getImageUrl = (url: string) => {
  // 빌드 타임에 이미 처리되었으므로 그대로 반환
  return url || '';
};

// 🎯 빌드 타임에 이미 변환되었으므로 마크다운도 변환 불필요
export const transformMarkdownImageUrls = (markdown: string) => {
  // 빌드 타임에 이미 처리되었으므로 그대로 반환
  return markdown || '';
};
