import Image from "next/image";
import Link from "next/link";
import { FiCalendar } from "react-icons/fi";
import { getTagColor } from "@/utils/tagColors";
import { PostData } from "@/components/ui/PostCard";

interface FeaturedPostProps {
  post: PostData;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
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
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('/')) {
      return url;
    }
    return `${process.env.NEXT_PUBLIC_CDN_URL || ''}/${url}`;
  };

  // 날짜 포맷팅 (YYYY-MM-DD)
  const formattedDate = new Date(publishedDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '-').replace('.', '');

  return (
    <div className="group cursor-pointer mb-10 px-4 md:px-12 xl:px-16">
      <div className="md:flex md:gap-6 xl:gap-10">
        {/* 왼쪽: 커버 이미지 */}
        <div className="md:w-1/2">
          <Link href={`/post/${slug}`} className="block">
            <div className="relative w-full h-52 md:h-60 xl:h-72 rounded-lg overflow-hidden border border-gray-300 transition-transform duration-300 hover:scale-[1.03]">
              {coverImage ? (
                <Image
                  src={getImageUrl(coverImage.url)}
                  alt={coverImage.alt || title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">이미지 없음</span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* 오른쪽: 콘텐츠 */}
        <div className="md:w-1/2 mt-4 md:mt-0 flex flex-col justify-center">
          {/* 태그 */}
          <div className="mb-4 flex flex-wrap">
            {post.tags && post.tags.length > 0 ? (
              post.tags.map((tag, index) => {
                const tagColor = getTagColor(tag.name);
                return (
                  <Link 
                    key={index} 
                    href={`/search?q=${encodeURIComponent(tag.name)}&type=tag`}
                    className={`mr-2 mb-2 px-2 py-1 text-sm font-medium uppercase 
                      ${tagColor.text} ${tagColor.hover} transition-colors rounded-md tracking-wide`}
                  >
                    {tag.name}
                  </Link>
                );
              })
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                태그 없음
              </span>
            )}
          </div>

          {/* 제목 */}
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white leading-tight">
            <Link href={`/post/${slug}`}>
              <span className="bg-gradient-to-r from-green-200 to-green-100 bg-[length:0px_10px] bg-left-bottom
                bg-no-repeat transition-[background-size] duration-500
                hover:bg-[length:100%_3px] group-hover:bg-[length:100%_10px]
                dark:from-purple-800 dark:to-purple-900">
                기획부터 구현까지 직접 만든 블로그입니다.<br />
                첫번째 포스트, 블로그 둘러보기!
              </span>
            </Link>
          </h2>

          {/* 설명 */}
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base leading-relaxed line-clamp-3">
              {description}
            </p>
          )}

          {/* 날짜 */}
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <FiCalendar className="mr-2 w-4 h-4" />
            <time dateTime={publishedDate} className="text-sm">
              {formattedDate}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
} 