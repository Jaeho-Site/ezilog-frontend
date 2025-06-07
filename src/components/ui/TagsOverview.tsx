"use client";

import Link from "next/link";
import { getTagColor } from "@/utils/tagColors";

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
        {tags.map((tag) => {
          const tagColor = getTagColor(tag.name);
          return (
            <Link
              key={tag.id}
              href={`/about?q=${encodeURIComponent(tag.name)}&type=tag`}
              className={`px-3 py-2 text-sm font-medium uppercase rounded-lg
                ${tagColor.text} ${tagColor.hover} transition-all duration-200
                hover:scale-105 hover:shadow-md tracking-wide`}
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