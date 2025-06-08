// 태그 색상 정의 (더 균등한 분포를 위해 순서 조정)
export const tagColors = {
  blue: {
    text: "text-blue-600 dark:text-blue-400", 
    bg: "bg-blue-50 dark:bg-blue-900/30",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-800/50"
  },
  emerald: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    hover: "hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
  },
  purple: {
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/30",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-800/50"
  },
  orange: {
    text: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/30", 
    hover: "hover:bg-orange-100 dark:hover:bg-orange-800/50"
  },
  pink: {
    text: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-900/30",
    hover: "hover:bg-pink-100 dark:hover:bg-pink-800/50"
  }
} as const;

// 색상 키 배열
const colorKeys = Object.keys(tagColors) as Array<keyof typeof tagColors>;

// FNV-1a 해시 함수 (더 균등한 분포를 위해)
function betterHash(str: string): number {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0; // FNV prime, unsigned 32-bit
  }
  return hash;
}

// 태그에 따른 색상 반환 함수
export function getTagColor(tagName: string): typeof tagColors[keyof typeof tagColors] {
  const hash = betterHash(tagName.toLowerCase());
  const colorIndex = hash % colorKeys.length;
  const colorKey = colorKeys[colorIndex];
  return tagColors[colorKey];
}

// 태그 배열에 색상을 매핑하는 함수
export function mapTagsWithColors<T extends { name: string }>(tags: T[]) {
  return tags.map(tag => ({
    ...tag,
    color: getTagColor(tag.name)
  }));
}