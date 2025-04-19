import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiTag } from "react-icons/fi";

// 임시 데이터 - 나중에 Strapi로부터 가져올 데이터
const posts = [
  {
    id: 1,
    title: "Next.js와 Strapi로 헤드리스 블로그 만들기",
    description: "Next.js와 Strapi를 활용하여 빠르고 SEO에 최적화된 블로그를 구축하는 방법을 알아봅니다.",
    slug: "nextjs-strapi-headless-blog",
    coverImage: "/placeholder-image.jpg",
    publishedDate: "2023-12-10",
    category: { name: "웹 개발", slug: "web-development" },
    tags: [
      { name: "Next.js", slug: "nextjs" },
      { name: "Strapi", slug: "strapi" },
      { name: "헤드리스 CMS", slug: "headless-cms" }
    ]
  },
  {
    id: 2,
    title: "Supabase로 실시간 댓글 시스템 구현하기",
    description: "Supabase의 실시간 기능을 활용하여 블로그에 댓글 시스템을 추가하는 방법을 알아봅니다.",
    slug: "supabase-realtime-comments",
    coverImage: "/placeholder-image.jpg",
    publishedDate: "2023-12-15",
    category: { name: "데이터베이스", slug: "database" },
    tags: [
      { name: "Supabase", slug: "supabase" },
      { name: "실시간", slug: "realtime" },
      { name: "React", slug: "react" }
    ]
  },
  {
    id: 3,
    title: "AWS S3와 CloudFront로 이미지 최적화하기",
    description: "AWS S3와 CloudFront를 활용하여 블로그 이미지를 효율적으로 관리하고 전달하는 방법을 알아봅니다.",
    slug: "aws-s3-cloudfront-image-optimization",
    coverImage: "/placeholder-image.jpg",
    publishedDate: "2023-12-20",
    category: { name: "클라우드", slug: "cloud" },
    tags: [
      { name: "AWS", slug: "aws" },
      { name: "S3", slug: "s3" },
      { name: "CloudFront", slug: "cloudfront" }
    ]
  }
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* 헤더 섹션 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">EziLog</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Next.js, Strapi, Supabase로 구축된 헤드리스 블로그 플랫폼
        </p>
      </div>

      {/* 최근 게시물 */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">최근 게시물</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-4px]">
              <Link href={`/post/${post.slug}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </Link>
              
              <div className="p-5">
                <Link href={`/category/${post.category.slug}`}>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 inline-block">
                    {post.category.name}
                  </span>
                </Link>
                
                <Link href={`/post/${post.slug}`}>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400">
                    {post.title}
                  </h3>
                </Link>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <FiCalendar className="mr-1" />
                    <span>{post.publishedDate}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FiTag className="mr-1" />
                    <span>{post.tags[0].name}</span>
                    {post.tags.length > 1 && <span> 외 {post.tags.length - 1}개</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA 섹션 */}
      <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">블로그 소개</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          EziLog는 Next.js, Strapi, Supabase를 활용한 현대적인 블로그 플랫폼입니다.
          정적 생성과 최신 웹 기술을 통해 빠른 성능과 뛰어난 사용자 경험을 제공합니다.
        </p>
        <Link 
          href="/about" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          자세히 알아보기
        </Link>
      </div>
    </div>
  );
}
