"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
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
  categories?: Category[]; // Strapi API에서 반환하는 실제 자식 카테고리 필드
}

interface CategoryBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryBar = ({ isOpen, onClose }: CategoryBarProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 메뉴가 열릴 때 카테고리 데이터 로드
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      loadCategories();
    }
  }, [isOpen, categories.length]);

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

  // 카테고리 확장/축소 토글 함수
  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // 카테고리 아이템 렌더링 함수
  const renderCategoryItem = (category: Category) => {
    // Strapi API에서는 자식 카테고리가 categories 필드에 있음
    const hasChildren = (category.categories?.length ?? 0) > 0;
    const childCategories = category.categories || [];
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
            onClick={onClose}
          >
            {category.name}
          </Link>
        </div>
        
        {/* 확장된 상태이고 자식 카테고리가 있다면 자식 카테고리 렌더링 */}
        {isExpanded && hasChildren && (
          <div className="ml-6 mt-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
            {childCategories.map((child: Category) => (
              <div key={child.id} className="py-1">
                <Link 
                  href={`/category/${child.slug}`}
                  className="block px-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  onClick={onClose}
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

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 w-72 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-br-md p-6 transition-all z-50">
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
  );
};

export default CategoryBar;
