import PostCard, { PostData } from "@/components/ui/PostCard";

interface PostListGridProps {
  posts: PostData[];
  emptyMessage?: string;
  className?: string;
  showTitle?: boolean;
  title?: string;
  titleClassName?: string;
}

export default function PostListGrid({
  posts,
  emptyMessage = "포스트가 없습니다.",
  className = "mt-10 px-4 md:px-12 xl:px-16 grid gap-10 md:gap-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  showTitle = false,
  title,
  titleClassName = "text-3xl font-bold mb-6"
}: PostListGridProps) {
  // 포스트가 없는 경우
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {showTitle && title && (
        <h1 className={titleClassName}>
          {title}
        </h1>
      )}
      
      <div className={className}>
        {posts.map((post: PostData) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
} 