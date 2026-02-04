import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PostNavigationCardProps {
  post: {
    slug?: string;
    title: string;
    description?: string;
  };
  href: string;
  direction: 'prev' | 'next';
}

export default function PostNavigationCard({ post, href, direction }: PostNavigationCardProps) {
  const isPrev = direction === 'prev';
  const Icon = isPrev ? FiChevronLeft : FiChevronRight;
  const label = isPrev ? '이전 포스트' : '다음 포스트';

  return (
    <div className="flex justify-start">
      <Link
        href={href}
        className="group flex items-center p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
          rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-600 
          w-full md:max-w-md"
      >
        <div className="flex items-start text-left w-full">
          {isPrev && (
            <div className="flex-shrink-0 mr-4 mt-1">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center
                group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</p>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200 mb-2 
              group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight
              line-clamp-2">
              {post.title}
            </h3>
            {post.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {post.description}
              </p>
            )}
          </div>
          
          {!isPrev && (
            <div className="flex-shrink-0 ml-4 mt-1">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center
                group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
} 