import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import { generateAboutMetadata, aboutDescription } from "@/lib/metadata";
import JsonLd from "@/components/seo/JsonLd";
import {
  siteConfig,
  buildPersonJsonLd,
  buildProfilePageJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/metadata/config";

export const dynamic = 'force-static';

/** 이 페이지의 마지막 개정일 — 구조화 데이터의 dateModified 로도 쓰인다. */
const LAST_UPDATED = '2026-08-20';

export async function generateMetadata(): Promise<Metadata> {
  return generateAboutMetadata();
}

/**
 * 다루는 주제 — 방문자에게는 "여기 뭐가 있나"를 보여주고,
 * 생성형 엔진에게는 "이 사람은 무엇에 대해 신뢰할 만한가"의 근거가 된다.
 *
 * slugs 는 각 주제의 대표 글이다. 지금은 비워두고 해당 주제의 글이 쌓이면 채운다.
 * 제목은 빌드 타임에 실제 콘텐츠에서 가져오므로 slug 만 추가하면 된다.
 */
const TOPICS: Array<{ heading: string; body: string; slugs: string[] }> = [
  {
    heading: 'AI와 개발 방식',
    body:
      'AI를 필요할 때 질문하는 보조 도구가 아니라 개발 과정에 상시 참여하는 도구로 사용하고 있습니다. ' +
      'Claude와 GPT를 활용한 개발부터 Agent와 개발 하네스 구축, 여러 Agent에게 작업을 나누고 검증하는 ' +
      '워크플로까지 직접 실험하며 개발자의 역할이 어떻게 달라지는지 기록합니다.',
    slugs: [],
  },
  {
    heading: 'JavaScript와 CS',
    body:
      '도구를 사용하는 것만큼 그 아래에서 무슨 일이 일어나는지 이해하는 데 관심이 많습니다. ' +
      'JavaScript의 객체와 프로토타입, 비동기 처리 같은 언어의 기본부터 브라우저, HTTP, TLS, DNS와 같은 ' +
      '웹의 기반 기술까지 당연하게 사용하던 것들의 동작 원리를 따라갑니다.',
    slugs: [],
  },
  {
    heading: '인프라와 아키텍처',
    body:
      '코드를 작성하는 데서 끝내지 않고 실제 서비스가 배포되고 운영되는 과정까지 다룹니다. ' +
      'Next.js, Node.js, FastAPI로 만든 서비스를 AWS 환경에 배포하고 Kubernetes를 운영하며 겪은 경험부터 ' +
      '성능, 모니터링, 비용, 시스템 구조에 대한 고민까지 기록합니다.',
    slugs: [],
  },
  {
    heading: '회고',
    body:
      '프로젝트와 활동이 끝날 때면 결과만 정리하기보다 그 과정에서 무엇을 고민했고, 어떤 선택을 했으며, ' +
      '생각이 어떻게 달라졌는지를 돌아봅니다. 프로젝트 단위의 회고를 남기고, 한 해가 끝나면 그동안의 ' +
      '경험과 변화도 다시 정리합니다.',
    slugs: [],
  },
];

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'EziLog는 어떤 블로그인가요?',
    answer:
      '제가 직접 만들고 운영하는 개발 블로그입니다. 소프트웨어를 만들고 운영하며 겪은 경험과 고민을 중심으로, ' +
      'JavaScript와 웹의 기본 원리부터 프론트엔드와 백엔드, 인프라와 아키텍처, AI를 활용한 개발 방식까지 ' +
      '관심사를 넓혀가며 기록합니다. 티스토리나 Velog 같은 플랫폼을 사용하지 않고 Next.js와 ' +
      'Headless CMS인 Strapi(Node.js)로 기획부터 디자인, 구현, 배포까지 직접 만들었습니다.',
  },
  {
    question: '글은 어떻게 작성하나요?',
    answer:
      '대부분의 글은 처음부터 끝까지 직접 작성합니다. 기술 글의 경우 공부하면서 필기한 내용과 제가 원하는 ' +
      '방향의 초안을 먼저 작성한 뒤, AI를 활용해 문장을 다듬거나 내용의 정확성을 검토합니다. ' +
      'AI가 글을 대신 작성하기보다는 제가 공부하고 경험한 내용을 더 명확하게 전달하고, ' +
      '놓친 부분이 없는지 확인하는 도구로 활용하고 있습니다.',
  },
  {
    question: 'notes.ezilog.dev는 어떤 곳인가요?',
    answer:
      '이 블로그가 프로젝트에서 겪은 경험과 판단처럼 큰 주제를 다룬다면, notes.ezilog.dev는 개념 하나를 ' +
      '짧게 정리하는 공부 기록입니다. VitePress로 만들어 별도 서브도메인에 배포했습니다.',
  },
];

const KNOWS_ABOUT = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', '프론트엔드 개발',
  'Node.js', 'FastAPI', '백엔드 개발',
  'AWS', 'Kubernetes', '인프라', '소프트웨어 아키텍처',
  '브라우저', 'HTTP', 'TLS', 'DNS', '네트워크',
  'AI Agent', 'AI 활용 개발',
];

