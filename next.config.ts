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
    // 이미지 최적화 설정 추가
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1년 캐시
  },
  
  // 성능 최적화
  compress: true,
  
  // 번들 최적화
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  
  // 보안 관련 추가 설정
  poweredByHeader: false, // 'X-Powered-By' 헤더 제거
  reactStrictMode: true, // 엄격 모드 활성화
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
