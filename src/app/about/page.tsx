import { getPostBySlug } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { 
  HtmlContent, 
  MarkdownContent,
  getImageUrl, 
  transformMarkdownImageUrls, 
  formatDate 
} from "@/utils/content";

export default async function About() {
  // 슬러그가 "1"인 포스트 가져오기
  const post = await getPostBySlug("1");
  
  // 포스트가 존재하는 경우에만 처리
  let contentElement = null;
  let coverImageUrl = '';
  
  if (post) {
    // 콘텐츠 타입 결정
    const htmlContent = post.html || '';
    let markdownContent = post.markdown || '';
    
    // 마크다운 이미지 URL 변환
    if (markdownContent) {
      markdownContent = transformMarkdownImageUrls(markdownContent);
    }
    
    // 이미지 URL
    if (post.coverImage && post.coverImage.url) {
      coverImageUrl = getImageUrl(post.coverImage.url);
    }
    
    // 컨텐츠 렌더링
    if (htmlContent) {
      contentElement = <HtmlContent html={htmlContent} postTitle={post.title} />;
    } else if (markdownContent) {
      contentElement = <MarkdownContent markdown={markdownContent} postTitle={post.title} />;
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">EziLog 소개</h1>
      
      {post ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto">
          {coverImageUrl && (
            <div className="relative w-full h-64">
              <Image
                src={coverImageUrl}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            
            {post.publishedDate && (
              <div className="text-gray-500 mb-6">
                {formatDate(post.publishedDate)}
              </div>
            )}
            
            <div className="mt-6 prose prose-lg max-w-none dark:prose-invert">
              {contentElement}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400">포스트를 찾을 수 없습니다.</p>
      )}
    </div>
  );
}