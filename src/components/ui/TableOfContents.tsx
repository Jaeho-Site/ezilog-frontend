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

  // 스크롤 추적
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -80% 0%',
        threshold: 0.1,
      }
    );

    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length === 0) return null;

  return (
    <div className="hidden lg:block">
      <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-h-[calc(100vh-64px)] overflow-y-auto shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          목차
        </h3>
        <nav>
          <ul className="space-y-1">
            {tocItems.map((item, index) => (
              <li key={`${item.id}-${index}`}>
                <a
                  href={`#${item.id}`}
                  className={`
                    block py-1 text-sm transition-colors duration-200
                    ${item.level === 3 ? 'ml-4' : ''}
                    ${
                      activeId === item.id
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
} 