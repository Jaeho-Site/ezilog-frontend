import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getAllPosts } from "@/lib/api";
import { lazy, Suspense } from 'react';
import { 
  HtmlContent, 
  MarkdownContent, 
  getImageUrl, 
  transformMarkdownImageUrls, 
  formatDate 
} from "@/utils/content";
import TableOfContents from "@/components/ui/TableOfContents";

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
      {/* 제목 섹션 - 중앙 배치 */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white text-center">{post.title}</h1>
        
        <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-4 text-center">
          {post.publishedDate && (
            <div className="text-gray-500 dark:text-gray-400">
              {formatDate(post.publishedDate)}
            </div>
          )}
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {tags.map((tag: any) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* 구분선 */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8"></div>
      </div>
      
      {/* 본문 + 사이드바 섹션 */}
      <div className="lg:flex lg:gap-8 mb-12">
        {/* 메인 콘텐츠 */}
        <main className="lg:flex-1 lg:max-w-4xl">
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="prose prose-lg max-w-none dark:prose-invert
                prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
                prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                prose-p:my-4 prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-em:italic prose-em:text-gray-700 dark:prose-em:text-gray-300
                prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
                prose-li:my-2">
                {contentElement}
              </div>
            </div>
          </article>
        </main>
        
        {/* 사이드바 - 목차 */}
        <aside className="lg:w-72 lg:shrink-0">
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <TableOfContents />
          </div>
        </aside>
      </div>
      
      {/* 댓글 섹션 - 중앙 배치 */}
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<div className="text-center py-4">댓글을 불러오는 중...</div>}>
          <GiscusComments />
        </Suspense>
      </div>
    </div>
  );
}
