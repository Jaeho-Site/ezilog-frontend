import parse, { Element, domToReact, HTMLReactParserOptions } from 'html-react-parser';
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from './image';
import React from 'react';
import '@/styles/post-content.css';

// 이미지 렌더링 컴포넌트
export const RenderImage = ({ src, alt = '이미지' }: { src: string; alt?: string }) => {
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

export const RenderLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  if (!href) return <>{children}</>;
  
  const isExternal = href.startsWith('http');
  
  // 외부 링크는 일반 <a> 태그 사용
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {children}
      </a>
    );
  }
  
  // 내부 링크만 Next.js Link 컴포넌트 사용
  return (
    <Link
      href={href}
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
    >
      {children}
    </Link>
  );
};
// HTML 콘텐츠 파서
export const HtmlContent = ({ html, postTitle }: { html: string; postTitle: string }) => {
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
  
  return <div className="ck-content prose prose-base max-w-none dark:prose-invert text-gray-700 dark:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100">{parse(html, parseOptions)}</div>;
};
