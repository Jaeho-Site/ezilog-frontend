import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
import { FiHome, FiCalendar} from "react-icons/fi";
import { getTagColor } from "@/utils/tag/tagColors";
import * as fs from 'fs';
import * as path from 'path';

// 정적 페이지 생성 설정
export const dynamic = 'force-static';
const GiscusComments = lazy(() => import('@/components/ui/comments'));

// 정적 포스트 데이터 로드 함수 (빌드 시간 최적화)
async function loadStaticPosts() {
  try {
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      return postsData;
    }
  } catch (error) {
    console.warn('[loadStaticPosts] Failed to load static data');
  }
  return [];
}

// 빌드 시 정적으로 생성할 경로 정의
export async function generateStaticParams() {
  // 정적 데이터 우선 사용
  let posts = await loadStaticPosts();
  
  // 정적 데이터가 없는 경우에만 API 호출
  if (posts.length === 0) {
    posts = await getAllPosts(100, 0);
  }

  return posts.map((post: { slug: string }) => ({
    slug: post.slug
  }));
}

// SEO 메타데이터 생성 (API 호출 최소화)
export async function generateMetadata(
  { params }: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const canonicalUrl = `${siteUrl}/post/${slug}`;
  
  // 정적 데이터에서 먼저 찾기
  const staticPosts = await loadStaticPosts();
  const staticPost = staticPosts.find((post: any) => post.slug === slug);
  
  if (staticPost) {
    const imageUrl = staticPost.coverImage?.url || `${siteUrl}/og-image.png`;
    const tagNames = staticPost.tags?.map((tag: any) => tag.name) || [];
    
    // 🎯 SEO 키워드 최적화 (5-8개 핵심 키워드)
    const coreKeywords = ['개발', '프로그래밍', 'EziLog','웹 개발'];
    const keywords = [...coreKeywords, ...tagNames.slice(0, 5)]; // 최대 8개
    
    return {
      title: `${staticPost.title} | EziLog`,
      description: staticPost.description || `${staticPost.title}에 대한 개발 포스트입니다. EziLog에서 최신 기술 정보를 확인하세요.`,
      keywords,
      authors: [{ name: 'EziLog' }],
      creator: 'EziLog',
      publisher: 'EziLog',
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: staticPost.title,
        description: staticPost.description || `${staticPost.title}에 대한 개발 포스트입니다.`,
        url: canonicalUrl,
        siteName: 'EziLog',
        type: 'article',
        locale: 'ko_KR',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: staticPost.title,
          },
        ],
        publishedTime: staticPost.publishedDate,
        authors: ['EziLog'],
        tags: tagNames,
      },
      twitter: {
        card: 'summary_large_image',
        title: staticPost.title,
        description: staticPost.description || `${staticPost.title}에 대한 개발 포스트입니다.`,
        images: [imageUrl],
        creator: '@EziLog',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  }

  // 정적 데이터에 없는 경우에만 API 호출 (새 포스트)
  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return { 
        title: '게시물을 찾을 수 없습니다 | EziLog',
        alternates: { canonical: canonicalUrl },
        robots: { index: false, follow: true },
      };
    }

    const imageUrl = post.coverImage?.url || `${siteUrl}/og-image.png`;
    const tagNames = post.tags?.map((tag: any) => tag.name) || [];
    
    // 🎯 SEO 키워드 최적화 (5-8개 핵심 키워드)
    const coreKeywords = ['개발', '프로그래밍', 'EziLog'];
    const keywords = [...coreKeywords, ...tagNames.slice(0, 5)]; // 최대 8개

    return {
      title: `${post.title} | EziLog`,
      description: post.description || `${post.title}에 대한 개발 포스트입니다. EziLog에서 최신 기술 정보를 확인하세요.`,
      keywords,
      authors: [{ name: 'EziLog' }],
      creator: 'EziLog',
      publisher: 'EziLog',
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: post.title,
        description: post.description || `${post.title}에 대한 개발 포스트입니다.`,
        url: canonicalUrl,
        siteName: 'EziLog',
        type: 'article',
        locale: 'ko_KR',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        publishedTime: post.publishedDate,
        authors: ['EziLog'],
        tags: tagNames,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description || `${post.title}에 대한 개발 포스트입니다.`,
        images: [imageUrl],
        creator: '@EziLog',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  } catch (error) {
    return { 
      title: '게시물을 찾을 수 없습니다 | EziLog',
      alternates: { canonical: canonicalUrl },
      robots: { index: false, follow: true },
    };
  }
}

// 포스트 페이지 컴포넌트
export default async function PostPage({ params }: any) {
  // 포스트 데이터 가져오기
  const slug = params.slug;
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

        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-200 text-center leading-relaxed break-words max-w-4xl mx-auto" style={{ textWrap: 'balance' }}>{post.title}</h2>

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
              <div className="prose prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-loose">
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

      {/* 이전/다음 포스트 네비게이션 섹션 */}
      {(prevPost || nextPost) && (
        <section className="max-w-[1088px] mx-auto mb-12">
          {/* 네비게이션 컨테이너 */}
          <div className="bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            {/* 섹션 헤더 */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-serif font-light text-emerald-700 dark:text-emerald-400 text-center">
                🌿 다음 글도 궁금하신가요?
              </h2>
              <div className="w-16 h-0.5 bg-emerald-700 dark:bg-emerald-400 rounded-full mx-auto mt-2"></div>
            </div>

            {/* 네비게이션 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 이전 포스트 */}
              <div className="flex justify-start">
                {prevPost ? (
                  <PostNavigationCard
                    post={prevPost}
                    href={`/post/${Number(slug) - 1}`}
                    direction="prev"
                  />
                ) : (
                  <div className="w-full md:max-w-md"></div>
                )}
              </div>

              {/* 다음 포스트 */}
              <div className="flex justify-end">
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
          </div>
        </section>
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
