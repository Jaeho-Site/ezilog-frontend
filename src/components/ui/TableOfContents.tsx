'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FiLink, FiArrowUp, FiMessageCircle, FiSun, FiMoon } from 'react-icons/fi';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // 마운트 상태 관리
  useEffect(() => {
    setMounted(true);
  }, []);

  // 목차 추출
  useEffect(() => {
    const headings = document.querySelectorAll('.prose h2, .prose h3');
    const items: TocItem[] = Array.from(headings).map((heading, index) => {
      // ID가 없으면 텍스트 기반으로 고유 ID 생성
      let id = heading.id;
      if (!id) {
        const text = heading.textContent || '';
        id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
        heading.id = id; // DOM에도 ID 추가
      }
      
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      };
    });
    
    // 빈 텍스트나 중복 ID 필터링
    const validItems = items.filter((item, index, arr) => 
      item.text.trim() && 
      item.id && 
      arr.findIndex(other => other.id === item.id) === index
    );
    
    setTocItems(validItems);
  }, []);

  // 스크롤 추적 (더 정확한 방식)
  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const headerOffset = 100; // 헤더 높이 고려
      
      // 모든 헤딩 요소의 위치 계산
      const headingPositions = tocItems.map(item => {
        const element = document.getElementById(item.id);
        return {
          id: item.id,
          offsetTop: element ? element.offsetTop : 0
        };
      }).filter(item => item.offsetTop > 0);

      // 현재 스크롤 위치에서 가장 가까운 헤딩 찾기
      let currentActiveId = '';
      
      for (let i = headingPositions.length - 1; i >= 0; i--) {
        if (scrollTop + headerOffset >= headingPositions[i].offsetTop) {
          currentActiveId = headingPositions[i].id;
          break;
        }
      }
      
      // 첫 번째 헤딩보다 위에 있으면 첫 번째 헤딩을 활성화
      if (!currentActiveId && headingPositions.length > 0) {
        currentActiveId = headingPositions[0].id;
      }

      setActiveId(currentActiveId);
    };

    // 초기 실행
    handleScroll();

    // 스크롤 이벤트 리스너 등록
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [tocItems]);

  // 기능 함수들
  const copyCurrentUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToComments = () => {
    // "댓글" h2 요소 찾기 (lazy loading과 무관하게 항상 존재)
    const commentsHeader = Array.from(document.querySelectorAll('h2')).find(h2 => 
      h2.textContent?.includes('Comments')
    );
    
    if (commentsHeader) {
      commentsHeader.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <div className="hidden lg:block">
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 max-h-[calc(100vh-64px)] overflow-y-auto shadow-sm flex flex-col">
        {/* 목차 섹션 */}
        <div className="p-4 pb-3 flex-1">
          <h3 className="text-sm font-black text-primary mb-3">
            On this page
          </h3>
          <nav>
            <ul className="flex flex-col items-start justify-start text-sm space-y-0">
              {tocItems.map((item, index) => {
                // 현재 h2 다음에 h3가 있는지 확인
                const hasSubItems = item.level === 2 && 
                  index < tocItems.length - 1 && 
                  tocItems[index + 1]?.level === 3;
                
                return (
                  <li key={`${item.id}-${index}`} className={item.level === 3 ? 'ml-4' : ''}>
                    <a
                      href={`#${item.id}`}
                      className={`
                        group flex items-center py-1 text-sm transition-all duration-300
                        ${
                          activeId === item.id
                            ? 'bg-gradient-to-r from-neutral-700 to-yellow-900 bg-clip-text font-black text-transparent dark:from-yellow-400 dark:to-yellow-600 border-l-2 border-blue-500 pl-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-r'
                            : 'text-secondary font-normal hover:text-primary hover:font-medium hover:drop-shadow-sm dark:hover:drop-shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700/30 rounded'
                        }
                      `}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(item.id);
                        if (element) {
                          const offsetTop = element.offsetTop - 80; // 헤더 여백 고려
                          window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                          });
                        }
                      }}
                    >
                      {hasSubItems && (
                        <span className="mr-2 text-tertiary group-hover:text-secondary transition-colors">
                        </span>
                      )}
                      
                      {/* h3 항목에 작은 화살표 표시 */}
                      {item.level === 3 && (
                        <svg
                          width="3"
                          height="24"
                          viewBox="0 -9 3 24"
                          className="mr-2 overflow-visible text-tertiary group-hover:text-secondary transition-colors"
                        >
                          <path
                            d="M0 0L3 3L0 6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                      
                      <span className="flex-1">{item.text}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* 구분선 */}
        <div className="border-t border-neutral-300 dark:border-neutral-600"></div>

        {/* 기능 섹션 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-200 dark:bg-neutral-700/20">
          {/* 왼쪽: URL 복사 버튼 */}
          <button
            onClick={copyCurrentUrl}
            className="relative p-2 rounded-md hover:bg-white dark:hover:bg-neutral-600 transition-colors group shadow-sm"
            aria-label="URL 복사"
          >
            <FiLink className="h-4 w-4 text-secondary group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
            {copySuccess && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                복사됨!
              </span>
            )}
          </button>

          {/* 오른쪽: 네비게이션 버튼들 */}
          <div className="flex items-center space-x-2">
            {/* 맨 위로 이동 버튼 */}
            <button
              onClick={scrollToTop}
              className="p-2 rounded-md hover:bg-white dark:hover:bg-neutral-600 transition-colors group shadow-sm"
              aria-label="맨 위로 이동"
            >
              <FiArrowUp className="h-4 w-4 text-secondary group-hover:text-green-600 group-hover:scale-110 transition-all duration-200" />
            </button>

            {/* 댓글로 이동 버튼 */}
            <button
              onClick={scrollToComments}
              className="p-2 rounded-md hover:bg-white dark:hover:bg-neutral-600 transition-colors group shadow-sm"
              aria-label="댓글로 이동"
            >
              <FiMessageCircle className="h-4 w-4 text-secondary group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-200 stroke-2" />
            </button>

            {/* 테마 토글 버튼 */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-white dark:hover:bg-neutral-600 transition-colors group shadow-sm"
              aria-label={mounted && resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {!mounted ? (
                <div className="w-4 h-4 bg-neutral-300 dark:bg-neutral-600 rounded animate-pulse" />
              ) : resolvedTheme === "dark" ? (
                <FiSun className="h-4 w-4 text-yellow-500 group-hover:text-yellow-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(234,179,8,0.6)] transition-all duration-200" />
              ) : (
                <FiMoon className="h-4 w-4 text-secondary group-hover:text-blue-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.5)] transition-all duration-200" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 