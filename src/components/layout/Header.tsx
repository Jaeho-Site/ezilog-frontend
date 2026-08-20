"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { FiMenu, FiMoon, FiSun, FiX, FiSearch, FiArrowUpRight } from "react-icons/fi";
import SearchBar from "@/components/ui/SearchBar";
import { siteConfig } from "@/lib/metadata/config";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Archive" },
  { href: "/search?type=tags", label: "Tags" },
] as const;

/**
 * 좌측 축 헤더 — 로고가 왼쪽 끝에 서고 그 오른쪽으로 내비가 이어진다.
 * 목록 페이지의 좌측 레일(SideNav)과 같은 컨테이너 폭(max-w-[1440px] px-6)을 써서
 * 로고와 레일이 정확히 같은 세로선에 놓인다.
 */
const Header = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 마운트 이후에만 theme 값을 사용한다 (하이드레이션 불일치 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const ThemeToggleButton = () => {
    if (!mounted) {
      // Layout Shift 방지를 위한 플레이스홀더
      return (
        <div className="p-2 rounded-md w-10 h-10">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      );
    }

    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      >
        {resolvedTheme === "dark" ? (
          <FiSun className="h-6 w-6 text-yellow-500" />
        ) : (
          <FiMoon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>
    );
  };

  return (
    <header className="bg-gray-50 dark:bg-gray-950 py-6">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between gap-6">
          {/* 왼쪽: 로고 + 내비 */}
          <div className="flex items-center gap-10 min-w-0">
            <Link href="/" className="shrink-0" aria-label="EziLog 홈">
              <div className="relative w-[100px] h-[50px] md:w-[122px] md:h-[62px]">
                <Image
                  src="/Ezilog2.svg"
                  alt="EziLog"
                  fill
                  className="object-contain dark:invert"
                  priority
                />
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={siteConfig.author.notes}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                Notes
                <FiArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </nav>
          </div>

          {/* 오른쪽: 검색 + 테마 + 모바일 메뉴 */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block">
              <SearchBar
                variant="compact"
                placeholder="포스트 검색..."
                className="transition-all duration-300"
              />
            </div>

            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="검색"
            >
              <FiSearch className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>

            <ThemeToggleButton />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="메뉴"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <FiX className="h-7 w-7 text-gray-700 dark:text-gray-300" />
              ) : (
                <FiMenu className="h-7 w-7 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* 모바일 검색바 (확장 시에만 표시) */}
        {isSearchExpanded && (
          <div className="md:hidden mt-4">
            <SearchBar
              expanded={isSearchExpanded}
              onToggle={() => setIsSearchExpanded(!isSearchExpanded)}
              placeholder="포스트 검색..."
            />
          </div>
        )}

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col space-y-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={siteConfig.author.notes}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Notes
              <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
