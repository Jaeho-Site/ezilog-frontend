import Link from "next/link";
import { FiArrowUpRight, FiGithub, FiMail } from "react-icons/fi";
import { getAllCategories } from "@/lib/content";
import { siteConfig } from "@/lib/metadata/config";

// 상태·핸들러가 없으므로 서버 컴포넌트로 둔다 (클라이언트 번들에 포함되지 않음).
//
// 카테고리 링크를 여기에 두는 이유: Archive의 카테고리 칩은 페이지 내 필터라
// 카테고리 전용 페이지(/category/*)로 가는 링크가 아니다. 푸터가 그 페이지들로 가는
// 사이트 전역 내부 링크를 담당한다 — 모든 페이지의 초기 HTML에 포함된다.
const Footer = () => {
  const categories = getAllCategories().filter((category) => category.postCount > 0);

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <nav className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-sm">
              <Link
                href="/about"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                소개
              </Link>
              <Link
                href="/search"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                전체 글
              </Link>
              <a
                href={siteConfig.author.notes}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Notes
                <FiArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </nav>

            {categories.length > 0 && (
              <nav
                aria-label="카테고리"
                className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm"
              >
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {category.name}
                    <span className="ml-1 text-xs opacity-70">({category.postCount})</span>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center justify-center space-x-4">
            <a
              href={`mailto:${siteConfig.author.email}`}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="이메일 보내기"
            >
              <FiMail className="h-5 w-5" />
            </a>
            <a
              href={siteConfig.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <FiGithub className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
