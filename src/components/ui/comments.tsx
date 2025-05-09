// src/components/comments/GiscusComments.tsx
'use client';

import Giscus from '@giscus/react';

export default function GiscusComments() {
  return (
    <div className="mt-10 pt-10 border-t">
      <h2 className="text-2xl font-bold mb-6">댓글</h2>
      <Giscus
        id="comments"
        repo="Jaeho-Site/ezilog-comments"
        repoId="R_kgDOOm_UEQ"
        category="Announcements"
        categoryId="DIC_kwDOOm_UEc4Cp8L0"
        mapping="pathname"
        term="Welcome to @giscus/react component!"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}