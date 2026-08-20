import SideNav from "@/components/layout/SideNav";
import { getAllCategories, getAllPosts } from "@/lib/content";

/** 레일에 싣는 최신 글 수 */
const LATEST_IN_RAIL = 4;

/**
 * 목록성 페이지 공통 셸 — 홈 / Archive / 카테고리.
 * 라우트 그룹이라 URL은 그대로다(`/`, `/search`, `/category/*`).
 *
 * 폭은 헤더와 같은 max-w-[1440px] px-6 을 쓴다 — 로고와 레일이 같은 좌측 축에 선다.
 * 포스트 상세는 우측 목차(320px)가 있어 좌우로 끼면 본문이 좁아지므로 제외했다.
 */
export default function BrowseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = getAllCategories().filter((category) => category.postCount > 0);
  const latestPosts = getAllPosts().slice(0, LATEST_IN_RAIL);

  return (
    <div className="max-w-[1440px] mx-auto px-6 xl:flex xl:gap-8">
      <SideNav categories={categories} latestPosts={latestPosts} />
      <div className="min-w-0 xl:flex-1">{children}</div>
    </div>
  );
}
