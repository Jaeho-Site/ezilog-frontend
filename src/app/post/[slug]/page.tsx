import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/api";
import { lazy, Suspense } from 'react';
import { 
  HtmlContent, 
  MarkdownContent, 
  getImageUrl, 
  transformMarkdownImageUrls, 
  formatDate 
} from "@/utils/content";
import TableOfContents from "@/components/ui/TableOfContents";
import PostNavigationCard from "@/components/ui/PostNavigationCard";
import { FiHome, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getTagColor } from "@/utils/tagColors";

// 정적 페이지 생성 설정
export const dynamic = 'force-static';
const GiscusComments = lazy(() => import('@/components/ui/comments'));

// 빌드 시 정적으로 생성할 경로 정의
export async function generateStaticParams() {
  const posts = await getAllPosts(100, 0); // 최대 100개 포스트 가져오기
  
  return posts.map((post: { slug: string }) => ({
    slug: post.slug
  }));
}

// 포스트 페이지 속성 타입
interface PostPageProps {
  params: {
    slug: string;
  };
}

// SEO 메타데이터 생성
export async function generateMetadata(
  { params }: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return { title: '게시물을 찾을 수 없습니다' };
  }
  
  return {
    title: `${post.title} | EziLog`,
    description: post.description || '',
    openGraph: {
      title: post.title,
      description: post.description || '',
      images: post.coverImage ? [{ url: post.coverImage.url }] : [],
    },
  };
}

// 포스트 페이지 컴포넌트
export default async function PostPage({ params }: any) {
  // 포스트 데이터 가져오기
  const slug = params.slug; // await 제거
  const post = await getPostBySlug(slug);
  
  // 데이터가 없으면 404 페이지 표시
  if (!post) notFound();
  
  // 관련 포스트 가져오기 (이전/다음)
  const [prevPost, nextPost] = await getRelatedPosts(slug);
  
  // 콘텐츠 타입 결정
  const htmlContent = post.html || post.htmlContent || '';
  let markdownContent = post.markdown || post.markdownContent || '';
  
  // 마크다운 이미지 URL 변환
  if (markdownContent) {
    markdownContent = transformMarkdownImageUrls(markdownContent);
  }
  
  // 이미지 URL
  let coverImageUrl = '';
  if (post.coverImage && post.coverImage.url) {
    coverImageUrl = getImageUrl(post.coverImage.url);
  } else if (post.attributes?.cover?.url) {
    coverImageUrl = getImageUrl(post.attributes.cover.url);
  }
  
  // 태그 목록
  const tags = post.tags?.length > 0 ? post.tags : (post.attributes?.tags || []);
  
  // 컨텐츠 렌더링
  let contentElement;
  if (htmlContent) {
    contentElement = <HtmlContent html={htmlContent} postTitle={post.title} />;
  } else if (markdownContent) {
    contentElement = <MarkdownContent markdown={markdownContent} postTitle={post.title} />;
  } else {
    contentElement = <div className="text-center py-8 text-gray-500"><p>이 포스트에는 내용이 없습니다.</p></div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* 제목 섹션 - 본문+사이드바 실제 너비(1088px)와 맞춤 */}
      <div className="max-w-[1088px] mx-auto mb-12">
        {/* 태그 */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-6">
            {tags.map((tag: any) => {
              const tagColor = getTagColor(tag.name);
              return (
                <Link
                  key={tag.id}
                  href={`/search?q=${encodeURIComponent(tag.name)}&type=tag`}
                  className={`px-1.5 py-0.5 text-sm font-medium uppercase 
                    ${tagColor.text} ${tagColor.hover} transition-colors rounded-sm tracking-wide`}
                >
                  {tag.name}
                </Link>
              );
            })}
          </div>
        )}
        
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-200 text-center">{post.title}</h1>
        
        {/* 메타 정보 (날짜 + 홈으로 가기) */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-2">
          {post.publishedDate && (
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 mr-1.5" />
              <time dateTime={post.publishedDate}>
                {formatDate(post.publishedDate)}
              </time>
            </div>
          )}
          <Link 
            href="/" 
            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiHome className="w-4 h-4 mr-1.5" />
            홈으로 돌아가기
          </Link>
        </div>
      </div> 
      
      {/* 구분선 - 본문+사이드바 실제 너비(1088px)와 맞춤 */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-8 max-w-[1088px] mx-auto"></div>

      {/* 본문 + 사이드바 섹션 - 실제 너비: 800px + 256px + 32px = 1088px */}
      <div className="lg:flex lg:gap-8 mb-12 lg:justify-center lg:max-w-[1088px] lg:mx-auto">
        {/* 메인 콘텐츠  lg:flex-1 lg:max-w-4xl    lg:max-w-[800px]*/}
        <main className="lg:flex-1 lg:max-w-[800px]">
          <article className="bg-gray-50 dark:bg-gray-950 overflow-hidden">
            <div className="py-6 pl-6 pr-3 lg:pr-2">
              <div className="prose prose-base max-w-none dark:prose-invert
                prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-200
                prose-p:text-gray-700 dark:prose-p:text-gray-400 prose-p:leading-loose
                prose-strong:text-gray-900 dark:prose-strong:text-gray-200">
                {contentElement}
              </div>
            </div>
          </article>
        </main>
        
        {/* 사이드바 - 목차 */}
        <aside className="lg:w-64 lg:shrink-0 lg:mt-12">
          <div className="lg:sticky lg:top-12 lg:h-fit">
            <TableOfContents />
          </div>
        </aside>
      </div>
      
      {/* 이전/다음 포스트 네비게이션 - 본문+사이드바 실제 너비(1088px)와 맞춤 */}
      {(prevPost || nextPost) && (
        <div className="max-w-[1088px] mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 이전 포스트 */}
            {prevPost ? (
              <PostNavigationCard
                post={prevPost}
                href={`/post/${Number(slug) - 1}`}
                direction="prev"
              />
            ) : (
              <div className="w-full md:max-w-md"></div>
            )}
            
            {/* 다음 포스트 */}
            {nextPost ? (
              <PostNavigationCard
                post={nextPost}
                href={`/post/${Number(slug) + 1}`}
                direction="next"
              />
            ) : (
              <div className="w-full md:max-w-md"></div>
            )}
          </div>
        </div>
      )}
      
      {/* 댓글 섹션 - 본문+사이드바 실제 너비(1088px)와 맞춤 */}
      <div className="max-w-[1088px] mx-auto">
        <Suspense fallback={<div className="text-center py-4">댓글을 불러오는 중...</div>}>
          <GiscusComments />
        </Suspense>
      </div>
    </div>
  );
}
