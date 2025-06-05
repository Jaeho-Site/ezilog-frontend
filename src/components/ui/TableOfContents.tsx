'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

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

  if (tocItems.length === 0) return null;

  return (
    <div className="hidden lg:block">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-h-[calc(100vh-64px)] overflow-y-auto shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          목차
        </h3>
        <nav>
          <ul className="mt-2 flex flex-col items-start justify-start text-sm space-y-0.5">
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
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent border-l-2 border-blue-500 pl-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-r'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:drop-shadow-sm dark:hover:drop-shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded'
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
                      <span className="mr-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      </span>
                    )}
                    
                    {/* h3 항목에 작은 화살표 표시 */}
                    {item.level === 3 && (
                      <svg
                        width="3"
                        height="24"
                        viewBox="0 -9 3 24"
                        className="mr-2 overflow-visible text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
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
    </div>
  );
} 