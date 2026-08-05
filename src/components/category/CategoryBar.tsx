"use client";

import Link from "next/link";
import { Category } from "@/types/models";

export interface CategoryWithCount extends Category {
  postCount?: number;
}

interface CategoryBarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryWithCount[];
}

// 카테고리는 빌드 타임에 확정되는 데이터 — 서버 레이아웃에서 props로 주입받는다.
// (기존: 클라이언트에서 /data/categories.json 을 cache: no-store 로 재요청)
const CategoryBar = ({ isOpen, onClose, categories }: CategoryBarProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 w-64 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-br-md p-6 transition-all z-50">
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">카테고리</h2>

      {categories.length === 0 ? (
        <div className="py-4 text-gray-500 dark:text-gray-400">카테고리가 없습니다.</div>
      ) : (
        <div className="space-y-1">
          {categories.map((category) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryBar;
