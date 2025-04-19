export default function Archive() {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">EziLog 소개</h1>
        
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">프로젝트 소개</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            EziLog는 Strapi CMS, Next.js, Supabase, AWS S3를 사용한 헤드리스 블로그 플랫폼입니다.
            정적 생성(SSG) 기반의 SEO 최적화 구조를 통해 빠른 로딩 속도와 검색 엔진 최적화를 제공합니다.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">기술 스택</h2>
          <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2">CMS: Strapi - 콘텐츠 관리 시스템</li>
            <li className="mb-2">프론트엔드: Next.js - React 기반 프레임워크</li>
            <li className="mb-2">댓글 시스템: Supabase Realtime - 실시간 데이터 동기화</li>
            <li className="mb-2">이미지 스토리지: AWS S3 + CloudFront - 이미지 저장 및 CDN 서비스</li>
            <li>배포: Vercel - 프론트엔드 호스팅 및 CI/CD</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">주요 기능</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2">SEO 최적화된 정적 페이지 생성</li>
            <li className="mb-2">마크다운 및 리치 텍스트 지원</li>
            <li className="mb-2">카테고리 및 태그 기반 콘텐츠 분류</li>
            <li className="mb-2">Supabase를 활용한 실시간 댓글 시스템</li>
            <li>다크 모드 지원</li>
          </ul>
        </div>
        
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            이 프로젝트는 개발 중이며, 추가 기능 및 개선 사항이 계속 업데이트될 예정입니다.
          </p>
        </div>
      </div>
    );
  }
  