import { PostData } from "@/components/ui/PostCard";

interface Tag {
  id: number | string;
  name: string;
  slug: string;
  count?: number;
}

// 포스트 배열에서 유니크한 태그들을 추출하고 사용 횟수 계산
export function extractUniqueTagsFromPosts(posts: PostData[]): Tag[] {
  const tagMap = new Map<string, Tag>();

  posts.forEach((post) => {
    if (post.tags && post.tags.length > 0) {
      post.tags.forEach((tag) => {
        const tagKey = tag.name.toLowerCase();
        
        if (tagMap.has(tagKey)) {
          // 이미 존재하는 태그면 카운트 증가
          const existingTag = tagMap.get(tagKey)!;
          existingTag.count = (existingTag.count || 0) + 1;
        } else {
          // 새로운 태그면 추가
          tagMap.set(tagKey, {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            count: 1
          });
        }
      });
    }
  });

  // Map을 배열로 변환하고 사용 횟수 기준으로 정렬 (많이 사용된 순)
  return Array.from(tagMap.values()).sort((a, b) => (b.count || 0) - (a.count || 0));
} 