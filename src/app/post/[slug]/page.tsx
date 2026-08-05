import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { lazy, Suspense } from 'react';
import { getAllPosts, getPostBySlug, getAdjacentPosts } from "@/lib/content";
import { formatDate } from "@/utils/content";
import PostContent from "@/components/content/PostContent";
import TableOfContents from "@/components/ui/TableOfContents";
import PostNavigationCard from "@/components/ui/PostNavigationCard";
import { FiHome, FiCalendar } from "react-icons/fi";
import { getTagColor } from "@/utils/tag/tagColors";
import { generatePostMetadata, generatePostNotFoundMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig, getImageUrl, buildBlogPostingJsonLd, buildBreadcrumbJsonLd } from "@/lib/metadata/config";

export const dynamic = 'force-static';
const GiscusComments = lazy(() => import('@/components/ui/comments'));

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return generatePostNotFoundMetadata(slug);
  }

  return generatePostMetadata({
    title: post.title,
    description: post.description,
    slug: post.slug,
    coverImage: post.coverImage,
    publishedDate: post.publishedDate,
    tags: post.tags,
  });
}

export default async function PostPage({ params }: PageParams) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const [prevPost, nextPost] = getAdjacentPosts(slug);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <JsonLd data={buildBlogPostingJsonLd({
        title: post.title,
        description: post.description,
        slug: post.slug,
        imageUrl: getImageUrl(post.coverImage?.url || siteConfig.defaultImage),
        datePublished: post.publishedDate,
        dateModified: post.updatedAt,
        tags: post.tags.map((tag) => tag.name),
      })} />
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: '홈', path: '' },
        ...(post.category.slug !== 'uncategorized'
          ? [{ name: post.category.name, path: `/category/${post.category.slug}` }]
          : []),
        { name: post.title, path: `/post/${post.slug}` },
      ])} />
      <div className="max-w-[1152px] mx-auto mb-12">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-6">
            {post.tags.map((tag) => {
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

        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-200 text-center leading-relaxed break-words max-w-4xl mx-auto" style={{ textWrap: 'balance' }}>{post.title}</h1>

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
                <PostContent html={post.html} markdown={post.markdown} postTitle={post.title} />
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
                    href={`/post/${prevPost.slug}`}
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
                    href={`/post/${nextPost.slug}`}
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
