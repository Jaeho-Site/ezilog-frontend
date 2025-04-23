import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: process.env.NEXT_PUBLIC_CDN_URL ? 
      [process.env.NEXT_PUBLIC_CDN_URL.replace(/^https?:\/\//, '')] : [],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_CDN_PATTERN || '**.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 보안 관련 추가 설정
  poweredByHeader: false, // 'X-Powered-By' 헤더 제거
  reactStrictMode: true, // 엄격 모드 활성화
};

export default nextConfig;
