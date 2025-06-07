"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onToggle?: () => void;
  expanded?: boolean;
  variant?: 'default' | 'compact'; // 새로운 prop: compact는 더 짧은 버전
}

// SearchBar의 내부 컴포넌트 (useSearchParams 사용)
function SearchBarInner({ 
  className = "", 
  placeholder = "검색어를 입력하세요...",
  onToggle,
  expanded = false,
  variant = 'default'
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // 현재 URL의 검색어 파라미터 가져오기
  const currentQuery = searchParams?.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  
  // expanded prop이 변경될 때 입력 필드에 포커스
  useEffect(() => {
    if (expanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [expanded]);

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // 검색어가 변경될 때마다 URL 업데이트
    const searchUrl = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
    router.replace(searchUrl);
  };

  // 검색 제출 핸들러
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 검색 페이지로 이동
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
    
    // 검색어 입력 후 모바일에서는 검색바 접기
    if (onToggle && window.innerWidth < 768) {
      onToggle();
    }
  };

  // 검색어 지우기
  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    router.replace("/search");
  };

  // 검색바 클릭 핸들러
  const handleSearchBarClick = () => {
    router.push("/search");
  };

  // 컴팩트 모드일 때의 너비 조정
  const inputWidthClass = variant === 'compact' 
    ? 'w-32 sm:w-40 md:w-48 lg:w-56' 
    : 'w-full';

  return (
    <form 
      onSubmit={handleSearchSubmit}
      className={`relative flex items-center ${className}`}
    >
      <div className="relative w-full">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onClick={handleSearchBarClick}
          placeholder={placeholder}
          className={`${inputWidthClass} h-10 pl-10 pr-10 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors cursor-pointer`}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FiSearch className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}

// Suspense로 감싼 메인 컴포넌트
export default function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={
      <div className={`relative flex items-center ${props.className || ""}`}>
        <div className="relative w-full">
          <input
            type="text"
            placeholder={props.placeholder || "검색어를 입력하세요..."}
            className={`${props.variant === 'compact' ? 'w-32 sm:w-40 md:w-48 lg:w-56' : 'w-full'} h-10 pl-10 pr-10 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors cursor-pointer`}
            disabled
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      </div>
    }>
      <SearchBarInner {...props} />
    </Suspense>
  );
} 