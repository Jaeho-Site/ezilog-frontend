/**
 * 포스트 본문 렌더러 — 서버 컴포넌트.
 *
 * CKEditor HTML(또는 마크다운 폴백)을 빌드 타임에 React 트리로 변환한다.
 * 클라이언트로 배송되는 JS 없음. (기존: html-react-parser + react-syntax-highlighter
 * + react-markdown 이 전부 클라이언트 번들에 포함 — 포스트 페이지 First Load 356kB)
 */
import parse, { Element, domToReact, DOMNode, HTMLReactParserOptions } from 'html-react-parser';
import { marked } from 'marked';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { transformPostHtml } from '@/lib/render/transform';
import '@/styles/post-content.css';

interface PostContentProps {
  html: string | null;
  markdown: string | null;
  postTitle: string;
}

const parseInlineStyle = (styleString: string): React.CSSProperties => {
  if (!styleString) return {};

  const styles: Record<string, string> = {};
  for (const declaration of styleString.split(';')) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;

    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();
    if (property && value) {
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      styles[camelProperty] = value;
    }
  }
  return styles as React.CSSProperties;
};

const parseNumericValue = (value: string | number | undefined, defaultValue: number): number => {
  if (typeof value === 'number') return value;
  if (!value) return defaultValue;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * 직접 작도한 다이어그램만 카드/다크 반전 스타일 대상으로 판별.
 * SVG 전체 + post16 계열 GIF — 스크린샷 PNG와 화면 녹화 GIF는 반전하면 안 된다.
 */
function isDiagramImage(src: string): boolean {
  const basename = decodeURIComponent(src.split('?')[0].split('/').pop() || '').toLowerCase();
  if (basename.endsWith('.svg')) return true;
  return /^post16[-_]/.test(basename) && basename.endsWith('.gif');
}

const RenderImage = ({
  src,
  alt = '이미지',
  width,
  height,
  style,
  className,
}: {
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const parsedStyle = style || {};
  const parsedClassName = className || '';

  const imageWidth = width || parsedStyle.width || '100%';
  const imageHeight = height || parsedStyle.height || 'auto';

  let alignmentClass = 'mx-auto';
  if (parsedClassName.includes('image_resized')) {
    if (parsedStyle.float === 'left') alignmentClass = 'mr-auto';
    else if (parsedStyle.float === 'right') alignmentClass = 'ml-auto';
  }

  const isResized = parsedClassName.includes('image_resized');
  const sizes = isResized
    ? '(max-width: 768px) 100vw, 50vw'
    : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw';

  return (
    <div
      className={`relative my-4 ${alignmentClass}`}
      style={{
        width: typeof imageWidth === 'string' ? imageWidth : `${imageWidth}px`,
        maxWidth: '100%',
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={parseNumericValue(imageWidth, 800)}
        height={parseNumericValue(imageHeight, 400)}
        sizes={sizes}
        className={`object-contain w-full h-auto${isDiagramImage(src) ? ' diagram' : ''}`}
        loading="lazy"
        style={parsedStyle}
      />
    </div>
  );
};

const RenderLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  if (!href) return <>{children}</>;

  const isExternal = href.startsWith('http');
  const className = 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300';

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};

function buildParserOptions(codeBlocks: string[], postTitle: string): HTMLReactParserOptions {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (!(domNode instanceof Element)) return undefined;

      // Shiki 슬롯 → 하이라이팅된 HTML 삽입
      if (domNode.name === 'div' && domNode.attribs?.['data-shiki-slot'] !== undefined) {
        const index = parseInt(domNode.attribs['data-shiki-slot'], 10);
        const highlighted = codeBlocks[index];
        if (highlighted) {
          return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
        }
        return <></>;
      }

      if (domNode.name === 'img' && domNode.attribs?.src) {
        return (
          <RenderImage
            src={domNode.attribs.src}
            alt={domNode.attribs.alt || postTitle}
            width={domNode.attribs.width}
            height={domNode.attribs.height}
            style={domNode.attribs.style ? parseInlineStyle(domNode.attribs.style) : undefined}
            className={domNode.attribs.class}
          />
        );
      }

      // p 안의 블록 요소(이미지 치환 결과 포함)는 유효하지 않은 중첩이 되므로 p → div
      if (domNode.name === 'p') {
        const hasBlockElements = domNode.children.some(
          (child) =>
            child instanceof Element &&
            ['div', 'figure', 'table', 'ul', 'ol', 'blockquote', 'pre', 'img'].includes(child.name)
        );

        if (hasBlockElements) {
          return (
            <div
              className={domNode.attribs?.class}
              style={domNode.attribs?.style ? parseInlineStyle(domNode.attribs.style) : undefined}
            >
              {domToReact(domNode.children as DOMNode[], options)}
            </div>
          );
        }
        return undefined;
      }

      if (domNode.name === 'a' && domNode.attribs?.href) {
        return (
          <RenderLink href={domNode.attribs.href}>
            {domToReact(domNode.children as DOMNode[], options)}
          </RenderLink>
        );
      }

      return undefined;
    },
  };
  return options;
}

export default async function PostContent({ html, markdown, postTitle }: PostContentProps) {
  const source = html || (markdown ? await marked.parse(markdown, { gfm: true }) : null);

  if (!source) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>이 포스트에는 내용이 없습니다.</p>
      </div>
    );
  }

  const { html: transformed, codeBlocks } = await transformPostHtml(source);

  return <div className="ck-content">{parse(transformed, buildParserOptions(codeBlocks, postTitle))}</div>;
}
