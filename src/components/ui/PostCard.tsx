import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiTag } from "react-icons/fi";

// 포스트 데이터 타입 정의
export interface PostData {
  id: number;
  title: string;
  description: string;
  slug: string;
  coverImage: {
    url: string;
    alt?: string;
  } | null;
  publishedDate: string;
  category: {
    name: string;
    slug: string;
  };
  tags: {
    name: string;
    slug: string;
  }[];
}

interface PostCardProps {
  post: PostData;
  aspect?: 'square' | 'video' | 'custom';
  minimal?: boolean;
  preloadImage?: boolean;
  fontSize?: 'default' | 'large';
  fontWeight?: 'normal' | 'bold';
}

export default function PostCard({
  post,
  aspect = 'custom',
  minimal = false,
  preloadImage = false,
  fontSize = 'default',
  fontWeight = 'bold'
}: PostCardProps) {
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
  
  return (
    <div
      className={`group cursor-pointer ${
        minimal ? "grid gap-10 md:grid-cols-2" : ""
      }`}>
      <div
        className="overflow-hidden rounded-md bg-gray-100 transition-all hover:scale-105 dark:bg-gray-800"
      >
        <Link
          href={`/post/${post.slug}`}
          className={`relative block ${
            aspect === "video"
              ? "aspect-video"
              : aspect === "custom"
              ? "aspect-[5/4]"
              : "aspect-square"
          }`}
        >
          {post.coverImage ? (
            <Image
              src={getImageUrl(post.coverImage.url)}
              alt={post.coverImage.alt || post.title}
              priority={preloadImage}
              className="object-cover transition-all"
              fill
              sizes="(max-width: 768px) 30vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-gray-500 dark:text-gray-400">이미지 없음</span>
            </div>
          )}
        </Link>
      </div>

      <div className={minimal ? "flex items-center" : ""}>
        <div>
          {/* 태그 표시 */}
          <div className={`flex flex-wrap ${minimal ? "mb-0" : "mb-2"}`}>
            {post.tags && post.tags.length > 0 && post.tags.map((tag, index) => (
              <Link 
                key={index} 
                href={`/tag/${tag.slug}`}
                className="mr-2 mb-2 inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                <FiTag className="mr-1" />
                {tag.name}
              </Link>
            ))}
          </div>
          
          {/* 카테고리 (필요시) */}
          <Link 
            href={`/category/${post.category.slug}`}
            className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 inline-block"
          >
            {post.category.name}
          </Link>
          
          {/* 제목 */}
          <h2
            className={`mt-2 ${
              fontSize === "large"
                ? "text-2xl"
                : minimal
                ? "text-3xl"
                : "text-lg"
            } ${
              fontWeight === "normal"
                ? "line-clamp-2 font-medium tracking-normal text-black"
                : "font-semibold leading-snug tracking-tight"
            } dark:text-white`}
          >
            <Link href={`/post/${post.slug}`}>
              <span className="bg-gradient-to-r from-green-200 to-green-100 bg-[length:0px_10px] bg-left-bottom
                bg-no-repeat transition-[background-size] duration-500
                hover:bg-[length:100%_3px] group-hover:bg-[length:100%_10px]
                dark:from-purple-800 dark:to-purple-900"
              >
                {post.title}
              </span>
            </Link>
          </h2>

          {/* 설명 (축소된 형태) */}
          {post.description && !minimal && (
            <p className="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
              {post.description}
            </p>
          )}

          {/* 날짜 */}
          <div className="mt-3 flex items-center space-x-3 text-gray-500 dark:text-gray-400">
            <time
              className="flex items-center text-sm"
              dateTime={post.publishedDate}
            >
              <FiCalendar className="mr-1" />
              {post.publishedDate}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}
