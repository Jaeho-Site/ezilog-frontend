import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { RenderLink } from './html';
import { getImageUrl } from './image';
import Image from 'next/image';

// 마크다운 이미지 렌더링 컴포넌트
export const RenderMarkdownImage = ({ src, alt, postTitle }: { src: string; alt?: string; postTitle: string }) => {
  const imageSrc = getImageUrl(src);
  return (
    <div className="relative w-full my-6">
      <div className="relative min-h-[200px] max-h-[600px] w-full">
        <Image
          src={imageSrc}
          alt={alt || postTitle}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          className="object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
};

// 코드 블록 렌더링 컴포넌트
export const RenderCodeBlock = ({ language = '', children }: { language?: string; children: string }) => {
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

// 마크다운 컴포넌트
export const MarkdownContent = ({ markdown, postTitle }: { markdown: string; postTitle: string }) => {
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
          return <RenderMarkdownImage src={src} alt={alt} postTitle={postTitle} />;
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