export default function AboutPage() {
  const allPosts = getAllPosts();
  const findPost = (slug: string) => allPosts.find((post) => post.slug === slug);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <JsonLd data={buildPersonJsonLd({ description: aboutDescription, knowsAbout: KNOWS_ABOUT })} />
      <JsonLd data={buildProfilePageJsonLd({ description: aboutDescription, dateModified: LAST_UPDATED })} />
      <JsonLd data={buildFaqJsonLd(FAQ)} />
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: '홈', path: '' },
        { name: '소개', path: '/about' },
      ])} />

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        소개
      </h1>

      {/* 첫 문단 — 사람에게는 인사, 기계에게는 정의가 되도록 */}
      <p className="text-lg leading-loose text-gray-800 dark:text-gray-200 mb-6">
        안녕하세요, <strong className="font-semibold">EziLog</strong>를 직접 만들고 운영하는
        개발자 <strong className="font-semibold">신재호</strong>입니다. 프론트엔드 개발자로
        시작했고, 지금은 프론트엔드를 강점으로 삼아 서비스 전체를 설계하고 바라볼 수 있는
        소프트웨어 아키텍트를 목표로 공부하고 경험을 쌓아가고 있습니다.
      </p>

      <p className="leading-loose text-gray-700 dark:text-gray-300 mb-6">
        티스토리나 Velog 같은 플랫폼을 두고 굳이 직접 만든 이유는 두 가지였습니다.
        하나는 디자인과 기능을 원하는 대로 바꿔가며 쓰고 싶었기 때문이고, 다른 하나는
        블로그를 만드는 과정 자체가 저에게 가장 좋은 공부였기 때문입니다. 실제 서비스를
        만든다는 마음으로 기술을 고르고 문제를 풀어가는 경험은, 완성된 플랫폼을 쓰는 것과는
        많이 달랐습니다. 그래서 이 블로그는 글을 담는 그릇이면서 동시에 하나의 프로젝트이기도 합니다.
      </p>

      <p className="leading-loose text-gray-700 dark:text-gray-300 mb-16">
        이름은 <em className="not-italic font-medium">easy</em>와{' '}
        <em className="not-italic font-medium">log</em>를 합쳐 지었습니다. 부담 없이 읽히는
        글을 쓰고 싶다는 마음과, 배운 것을 차곡차곡 남기겠다는 뜻을 담았습니다. 처음 이
        블로그를 열며 적었던 이야기는{' '}
        <Link href="/post/about-blog" className="text-blue-600 dark:text-blue-400 hover:underline">
          첫번째 포스트
        </Link>
        에 그대로 남아 있습니다.
      </p>

      {/* 다루는 주제 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          어떤 글을 쓰나요
        </h2>
        <p className="leading-loose text-gray-700 dark:text-gray-300 mb-6">
          서비스를 만들고 운영하며 생긴 질문과 경험을 기록합니다. 프론트엔드에 특히 많은 흥미를
          가지고 있지만 특정 영역에 경계를 두지는 않습니다. JavaScript의 동작 원리를 파고드는
          것부터 Node.js와 FastAPI로 서버를 만들고, AWS에 서비스를 배포하고, AI Agent를 개발
          과정에 연결하는 것까지 직접 부딪혀 본 것들을 다룹니다.
        </p>
        <p className="leading-loose text-gray-700 dark:text-gray-300 mb-10">
          새로운 기술을 빠르게 활용하는 것과 그 아래의 기본을 이해하는 것 모두 중요하다고
          생각합니다. AI가 코드를 대신 작성하는 시대일수록 기본을 놓치지 않으면서, 동시에
          AI를 단순한 코드 생성기가 아닌 팀의 동료처럼 활용하는 방법을 고민하고 있습니다.
        </p>

        <div className="space-y-10">
          {TOPICS.map((topic) => {
            const posts = topic.slugs.map(findPost).filter((post) => post !== undefined);

            return (
              <div key={topic.heading}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {topic.heading}
                </h3>
                <p className="leading-loose text-gray-700 dark:text-gray-300">
                  {topic.body}
                </p>
                {posts.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {posts.map((post) => (
                      <li key={post.slug} className="text-sm">
                        <Link
                          href={`/post/${post.slug}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Q&A */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          EziLog에 대해
        </h2>
        <dl className="space-y-8">
          {FAQ.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {item.question}
              </dt>
              <dd className="leading-loose text-gray-700 dark:text-gray-300">
                {item.question === 'notes.ezilog.dev는 어떤 곳인가요?' ? (
                  <>
                    이 블로그가 프로젝트에서 겪은 경험과 판단처럼 큰 주제를 다룬다면,{' '}
                    <a
                      href={siteConfig.author.notes}
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      notes.ezilog.dev
                    </a>
                    는 개념 하나를 짧게 정리하는 공부 기록입니다. VitePress로 만들어 별도
                    서브도메인에 배포했습니다.
                  </>
                ) : (
                  item.answer
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="border-t border-gray-200 dark:border-gray-800 pt-8 text-sm text-gray-500 dark:text-gray-400">
        마지막 갱신: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
      </p>
    </div>
  );
}
