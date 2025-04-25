import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug } from "@/lib/api";
import parse, { Element, domToReact, HTMLReactParserOptions } from 'html-react-parser';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import React from 'react';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

// 포스트 페이지 속성 타입
interface PostPageProps {
  params: {
    slug: string;
  };
}

// 이미지 URL 최적화 함수
const getImageUrl = (url: string) => {
  if (!url) return '';
  
  // CloudFront 도메인
  const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || '';
  
  // 이미 http나 https로 시작하는 완전한 URL인 경우
  if (url.startsWith('http')) {
    // S3 URL을 CloudFront URL로 변환
    if (url.includes('amazonaws.com')) {
      return url.replace(
        /https:\/\/jaehomade-ezilog\.s3\.ap-northeast-2\.amazonaws\.com/g,
        CLOUDFRONT_DOMAIN.replace(/\/$/, '')
      );
    }
    return url;
  }
  
  // 상대 경로인 경우 그대로 사용
  if (url.startsWith('/')) return url;
  
  // 그 외의 경우 CDN URL과 결합
  return `${process.env.NEXT_PUBLIC_CDN_URL || ''}/${url}`;
};

// 공통 렌더링 컴포넌트
// 이미지 렌더링 컴포넌트
const RenderImage = ({ src, alt = '이미지' }: { src: string; alt?: string }) => {
  const imageSrc = getImageUrl(src);
  return (
    <div className="relative w-full my-4" style={{ height: '400px' }}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        className="object-contain"
        loading="lazy"
      />
    </div>
  );
};

// 링크 렌더링 컴포넌트
const RenderLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  if (!href) return <>{children}</>;
  
  const isExternal = href.startsWith('http');
  const linkProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
  
  return (
    <Link
      href={href}
      {...linkProps} 
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
    >
      {children}
    </Link>
  );
};

// 코드 블록 렌더링 컴포넌트
const RenderCodeBlock = ({ language = '', children }: { language?: string; children: string }) => {
  // p 태그 내부에서 렌더링되는 경우를 방지하기 위해 span 태그 사용
  return (
    <span className="block my-4 overflow-hidden rounded-md">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        PreTag="div"
        className="bg-gray-800 rounded-md"
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </span>
  );
};

