"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PostCard, { PostData } from "@/components/ui/PostCard";
import PostListGrid from "@/components/ui/PostListGrid";
import { FiSearch } from "react-icons/fi";

interface SearchResultsProps {
  initialPosts: PostData[];
}

export default function SearchResults({ initialPosts }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("q") || "";
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [visiblePosts, setVisiblePosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const postsPerPage = 6;
  
  // 검색어 변경시 포스트 필터링
  useEffect(() => {
    if (!searchQuery) {
      setPosts(initialPosts);
    } else {
      const filteredPosts = initialPosts.filter((post) => {
        const title = post.title?.toLowerCase() || "";
        const description = post.description?.toLowerCase() || "";
        const tags = post.tags?.map(tag => tag.name.toLowerCase()).join(" ") || "";
        const content = `${title} ${description} ${tags}`;
        
        return content.includes(searchQuery.toLowerCase());
      });
      setPosts(filteredPosts);
      setPage(1); // 검색어 변경시 페이지 초기화
    }
  }, [searchQuery, initialPosts]);
  
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
  
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center">
          {searchQuery 
            ? `"${searchQuery}" 검색 결과 (${posts.length})`
            : "Archive"}
        </h1>
        {!searchQuery && (
          <p className="text-lg text-gray-500 dark:text-gray-400 text-center mb-6">
            See all posts I have ever written.
          </p>
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
      
      <PostListGrid 
        posts={visiblePosts}
        emptyMessage={!searchQuery ? "포스트가 없습니다." : ""}
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