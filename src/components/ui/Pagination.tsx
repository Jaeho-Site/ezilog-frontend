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
  // 옵셔널 라우팅 방식 경로 생성
  const getPagePath = (pageNum: number) => {
    if (pageNum === 1) {
      return basePath; // /category/react
    }
    return `${basePath}/${pageNum}`; // /category/react/2, /category/react/3
  };

  return (
    <div className="mt-12 flex justify-center">
      <nav className="flex items-center space-x-2">
        {currentPage > 1 && (
          <Link 
            href={getPagePath(currentPage - 1)}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            이전
          </Link>
        )}
        
        <span className="px-4 py-2 border rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {currentPage}
        </span>
        
        {(hasMore || (totalPages && currentPage < totalPages)) && (
          <Link 
            href={getPagePath(currentPage + 1)} 
            className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            다음
          </Link>
        )}
      </nav>
    </div>
  );
}
