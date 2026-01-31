"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getTagColor } from "@/utils/tag/tagColors";

interface Tag {
  id: number | string;
  name: string;
  slug: string;
  count?: number;
}

interface TagsOverviewProps {
  tags: Tag[];
}

export default function TagsOverview({ tags }: TagsOverviewProps) {
  const searchParams = useSearchParams();
  const currentQuery = searchParams?.get("q") || "";
  const searchType = searchParams?.get("type") || "";

  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">사용 가능한 태그가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        모든 태그
      </h2>
      <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
        {tags.map((tag, index) => {
          const tagColor = getTagColor(tag.name);
          const isSelected = searchType === "tag" && currentQuery.toLowerCase() === tag.name.toLowerCase();
          
          return (
            <Link
              key={tag.id || `tag-${index}`}
              href={`/search?q=${encodeURIComponent(tag.name)}&type=tag`}
              className={`px-3 py-2 text-sm font-medium uppercase rounded-lg
                transition-all duration-200 hover:scale-105 hover:shadow-md tracking-wide
                ${isSelected 
                  ? `${tagColor.text} ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20` 
                  : `${tagColor.text} ${tagColor.hover}`
                }`}
            >
              {tag.name}
              {tag.count && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({tag.count})
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
} 