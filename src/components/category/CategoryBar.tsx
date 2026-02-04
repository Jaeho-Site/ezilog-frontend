"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Category } from "@/types/models";

interface CategoryWithCount extends Category {
  postCount?: number;
}

interface CategoryData {
  buildTime: string;
  categories: CategoryWithCount[];
}

interface CategoryBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryBar = ({ isOpen, onClose }: CategoryBarProps) => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      loadCategories();
    }
  }, [isInitialized]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const timestamp = Date.now();
      const response = await fetch(`/data/categories.json?t=${timestamp}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('카테고리 데이터를 불러올 수 없습니다.');
      }
      
      const data: CategoryData = await response.json();
      const categories = Array.isArray(data) ? data : data.categories;
      
      setCategories(categories);
      setIsInitialized(true);

    } catch (error: unknown) {
      setError('카테고리를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryItem = (category: CategoryWithCount) => {
    return (
      <div key={category.id} className="py-2">
        <Link 
          href={`/category/${category.slug}`}
          className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium transition-colors"
          onClick={onClose}
        >
          {category.name}
          {category.postCount !== undefined && category.postCount > 0 && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              ({category.postCount})
            </span>
          )}
        </Link>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 w-64 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-br-md p-6 transition-all z-50">
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">카테고리</h2>
      
      {isLoading && !isInitialized && (
        <div className="py-4 text-gray-500 dark:text-gray-400">
          카테고리를 불러오는 중...
        </div>
      )}
      
      {error && (
        <div className="py-4 text-red-500">
          {error}
          <button 
            onClick={() => loadCategories()}
            className="ml-2 text-blue-500 hover:text-blue-700 underline"
          >
            다시 시도
          </button>
        </div>
      )}
      
      {!isLoading && !error && categories.length === 0 && isInitialized && (
        <div className="py-4 text-gray-500 dark:text-gray-400">
          카테고리가 없습니다.
        </div>
      )}
      
      {categories.length > 0 && (
        <div className="space-y-1">
          {categories.map(category => renderCategoryItem(category))}
        </div>
      )}
    </div>
  );
};

export default CategoryBar;
