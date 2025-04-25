import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  hasMore?: boolean;
  basePath: string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  hasMore, 
  basePath 
}: PaginationProps) {
  // basePath가 루트인 경우 처리
  const getPagePath = (pageNum: number) => {
    if (basePath === '/' && pageNum === 1) return '/';
    if (basePath === '/') return `/page/${pageNum}`;
    return `${basePath}${pageNum === 1 ? '' : `/page/${pageNum}`}`;
  };

  return (
    <div className="mt-12 flex justify-center">
      <nav className="flex items-center space-x-2">
        {currentPage > 1 && (
          <Link 
            href={getPagePath(currentPage - 1)}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            이전
          </Link>
        )}
        
        <span className="px-4 py-2 border rounded-md bg-blue-100 dark:bg-blue-900">
          {currentPage}
        </span>
        
        {(hasMore || (totalPages && currentPage < totalPages)) && (
          <Link 
            href={getPagePath(currentPage + 1)} 
            className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            다음
          </Link>
        )}
      </nav>
    </div>
  );
}
