import { Post, Tag } from "@/types/models";

interface TagWithCount extends Tag {
  count?: number;
}

export function extractUniqueTagsFromPosts(posts: Post[]): TagWithCount[] {
  const tagMap = new Map<string, TagWithCount>();

  posts.forEach((post) => {
    if (post.tags && post.tags.length > 0) {
      post.tags.forEach((tag) => {
        const tagKey = tag.name.toLowerCase();
        
        if (tagMap.has(tagKey)) {
          const existingTag = tagMap.get(tagKey)!;
          existingTag.count = (existingTag.count ?? 0) + 1;
        } else {
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

  return Array.from(tagMap.values()).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
} 