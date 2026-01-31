'use client';

import parse, { Element, domToReact, HTMLReactParserOptions } from 'html-react-parser';
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from './image';
import React, { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '@/styles/post-content.css';

// 다크모드 감지 훅
const useIsDark = () => {
  const [isDark, setIsDark] = React.useState(false);
  
  React.useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDark();
    
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  return isDark;
};

// 간단한 스타일 파싱 - 필요한 경우에만 사용
const parseInlineStyle = (styleString: string): React.CSSProperties => {
  if (!styleString) return {};
  
  const styles: React.CSSProperties = {};
  const declarations = styleString.split(';');
  
  for (let i = 0; i < declarations.length; i++) {
    const declaration = declarations[i];
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;
    
    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();
    
    if (property && value) {
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      styles[camelProperty as keyof React.CSSProperties] = value as any;
    }
  }
  
  return styles;
};

// 언어 추출 최적화 - 정규식 캐싱
const LANG_REGEX = /(?:language-|hljs-)([a-zA-Z0-9-]+)/;
const getLanguageFromClassName = (className?: string): string => {
  if (!className) return 'text';
  const langMatch = className.match(LANG_REGEX);
  return langMatch ? langMatch[1] : 'text';
};

// 단일 코드 블록 컴포넌트 - 다크모드 감지로 테마 전환
const CodeBlockWrapper = ({ code, className }: { 
  code: string; 
  className?: string;
}) => {
  const isDark = useIsDark();
  const language = useMemo(() => getLanguageFromClassName(className), [className]);
  
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {language !== 'text' && (
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          {language.toUpperCase()}
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          backgroundColor: 'transparent',
        }}
        wrapLines={true}
        wrapLongLines={true}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export const RenderCodeBlock = (props: { code: string; className?: string }) => (
  <CodeBlockWrapper {...props} />
);

// 숫자 파싱 헬퍼
const parseNumericValue = (value: string | number | undefined, defaultValue: number): number => {
  if (typeof value === 'number') return value;
  if (!value) return defaultValue;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const RenderImage = ({ 
  src, 
  alt = '이미지', 
  width, 
  height, 
  style,
  className 
}: { 
  src: string; 
  alt?: string; 
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const imageSrc = getImageUrl(src);
  const parsedStyle = style || {};
  const parsedClassName = className || '';
  
  const imageWidth = width || parsedStyle.width || '100%';
  const imageHeight = height || parsedStyle.height || 'auto';
  
  // 정렬 클래스 결정
  let alignmentClass = 'mx-auto';
  if (parsedClassName.includes('image_resized')) {
    if (parsedStyle.float === 'left') alignmentClass = 'mr-auto';
    else if (parsedStyle.float === 'right') alignmentClass = 'ml-auto';
  }
  
  // sizes 속성 동적 계산
  const isResized = parsedClassName.includes('image_resized');
  const sizes = isResized 
    ? '(max-width: 768px) 100vw, 50vw'
    : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw';
  
  const numericWidth = parseNumericValue(imageWidth, 800);
  const numericHeight = parseNumericValue(imageHeight, 400);
  
  return (
    <div className={`relative my-4 ${alignmentClass}`} style={{ 
      width: typeof imageWidth === 'string' ? imageWidth : `${imageWidth}px`,
      maxWidth: '100%'
    }}>
      <Image
        src={imageSrc}
        alt={alt}
        width={numericWidth}
        height={numericHeight}
        sizes={sizes}
        className="object-contain w-full h-auto"
        loading="lazy"
        style={parsedStyle}
      />
    </div>
  );
};

export const RenderLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  if (!href) return <>{children}</>;
  
  const isExternal = href.startsWith('http');
  
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
  
  return (
    <Link
      href={href}
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
    >
      {children}
    </Link>
  );
};

// 텍스트 추출 최적화 - 깊이 제한 및 단순화
const extractTextFromNode = (node: any, depth: number = 0): string => {
  if (!node || depth > 10) return ''; // 무한 재귀 방지
  if (node.type === 'text' && node.data) return node.data;
  if (node.children && Array.isArray(node.children)) {
    let result = '';
    for (let i = 0; i < node.children.length; i++) {
      result += extractTextFromNode(node.children[i], depth + 1);
    }
    return result;
  }
  return '';
};

export const HtmlContent = ({ html, postTitle }: { html: string; postTitle: string }) => {
  // parseOptions를 useMemo로 메모이제이션
  const parseOptions: HTMLReactParserOptions = useMemo(() => ({
    replace: (domNode: any) => {
      if (domNode instanceof Element && domNode.name === 'pre') {
        const codeElement = domNode.children.find((child: any) => 
          child instanceof Element && child.name === 'code'
        ) as Element;
        
        const codeString = codeElement ? 
          extractTextFromNode(codeElement, 0) : 
          extractTextFromNode(domNode, 0);
        
        if (codeString.trim()) {
          return (
            <RenderCodeBlock 
              code={codeString}
              className={codeElement?.attribs?.class || domNode.attribs?.class}
            />
          );
        }
      }
      
      if (domNode instanceof Element && domNode.name === 'img' && domNode.attribs?.src) {
        return <RenderImage 
          src={domNode.attribs.src} 
          alt={domNode.attribs.alt || postTitle}
          width={domNode.attribs.width}
          height={domNode.attribs.height}
          style={domNode.attribs.style ? parseInlineStyle(domNode.attribs.style) : undefined}
          className={domNode.attribs.class}
        />;
      }
      
      if (domNode instanceof Element && domNode.name === 'p') {
        const imageElements = domNode.children.filter((child: any) => 
          child instanceof Element && child.name === 'img'
        );
        
        if (imageElements.length === 1 && domNode.children.length === 1) {
          const imageElement = imageElements[0] as Element;
          if (imageElement.attribs?.src) {
            return <RenderImage 
              src={imageElement.attribs.src}
              alt={imageElement.attribs.alt || postTitle}
              width={imageElement.attribs.width}
              height={imageElement.attribs.height}
              style={imageElement.attribs.style ? parseInlineStyle(imageElement.attribs.style) : undefined}
              className={imageElement.attribs.class}
            />;
          }
        }
      }
      
      if (domNode instanceof Element && domNode.name === 'a' && domNode.attribs?.href) {
        return (
          <RenderLink href={domNode.attribs.href}>
            {domToReact(domNode.children as any)}
          </RenderLink>
        );
      }
      
      return undefined;
    }
  }), [postTitle]);
  
  return <div className="ck-content">{parse(html, parseOptions)}</div>;
};
