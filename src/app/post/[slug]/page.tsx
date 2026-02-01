import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/api";
import { lazy, Suspense } from 'react';
import {
  HtmlContent,
  MarkdownContent,
  formatDate
} from "@/utils/content";
import TableOfContents from "@/components/ui/TableOfContents";
import PostNavigationCard from "@/components/ui/PostNavigationCard";
import { FiHome, FiCalendar} from "react-icons/fi";
import { getTagColor } from "@/utils/tag/tagColors";
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-static';
const GiscusComments = lazy(() => import('@/components/ui/comments'));

async function loadStaticPosts() {
  try {
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const data = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      return Array.isArray(data) ? data : data.posts;
    }
  } catch (error) {
  }
  return [];
}

export async function generateStaticParams() {
  let posts = await loadStaticPosts();
  if (posts.length === 0) {
    posts = await getAllPosts(100, 0);
  }
  return posts.map((post: { slug: string }) => ({
    slug: post.slug
  }));
}

export async function generateMetadata(
  { params }: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const canonicalUrl = `${siteUrl}/post/${slug}`;

  const staticPosts = await loadStaticPosts();
  const staticPost = staticPosts.find((post: any) => post.slug === slug);
  
  if (staticPost) {
    const imageUrl = staticPost.coverImage?.url || `${siteUrl}/og-image.png`;
    const tagNames = staticPost.tags?.map((tag: any) => tag.name) || [];
    const publishedDate = staticPost.PublishedDate || staticPost.publishedAt;

    const coreKeywords = ['개발', '프로그래밍', 'EziLog','웹 개발'];
    const keywords = [...coreKeywords, ...tagNames.slice(0, 5)];
    
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
        publishedTime: publishedDate,
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

    const coreKeywords = ['개발', '프로그래밍', 'EziLog'];
    const keywords = [...coreKeywords, ...tagNames.slice(0, 5)];

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

export default async function PostPage({ params }: any) {
  const slug = params.slug;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const [prevPost, nextPost] = await getRelatedPosts(slug);

  const htmlContent = post.html || post.htmlContent || '';
  const markdownContent = post.markdown || post.markdownContent || '';

  let coverImageUrl = '';
  if (post.coverImage && post.coverImage.url) {
    coverImageUrl = post.coverImage.url || '';
  } else if (post.attributes?.cover?.url) {
    coverImageUrl = post.attributes.cover.url || '';
  }

  const tags = post.tags?.length > 0 ? post.tags : (post.attributes?.tags || []);

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
      <div className="max-w-[1152px] mx-auto mb-12">
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

      <div className="border-t border-gray-200 dark:border-gray-700 mt-8 max-w-[1152px] mx-auto"></div>

      <div className="lg:flex lg:gap-8 mb-12 lg:justify-center lg:max-w-[1152px] lg:mx-auto">
        <main className="lg:flex-1 lg:max-w-[800px]">
          <article className="bg-gray-50 dark:bg-gray-950 overflow-hidden">
            <div className="py-6 pl-6 pr-3 lg:pr-2">
              <div className="prose prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-loose">
                {contentElement}
              </div>
            </div>
          </article>
        </main>

        <aside className="lg:w-80 lg:shrink-0 lg:mt-12">
          <div className="lg:sticky lg:top-12 lg:h-fit">
            <TableOfContents />
          </div>
        </aside>
      </div>

      {(prevPost || nextPost) && (
        <section className="max-w-[1088px] mx-auto mb-12">
          <div className="bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-serif font-light text-emerald-700 dark:text-emerald-400 text-center">
                🌿 다음 글도 궁금하신가요?
              </h2>
              <div className="w-16 h-0.5 bg-emerald-700 dark:bg-emerald-400 rounded-full mx-auto mt-2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="max-w-[1088px] mx-auto">
        <Suspense fallback={<div className="text-center py-4">댓글을 불러오는 중...</div>}>
          <GiscusComments />
        </Suspense>
      </div>
    </div>
  );
}
