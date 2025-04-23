"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { FiMenu, FiMoon, FiSun, FiLogIn, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { getTopLevelCategories } from "@/lib/api";

// Category 타입 정의
interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  level: number;
  childCategories?: Category[];
  children?: Category[];
}

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // 카테고리 메뉴가 열릴 때 카테고리 데이터 로드
  useEffect(() => {
    if (isCategoryOpen && categories.length === 0) {
      loadCategories();
    }
  }, [isCategoryOpen, categories.length]);

  // 카테고리 데이터 로드 함수
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getTopLevelCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('카테고리 로드 실패', err);
      setError('카테고리를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

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

  // 카테고리 확장/축소 토글 함수
  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // 카테고리 아이템 렌더링 함수
  const renderCategoryItem = (category: Category) => {
    const hasChildren = (category.childCategories?.length ?? 0) > 0;
    const isExpanded = expandedCategories[category.id];
    
    return (
      <div key={category.id} className="mb-2">
        <div className="flex items-center">
          {hasChildren ? (
            <button 
              onClick={() => toggleCategoryExpand(category.id)}
              className="p-1 mr-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={isExpanded ? "카테고리 접기" : "카테고리 펼치기"}
            >
              {isExpanded ? (
                <FiChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <FiChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-6">{/* 공간 유지를 위한 패딩 */}</div>
          )}
          <Link 
            href={`/category/${category.slug}`}
            className="flex-grow py-1 px-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium transition-colors"
            onClick={() => setIsCategoryOpen(false)}
          >
            {category.name}
          </Link>
        </div>
        
        {/* 확장된 상태이고 자식 카테고리가 있다면 자식 카테고리 렌더링 */}
        {isExpanded && hasChildren && (
          <div className="ml-6 mt-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
            {category.childCategories?.map(child => (
              <div key={child.id} className="py-1">
                <Link 
                  href={`/category/${child.slug}`}
                  className="block px-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => setIsCategoryOpen(false)}
                >
                  {child.name}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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

      {/* 카테고리 메뉴 */}
      {isCategoryOpen && (
        <div className="absolute left-0 w-72 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-br-md p-6 transition-all">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">카테고리</h2>
          
          {isLoading && (
            <div className="py-4 text-gray-500 dark:text-gray-400">
              카테고리를 불러오는 중...
            </div>
          )}
          
          {error && (
            <div className="py-4 text-red-500">
              {error}
            </div>
          )}
          
          {!isLoading && !error && categories.length === 0 && (
            <div className="py-4 text-gray-500 dark:text-gray-400">
              카테고리가 없습니다.
            </div>
          )}
          
          {!isLoading && !error && categories.length > 0 && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map(category => renderCategoryItem(category))}
            </div>
          )}
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
