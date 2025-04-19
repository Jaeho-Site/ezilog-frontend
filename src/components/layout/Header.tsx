"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { FiMenu, FiMoon, FiSun, FiLogIn, FiX } from "react-icons/fi";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleCategory = () => {
    setIsCategoryOpen(!isCategoryOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isCategoryOpen) setIsCategoryOpen(false);
  };

  return (
    <header 
      className={`sticky top-0 z-50 bg-white dark:bg-gray-900 py-8 transition-transform duration-300 ${
        visible ? 'transform-none' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-6">
        {/* PC 헤더 */}
        <div className="hidden md:flex md:items-center md:justify-between">
          {/* 왼쪽: 카테고리 버튼 */}
          <button
            onClick={toggleCategory}
            className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="카테고리 메뉴"
          >
            <FiMenu className="h-7 w-7 text-gray-700 dark:text-gray-300" />
          </button>

          {/* 중앙: 메인 네비게이션 */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mr-16"
            >
              Home
            </Link>
            
            <Link
              href="/about"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mr-16"
            >
              About
            </Link>
            
            {/* 로고 */}
            <Link href="/" className="flex items-center mx-10">
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
              href="/archive"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-16 mr-10"
            >
              Archive
            </Link>
            
            <Link
              href="/latest"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Latest
            </Link>
          </div>

          {/* 오른쪽: 로그인 버튼과 다크모드 토글 */}
          <div className="flex items-center space-x-4">
            {/* 다크모드 토글 버튼 */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
              >
                {theme === "dark" ? (
                  <FiSun className="h-6 w-6 text-gray-300" />
                ) : (
                  <FiMoon className="h-6 w-6 text-gray-700" />
                )}
              </button>
            )}
            
            {/* 로그인 버튼 */}
            <Link
              href="/login"
              className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <span>Login</span>
            </Link>
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

          {/* 오른쪽: 모바일 메뉴 버튼 */}
          <div className="flex items-center">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
              >
                {theme === "dark" ? (
                  <FiSun className="h-6 w-6 text-gray-300" />
                ) : (
                  <FiMoon className="h-6 w-6 text-gray-700" />
                )}
              </button>
            )}
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
      </div>

      {/* 카테고리 메뉴 (미구현 상태) */}
      {isCategoryOpen && (
        <div className="absolute left-0 w-72 bg-white dark:bg-gray-800 shadow-lg rounded-br-md p-6 transition-all">
          <p className="text-gray-500 dark:text-gray-400 text-base">
            카테고리 메뉴는 아직 구현되지 않았습니다.
          </p>
        </div>
      )}

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
              href="/archive"
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
            
            {/* 로그인 링크 */}
            <Link
              href="/login"
              className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Login</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