// SEO 메타데이터 생성
export async function generateMetadata(
  { params }: PostPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
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

// HTML 콘텐츠 파서
const HtmlContent = ({ html, postTitle }: { html: string; postTitle: string }) => {
  const parseOptions: HTMLReactParserOptions = {
    replace: (domNode: any) => {
      // 이미지 처리
      if (domNode instanceof Element && domNode.name === 'img' && domNode.attribs?.src) {
        return <RenderImage 
          src={domNode.attribs.src} 
          alt={domNode.attribs.alt || postTitle} 
        />;
      }
      
      // p > img 처리 (단순화)
      if (domNode instanceof Element && domNode.name === 'p') {
        const imageElements = domNode.children.filter((child: any) => 
          child instanceof Element && child.name === 'img'
        );
        
        // p 태그에 이미지만 있는 경우
        if (imageElements.length === 1 && domNode.children.length === 1) {
          const imageElement = imageElements[0] as Element;
          if (imageElement.attribs?.src) {
            return <RenderImage 
              src={imageElement.attribs.src}
              alt={imageElement.attribs.alt || postTitle}
            />;
          }
        }
      }
      
      // 링크 처리
      if (domNode instanceof Element && domNode.name === 'a' && domNode.attribs?.href) {
        return (
          <RenderLink href={domNode.attribs.href}>
            {domToReact(domNode.children as any)}
          </RenderLink>
        );
      }
      
      return undefined;
    }
  };
  
  return <div className="ck-content">{parse(html, parseOptions)}</div>;
};

// 마크다운 컴포넌트
const MarkdownContent = ({ markdown, postTitle }: { markdown: string; postTitle: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSlug, rehypeSanitize]}
      components={{
        // 헤딩 태그 처리
        h1: ({ ...props }: any) => <h1 className="text-2xl font-bold mt-8 mb-4" {...props} />,
        h2: ({ ...props }: any) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
        h3: ({ ...props }: any) => <h3 className="text-lg font-bold mt-5 mb-2" {...props} />,
        h4: ({ ...props }: any) => <h4 className="text-base font-bold mt-4 mb-2" {...props} />,
        h5: ({ ...props }: any) => <h5 className="text-sm font-bold mt-3 mb-1" {...props} />,
        h6: ({ ...props }: any) => <h6 className="text-xs font-bold mt-3 mb-1" {...props} />,
        
        // 문단 처리
        p: ({ children, ...props }: any) => {
          const childElements = React.Children.toArray(children);
          
          // 코드 블록이 있는 경우 Fragment 반환
          const hasCodeBlock = childElements.some(
            child => React.isValidElement(child) && 
              typeof (child.props as any)?.node?.tagName === 'string' && 
              (child.props as any).node.tagName === 'code' && 
              !(child.props as any).inline
          );
          
          if (hasCodeBlock) return <>{children}</>;
          
          // 이미지 확인
          const hasImage = childElements.some(
            child => React.isValidElement(child) && child.type === 'img'
          );
          
          return hasImage ? <div {...props}>{children}</div> : <p {...props}>{children}</p>;
        },
        
        // 이미지 처리
        img: ({ src, alt, ...props }: any) => {
          if (!src) return null;
          return <RenderImage src={src} alt={alt || postTitle} />;
        },
        
        // 링크 처리
        a: ({ href, children, ...props }: any) => {
          return <RenderLink href={href || ''}>{children}</RenderLink>;
        },
        
        // 코드 블록 처리
        code: ({ inline, className, children, ...props }: any) => {
          // 인라인 코드인 경우
          if (inline) {
            return (
              <code 
                className="px-1 py-0.5 mx-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono" 
                {...props}
              >
                {children}
              </code>
            );
          }
          
          // 코드 블록일 경우 언어 감지
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          // div가 p 태그 안에 들어가지 않도록 React.Fragment로 감싸기
          return (
            <>{/* p 태그 하이드레이션 오류 방지를 위한 Fragment */}
              <RenderCodeBlock language={language}>{String(children)}</RenderCodeBlock>
            </>
          );
        },
        
        // 표 처리
        table: ({ children, ...props }: any) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-gray-300 dark:border-gray-700" {...props}>
              {children}
            </table>
          </div>
        ),
        th: ({ children, ...props }: any) => (
          <th 
            className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold border border-gray-300 dark:border-gray-700"
            {...props}
          >
            {children}
          </th>
        ),
        td: ({ children, ...props }: any) => (
          <td 
            className="px-4 py-2 border border-gray-300 dark:border-gray-700"
            {...props}
          >
            {children}
          </td>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
};

// 포스트 페이지 컴포넌트
export default async function PostPage({ params }: PostPageProps) {
  // 포스트 데이터 가져오기
  const post = await getPostBySlug(params.slug);
  
  // 데이터가 없으면 404 페이지 표시
  if (!post) notFound();
  
  // 날짜 형식 변환
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };
  
  // 콘텐츠 타입 결정
  const htmlContent = post.html || post.htmlContent || '';
  let markdownContent = post.markdown || post.markdownContent || '';
  
  // 마크다운 이미지 URL 변환
  if (markdownContent) {
    const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || '';
    markdownContent = markdownContent.replace(
      /!\[(.*?)\]\((https:\/\/jaehomade-ezilog\.s3\.ap-northeast-2\.amazonaws\.com\/[^)]+)\)/g,
      (_: string, alt: string, url: string) => {
        const cloudFrontUrl = url.replace(
          /https:\/\/jaehomade-ezilog\.s3\.ap-northeast-2\.amazonaws\.com/g,
          CLOUDFRONT_DOMAIN.replace(/\/$/, '')
        );
        return `![${alt}](${cloudFrontUrl})`;
      }
    );
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          ← 홈으로 돌아가기
        </Link>
      </div>
      
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {coverImageUrl && (
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            <Image
              src={coverImageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          {post.publishedDate && (
            <div className="text-gray-500 mb-6">
              {formatDate(post.publishedDate)}
            </div>
          )}
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag: any) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
          
          <div className="mt-6 prose prose-lg max-w-none dark:prose-invert
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
    </div>
  );
}
