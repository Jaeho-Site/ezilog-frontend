import Image from "next/image";
import Link from "next/link";
import { FiCalendar } from "react-icons/fi";

// 포스트 데이터 타입 정의
export interface PostData {
  id: number | string;
  title: string;
  description: string;
  slug: string;
  coverImage?: {
    url: string;
    alt: string;
  } | null;
  publishedDate: string;
  category: {
    name: string;
    slug: string;
    id?: number | string;
  };
  tags: Array<{
    id: number | string;
    name: string;
    slug: string;
  }>;
  [key: string]: any; // 추가 필드를 허용하기 위한 인덱스 시그니처
}

interface PostCardProps {
  post: PostData;
  aspect?: 'square' | 'video' | 'custom' | '3/2' | '4/3' | '2/3' | '5/4' | '4/5';
  minimal?: boolean;
  preloadImage?: boolean;
  fontSize?: 'default' | 'large';
  fontWeight?: 'normal' | 'bold';
}

export default function PostCard({
  post,
  aspect = '4/3',
  minimal = false,
  preloadImage = false,
  fontSize = 'default',
  fontWeight = 'bold'
}: PostCardProps) {
  const {
    title,
    description,
    slug,
    coverImage,
    publishedDate,
    category,
  } = post;

  // 이미지 URL 처리 함수
  const getImageUrl = (url: string) => {
    // 이미 http나 https로 시작하는 완전한 URL인 경우 그대로 사용
    if (url.startsWith('http')) {
      return url;
    }
    
    // 상대 경로인 경우(/로 시작하는 경우) 그대로 사용
    if (url.startsWith('/')) {
      return url;
    }
    
    // 그 외의 경우 CDN URL과 결합
    return `${process.env.NEXT_PUBLIC_CDN_URL || ''}/${url}`;
  };
  
  // 날짜 형식 변환 (YYYY-MM-DD -> Month DD, YYYY)
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString; // 변환 실패 시 원본 문자열 반환
    }
  };
  
  // 날짜 포맷팅 (YYYY-MM-DD)
  const formattedDate = new Date(publishedDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '-').replace('.', '');

  return (
    <div className="group cursor-pointer flex flex-col overflow-hidden rounded-md bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* 이미지 */}
      <Link
        href={`/post/${slug}`}
        className="relative block w-full aspect-[4/3] overflow-hidden"
      >
        {coverImage ? (
          <Image
            src={getImageUrl(coverImage.url)}
            alt={coverImage.alt || title}
            priority={preloadImage}
            className="object-cover hover:scale-105 transition-transform duration-500"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-800">
            <span className="text-gray-500 dark:text-gray-400">이미지 없음</span>
          </div>
        )}
      </Link>

      {/* 텍스트 컨텐츠 */}
      <div className="flex flex-col p-3 flex-grow">
        {/* 태그 표시 */}
        <div className="mb-1.5 flex flex-wrap">
          {post.tags && post.tags.length > 0 ? (
            post.tags.map((tag, index) => (
              <Link 
                key={index} 
                href={`/tag/${tag.slug}`}
                className="mr-1.5 mb-1 px-1.5 py-0.5 text-xs font-medium uppercase text-blue-600 dark:text-blue-400 
                  hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors rounded-sm tracking-wide"
              >
                {tag.name}
              </Link>
            ))
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">태그 없음</span>
          )}
        </div>
        
        {/* 제목 (최대 2줄) */}
        <h2 className="text-lg md:text-xl font-bold leading-snug mb-1.5 text-gray-900 dark:text-white line-clamp-2">
          <Link href={`/post/${slug}`}>
            <span className="bg-gradient-to-r from-green-200 to-green-100 bg-[length:0px_10px] bg-left-bottom
              bg-no-repeat transition-[background-size] duration-500
              hover:bg-[length:100%_3px] group-hover:bg-[length:100%_10px]
              dark:from-purple-800 dark:to-purple-900">
              {title}
            </span>
          </Link>
        </h2>
        
        {/* 설명 (minimal이 아닌 경우에만 표시하되, 한 줄로만 표시) */}
        {description && !minimal && (
          <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-1 text-sm">
            {description}
          </p>
        )}
        
        {/* 날짜 */}
        <div className="mt-auto pt-1 flex items-center text-gray-500 dark:text-gray-400 text-xs">
          <FiCalendar className="mr-1" />
          <time dateTime={publishedDate}>
            {formattedDate}
          </time>
        </div>
      </div>
    </div>
  );
}
