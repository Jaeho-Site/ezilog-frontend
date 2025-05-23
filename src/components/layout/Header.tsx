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
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  // useEffect를 사용하여 컴포넌트가 마운트된 후에만 theme 값을 사용
  useEffect(() => {
    setMounted(true);
  }, []);

  // 스크롤 위치에 따라 헤더 숨김/표시 제어
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
      
      setPrevScrollPos(currentScrollPos);
      setVisible(isVisible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

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
      className={`sticky top-0 z-50 bg-white dark:bg-gray-900 py-8 transition-transform duration-300 ${
        visible ? 'transform-none' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-6 relative">
        {/* PC 헤더 - Grid 레이아웃 사용 */}
        <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
          {/* 왼쪽: 카테고리 버튼 */}
          <div className="flex justify-start">
            <button
              onClick={toggleCategory}
              className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="카테고리 메뉴"
            >
              <FiMenu className="h-7 w-7 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* 중앙: 메인 네비게이션 - 화면 중앙에 고정 */}
          <div className="flex justify-center">
            <nav className="flex items-center">
              {/* 왼쪽 링크 그룹 */}
              <div className="flex items-center">
                <Link
                  href="/"
                  className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mr-12"
                >
                  Home
                </Link>
                
                <Link
                  href="/about"
                  className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mr-14"
                >
                  About
                </Link>
              </div>
              
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
              
              {/* 오른쪽 링크 그룹 */}
              <div className="flex items-center">
                <Link
                  href="/search"
                  className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-14"
                >
                  Archive
                </Link>
                
                <Link
                  href="/latest"
                  className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-12 mr-6"
                >
                  Latest
                </Link>
              </div>
            </nav>
          </div>

          {/* 오른쪽: 검색바, 다크모드 토글 */}
          <div className="flex justify-end items-center space-x-4">
            {/* 검색바 (PC) - 항상 표시 */}
            <div className="hidden md:block ml-4">
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
              href="/about"
              className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
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
