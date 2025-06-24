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
      // 헤딩 태그 처리 - 명시적인 색상 클래스 추가
      if (domNode instanceof Element && domNode.name === 'h1') {
        return (
          <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
            {domToReact(domNode.children as any)}
          </h1>
        );
      }
      if (domNode instanceof Element && domNode.name === 'h2') {
        return (
          <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100">
            {domToReact(domNode.children as any)}
          </h2>
        );
      }
      if (domNode instanceof Element && domNode.name === 'h3') {
        return (
          <h3 className="text-lg font-bold mt-5 mb-2 text-gray-900 dark:text-gray-100">
            {domToReact(domNode.children as any)}
          </h3>
        );
      }
      if (domNode instanceof Element && domNode.name === 'h4') {
        return (
          <h4 className="text-base font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">
            {domToReact(domNode.children as any)}
          </h4>
        );
      }
      if (domNode instanceof Element && domNode.name === 'h5') {
        return (
          <h5 className="text-sm font-bold mt-3 mb-1 text-gray-900 dark:text-gray-100">
            {domToReact(domNode.children as any)}
          </h5>
        );
      }
      if (domNode instanceof Element && domNode.name === 'h6') {
        return (
          <h6 className="text-xs font-bold mt-3 mb-1 text-gray-900 dark:text-gray-100">
            {domToReact(domNode.children as any)}
          </h6>
        );
      }

      // 문단 처리 - 명시적인 색상 클래스 추가
      if (domNode instanceof Element && domNode.name === 'p') {
        // 이미지가 포함된 p 태그 확인
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

        // 일반 p 태그 처리
        return (
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {domToReact(domNode.children as any)}
          </p>
        );
      }

      // 리스트 처리 - 명시적인 색상 클래스 추가
      if (domNode instanceof Element && domNode.name === 'ul') {
        return (
          <ul className="list-disc pl-6 my-4 text-gray-700 dark:text-gray-300">
            {domToReact(domNode.children as any)}
          </ul>
        );
      }
      if (domNode instanceof Element && domNode.name === 'ol') {
        return (
          <ol className="list-decimal pl-6 my-4 text-gray-700 dark:text-gray-300">
            {domToReact(domNode.children as any)}
          </ol>
        );
      }
      if (domNode instanceof Element && domNode.name === 'li') {
        return (
          <li className="mb-1 text-gray-700 dark:text-gray-300">
            {domToReact(domNode.children as any)}
          </li>
        );
      }

      // 인용문 처리 - 명시적인 색상 클래스 추가
      if (domNode instanceof Element && domNode.name === 'blockquote') {
        return (
          <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
            {domToReact(domNode.children as any)}
          </blockquote>
        );
      }

      // 강조 텍스트 처리 - 명시적인 색상 클래스 추가
      if (domNode instanceof Element && domNode.name === 'strong') {
        return (
          <strong className="font-bold text-gray-900 dark:text-gray-100">
            {domToReact(domNode.children as any)}
          </strong>
        );
      }
      if (domNode instanceof Element && domNode.name === 'em') {
        return (
          <em className="italic text-gray-700 dark:text-gray-300">
            {domToReact(domNode.children as any)}
          </em>
        );
      }

      // 이미지 처리
      if (domNode instanceof Element && domNode.name === 'img' && domNode.attribs?.src) {
        return <RenderImage 
          src={domNode.attribs.src} 
          alt={domNode.attribs.alt || postTitle} 
        />;
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
  
  return <div className="ck-content prose prose-base max-w-none dark:prose-invert">{parse(html, parseOptions)}</div>;
};
