"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { FiMenu, FiMoon, FiSun, FiX, FiSearch } from "react-icons/fi";
import CategoryBar from "@/components/category/CategoryBar";
import SearchBar from "@/components/ui/SearchBar";

const Header = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // useEffect를 사용하여 컴포넌트가 마운트된 후에만 theme 값을 사용
  useEffect(() => {
    setMounted(true);
  }, []);

  // 공식문서 권장: 더 명확한 테마 토글 함수
  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const toggleCategory = () => {
    setIsCategoryOpen(!isCategoryOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isCategoryOpen) setIsCategoryOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  // 공식문서 권장: mounted가 false일 때 null 반환하는 대신 플레이스홀더 렌더링
  const ThemeToggleButton = ({ mobile = false }: { mobile?: boolean }) => {
    if (!mounted) {
      // Layout Shift 방지를 위한 플레이스홀더
      return (
        <div className={`p-2 rounded-md w-10 h-10 ${mobile ? 'mr-1' : ''}`}>
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      );
    }

    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${mobile ? 'mr-1' : ''}`}
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
    <header 
      className="bg-gray-50 dark:bg-gray-950 py-8"
    >
      <div className="container mx-auto px-6 relative">
        {/* PC 헤더 - 중앙 네비게이션 우선 배치 */}
        <div className="hidden md:flex md:items-center md:justify-center md:relative">
          {/* 카테고리 버튼 - 절대 위치로 왼쪽에 고정 */}
          <div className="absolute left-0 flex items-center">
            <button
              onClick={toggleCategory}
              className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="카테고리 메뉴"
            >
              <FiMenu className="h-7 w-7 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* 중앙: 5개 요소 (Home, About, Logo, Archive, Latest) - 화면 정중앙에 배치 */}
          <nav className="flex items-center">
            <Link
              href="/"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mr-12"
            >
              Home
            </Link>
            
            <Link
              href="/search?type=tags"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mr-14"
            >
              Tags
            </Link>
            
            {/* 로고 */}
            <Link href="/" className="flex items-center mx-8">
              <div className="relative w-[122px] h-[69px] sm:h-12 md:h-14 lg:h-16 xl:h-[69px]">
                <Image 
                  src="/Ezilog2.svg"
                  alt="EziLog"
                  fill
                  className="object-contain dark:invert"
                  priority
                />
              </div>
            </Link>
            
            <Link
              href="/search"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-14"
            >
              Archive
            </Link>
            
            <Link
              href="/latest"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-12"
            >
              Latest
            </Link>
          </nav>

          {/* 검색바, 다크모드 토글 - 절대 위치로 오른쪽에 고정 */}
          <div className="absolute right-0 flex items-center space-x-4">
            {/* 검색바 (PC) - 항상 표시 */}
            <div className="hidden md:block">
              <SearchBar 
                variant="compact" 
                placeholder="포스트 검색..."
                className="transition-all duration-300"
              />
            </div>

            {/* 다크모드 토글 버튼 */}
            <ThemeToggleButton />
          </div>
        </div>

        {/* 모바일 헤더 */}
        <div className="flex md:hidden items-center justify-between">
          {/* 왼쪽: 카테고리 버튼 */}
          <button
            onClick={toggleCategory}
            className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="카테고리 메뉴"
          >
            <FiMenu className="h-7 w-7 text-gray-700 dark:text-gray-300" />
          </button>

          {/* 중앙: 로고 */}
          <Link href="/" className="flex items-center">
            <div className="relative w-[100px] h-[50px] sm:h-12">
              <Image 
                src="/Ezilog2.svg"
                alt="EziLog"
                fill
                className="object-contain dark:invert"
                priority
              />
            </div>
          </Link>

          {/* 오른쪽: 검색, 다크모드, 모바일 메뉴 버튼 */}
          <div className="flex items-center">
            {/* 검색 버튼 (모바일) */}
            <button
              onClick={toggleSearch}
              className="p-2 mr-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="검색"
            >
              <FiSearch className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>

            <ThemeToggleButton mobile />
            <button
              onClick={toggleMobileMenu}
              className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="모바일 메뉴"
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
              onToggle={toggleSearch} 
              placeholder="포스트 검색..."
            />
          </div>
        )}
      </div>

      {/* 카테고리 바 컴포넌트 */}
      <CategoryBar isOpen={isCategoryOpen} onClose={() => setIsCategoryOpen(false)} />

      {/* 모바일 메뉴 드롭다운 */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-24 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-6 transition-all">
          <nav className="flex flex-col space-y-6">
            <Link
              href="/"
              className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/search?type=tags"
              className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tags
            </Link>
            <Link
              href="/search"
              className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Archive
            </Link>
            <Link
              href="/latest"
              className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Latest
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
