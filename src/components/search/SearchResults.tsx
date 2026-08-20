"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PostData } from "@/components/ui/PostCard";
import PostListGrid from "@/components/ui/PostListGrid";
import TagsOverview from "@/components/ui/TagsOverview";
import { extractUniqueTagsFromPosts } from "@/utils/tag/tagUtils";
import { FiSearch } from "react-icons/fi";
import Link from "next/link";
import { Category } from "@/types/models";

const CHIP_BASE = "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors";
const CHIP_IDLE =
  "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 " +
  "hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-200";
const CHIP_ACTIVE =
  "border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900";

export interface CategoryWithCount extends Category {
  postCount: number;
}

interface SearchResultsProps {
  initialPosts: PostData[];
  /** Archive 상단 카테고리 탭 — 글이 있는 카테고리만 넘어온다. */
  categories: CategoryWithCount[];
}

export default function SearchResults({ initialPosts, categories }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("q") || "";
  const searchType = searchParams?.get("type") || "title"; // 기본값: title 검색
  const activeCategory = searchParams?.get("category") || ""; // Archive 카테고리 탭
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [visiblePosts, setVisiblePosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const postsPerPage = 30; // 30개로 변경
  
  // 태그 목록 추출 (tags 모드일 때 사용)
  const allTags = extractUniqueTagsFromPosts(initialPosts);
  
  // 검색어·카테고리 변경시 포스트 필터링
  useEffect(() => {
    const byCategory = activeCategory
      ? initialPosts.filter((post) => post.category?.slug === activeCategory)
      : initialPosts;

    if (!searchQuery) {
      setPosts(byCategory);
    } else {
      const filteredPosts = byCategory.filter((post) => {
        if (searchType === "tag") {
          // tag만 검색
          const tags = post.tags?.map(tag => tag.name.toLowerCase()).join(" ") || "";
          return tags.includes(searchQuery.toLowerCase());
        } else {
          // title만 검색 (기본값)
          const title = post.title?.toLowerCase() || "";
          return title.includes(searchQuery.toLowerCase());
        }
      });
      setPosts(filteredPosts);
    }
    setPage(1); // 조건이 바뀌면 첫 페이지부터
  }, [searchQuery, searchType, activeCategory, initialPosts]);
  
  // 페이지 변경시 보여줄 포스트 계산
  useEffect(() => {
    setVisiblePosts(posts.slice(0, page * postsPerPage));
  }, [posts, page, postsPerPage]);
  
  // 무한 스크롤 구현
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (visiblePosts.length < posts.length) {
          setPage(prevPage => prevPage + 1);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visiblePosts, posts]);
  
  // 로딩 버튼 클릭 이벤트
  const loadMorePosts = () => {
    setPage(prevPage => prevPage + 1);
  };
  
  // 태그 관련 모드인지 확인 (태그 목록 표시 + 태그 검색 모두 포함)
  const isTagsMode = searchType === "tags" || (searchType === "tag" && searchQuery);
  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name;

  return (
    <>
      {/* 헤더 섹션 (태그 모드가 아닐 때만) */}
      {!isTagsMode && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-center">
            {searchQuery 
              ? `"${searchQuery}" ${searchType === "tag" ? "Tag" : "제목"} 검색 결과 (${posts.length})`
              : activeCategoryName || "Archive"}
          </h1>
          
          {!searchQuery && (
            <p className="text-lg text-gray-500 dark:text-gray-400 text-center mb-6">
              {activeCategoryName
                ? `${activeCategoryName} 카테고리의 글 ${posts.length}편`
                : "See all posts I have ever written."}
            </p>
          )}

          {/* 카테고리 탭 — Archive는 카테고리로 관리한다 (태그는 Tags 페이지에서) */}
          {categories.length > 0 && (
            <nav aria-label="카테고리" className="flex flex-wrap justify-center gap-2 mb-2">
              <Link
                href="/search"
                aria-current={activeCategory === "" ? "page" : undefined}
                className={`${CHIP_BASE} ${activeCategory === "" ? CHIP_ACTIVE : CHIP_IDLE}`}
              >
                전체
                <span className="ml-1.5 text-xs opacity-70">{initialPosts.length}</span>
              </Link>
              {categories.map((category) => {
                const isActive = activeCategory === category.slug;
                return (
                  <Link
                    key={category.id}
                    href={isActive ? "/search" : `/search?category=${category.slug}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`${CHIP_BASE} ${isActive ? CHIP_ACTIVE : CHIP_IDLE}`}
                  >
                    {category.name}
                    <span className="ml-1.5 text-xs opacity-70">{category.postCount}</span>
                  </Link>
                );
              })}
            </nav>
          )}
          
          {searchQuery && posts.length === 0 && (
            <div className="text-center mt-12">
              <div className="mx-auto w-24 h-24 mb-4 text-gray-400">
                <FiSearch className="w-full h-full" />
              </div>
              <h2 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h2>
              <p className="text-gray-600 dark:text-gray-400">
                다른 검색어로 다시 시도해 보세요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 태그 목록 (tags 모드일 때만) */}
      {isTagsMode && (
        <>
          <TagsOverview tags={allTags} />
          <div className="border-t border-gray-200 dark:border-gray-700 mb-8"></div>
        </>
      )}
      
      {/* 포스트 목록 */}
      <PostListGrid 
        posts={visiblePosts}
        emptyMessage={!searchQuery && !isTagsMode ? "포스트가 없습니다." : ""}
      />
      
      {visiblePosts.length < posts.length && (
        <div className="mt-12 text-center">
          <button 
            onClick={loadMorePosts}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            더 보기 ({visiblePosts.length}/{posts.length})
          </button>
        </div>
      )}
    </>
  );
} 