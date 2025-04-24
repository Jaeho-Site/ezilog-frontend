import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug } from "@/lib/api";
import parse, { Element, domToReact } from 'html-react-parser';
import ReactMarkdown from 'react-markdown';

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
      try {
        return url.replace(
          /https:\/\/jaehomade-ezilog\.s3\.ap-northeast-2\.amazonaws\.com/g,
          CLOUDFRONT_DOMAIN.replace(/\/$/, '')
        );
      } catch (error) {
        return url;
      }
    }
    return url;
  }
  
  // 상대 경로인 경우(/로 시작하는 경우) 그대로 사용
  if (url.startsWith('/')) {
    return url;
  }
  
  // 그 외의 경우 CDN URL과 결합
  return `${process.env.NEXT_PUBLIC_CDN_URL || ''}/${url}`;
};

// SEO 메타데이터 생성
export async function generateMetadata(
  { params }: PostPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: '게시물을 찾을 수 없습니다',
    };
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
export default async function PostPage({ params }: PostPageProps) {
  console.log('포스트 페이지 렌더링 시작: slug =', params.slug);
  
  // getPostBySlug 함수를 사용하여 포스트 데이터 가져오기
  const post = await getPostBySlug(params.slug);
  
  // 데이터가 없으면 404 페이지 표시
  if (!post) {
    console.log('포스트를 찾을 수 없음:', params.slug);
    notFound();
  }
  
  // 포스트 데이터 콘솔에 출력
  console.log('포스트 페이지에서 받은 데이터:', {
    id: post.id,
    title: post.title,
    slug: post.slug,
    hasHtml: !!post.html,
    hasMarkdown: !!post.markdown,
    hasImage: !!post.coverImage,
    tagCount: post.tags?.length || 0
  });
  
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
  const markdownContent = post.markdown || post.markdownContent || '';
  
  // HTML 파싱 옵션
  const parseOptions = {
    replace: (domNode: any) => {
      if (domNode instanceof Element && domNode.name === 'img' && domNode.attribs?.src) {
        const src = getImageUrl(domNode.attribs.src);
        const alt = domNode.attribs.alt || post.title || '이미지';
        
        return (
          <div className="relative w-full my-4" style={{ height: '400px' }}>
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              className="object-contain"
              loading="lazy"
            />
          </div>
        );
      }
      
      // a 태그 처리 (외부 링크는 새 탭에서 열기)
      if (domNode instanceof Element && domNode.name === 'a' && domNode.attribs?.href) {
        const href = domNode.attribs.href;
        const isExternal = href.startsWith('http');
        
        const props = isExternal ? { 
          target: "_blank", 
          rel: "noopener noreferrer" 
        } : {};
        
        return (
          <Link
            href={href}
            {...props} 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {domToReact(domNode.children as any)}
          </Link>
        );
      }
      
      return undefined;
    }
  };
  
  // 이미지 URL 가져오기 (cover 또는 coverImage)
  let coverImageUrl = '';
  if (post.coverImage && post.coverImage.url) {
    coverImageUrl = getImageUrl(post.coverImage.url);
  } else if (post.attributes?.cover?.url) {
    coverImageUrl = getImageUrl(post.attributes.cover.url);
  }
  
  // 태그 목록 가져오기
  const tags = post.tags?.length > 0 
    ? post.tags 
    : (post.attributes?.tags || []);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          ← 홈으로 돌아가기
        </Link>
      </div>
      
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* 커버 이미지 */}
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
          {/* 제목 */}
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          {/* 날짜 */}
          {post.publishedDate && (
            <div className="text-gray-500 mb-6">
              {formatDate(post.publishedDate)}
            </div>
          )}
          
          {/* 태그 */}
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
          
          {/* 콘텐츠 */}
          <div className="mt-6 prose prose-lg max-w-none dark:prose-invert
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
            prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
            prose-p:my-4 prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-em:italic prose-em:text-gray-700 dark:prose-em:text-gray-300
            prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
            prose-li:my-2">
            {/* HTML 콘텐츠 렌더링 */}
            {htmlContent && (
              <div className="ck-content">
                {parse(htmlContent, parseOptions)}
              </div>
            )}
            
            {/* Markdown 콘텐츠 렌더링 */}
            {!htmlContent && markdownContent && (
              <ReactMarkdown
                components={{
                  p: ({ node, children, ...props }: any) => {
                    // 자식 요소 중 이미지가 있는지 확인
                    const hasImage = (node?.children || []).some(
                      (child: any) => child.tagName === 'img'
                    );
                    
                    if (hasImage) {
                      return <div {...props}>{children}</div>;
                    }
                    
                    return <p {...props}>{children}</p>;
                  },
                  img: ({ src, alt, ...props }: any) => {
                    if (!src) return null;
                    const imgSrc = getImageUrl(src as string);
                    return (
                      <span className="block relative w-full my-4" style={{ height: '400px' }}>
                        <Image
                          src={imgSrc} 
                          alt={alt || post.title || '이미지'} 
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                          className="object-contain" 
                          loading="lazy"
                          {...props} 
                        />
                      </span>
                    );
                  },
                  a: ({ node, href, children, ...props }: any) => {
                    if (!href) return null;
                    const isExternal = href.startsWith('http');
                    const linkProps = isExternal ? { 
                      target: "_blank", 
                      rel: "noopener noreferrer" 
                    } : {};
                    
                    return (
                      <Link
                        href={href} 
                        {...linkProps} 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" 
                        {...props}
                      >
                        {children}
                      </Link>
                    );
                  },
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            )}
            
            {/* 콘텐츠가 없는 경우 */}
            {!htmlContent && !markdownContent && (
              <div className="text-center py-8 text-gray-500">
                <p>이 포스트에는 내용이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </article>
      
      {/* 개발용 디버그 정보 */}
      <div className="mt-10 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-2">서버 응답 데이터 구조</h2>
        <div className="overflow-auto max-h-96">
          <pre className="text-xs">{JSON.stringify(post, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
