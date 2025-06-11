import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 🎯 빌드 타임에 이미 변환된 CloudFront URL 사용하므로 간단한 설정
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    // 최적화된 이미지 포맷 우선순위
    formats: ['image/avif', 'image/webp'],
    // 반응형 디바이스 크기
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 캐시 최적화 (1년)
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // 외부 이미지 로더 최적화
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 성능 최적화
  compress: true,
  
  // 번들 최적화
  experimental: {
    optimizePackageImports: ['react-icons'],
    // 🎯 안정적인 최적화만 사용 (CSS 최적화 제거)
    optimizeServerReact: true,
  },
  
  // 보안 설정
  poweredByHeader: false,
  reactStrictMode: true,
  
  // 보안 헤더
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // 정적 자산 캐시 최적화
      {
        source: '/data/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
