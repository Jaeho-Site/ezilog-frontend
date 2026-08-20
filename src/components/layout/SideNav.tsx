import Link from "next/link";
import { Category, Post } from "@/types/models";

export interface CategoryWithCount extends Category {
  postCount: number;
}

interface SideNavProps {
  categories: CategoryWithCount[];
  latestPosts: Post[];
}

/**
 * 목록성 페이지의 좌측 고정 내비 (xl 이상).
 *
 * 헤더 로고가 왼쪽으로 오면서 헤더와 이 레일이 같은 좌측 축을 공유한다.
 * (예전 중앙 대칭 헤더 아래에 레일을 붙였을 때 본문 중심선이 어긋났던 문제의 해결책)
 *
 * 카테고리가 4개뿐이라 레일이 비어 보이므로 최신 글 목록을 함께 싣는다.
 * 데이터는 서버 레이아웃에서 content 레이어로부터 주입받는다 — 새 조회 함수는 필요 없다.
 */
const SideNav = ({ categories, latestPosts }: SideNavProps) => {
  return (
    <aside className="hidden xl:block xl:w-56 xl:shrink-0 pt-12">
      <div className="sticky top-8 space-y-10">
        {categories.length > 0 && (
          <nav aria-label="카테고리">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              카테고리
            </h2>
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="flex items-baseline justify-between gap-2 py-2
                      text-base font-medium text-gray-700 dark:text-gray-300
                      hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {category.postCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {latestPosts.length > 0 && (
          <nav aria-label="최신 글">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              최신 글
            </h2>
            <ul className="space-y-3.5">
              {latestPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/post/${post.slug}`}
                    className="text-[0.9375rem] leading-relaxed text-gray-600 dark:text-gray-400
                      hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/search"
              className="inline-block mt-5 text-sm text-gray-500 dark:text-gray-500
                hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              전체 보기 →
            </Link>
          </nav>
        )}
      </div>
    </aside>
  );
};

export default SideNav;
