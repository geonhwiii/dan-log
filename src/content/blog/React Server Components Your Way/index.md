---
title: '[번역] React Server Components Your Way'
summary: 'RSC는 정말 흥미로운 기술입니다 — 더 작은 번들, 스트리밍 UI, 무거운 작업을 클라이언트에서 분리하는 것까지. 하지만 기존 구현들은 획일적인 패턴을 강제합니다. 만약 여러분이 원하는 방식으로 RSC를 fetch, 캐싱, 조합할 수 있다면 어떨까요?'
date: '2026-04-15'
draft: false
image: 'https://tanstack.com/.netlify/images?url=%2Fblog-assets%2Freact-server-components%2Fheader.jpg&w=800&q=80'
tags:
  - 번역
  - React Query
---

![](https://tanstack.com/.netlify/images?url=%2Fblog-assets%2Freact-server-components%2Fheader.jpg&w=800&q=80)

> 원문 : https://tanstack.com/blog/react-server-components

TanStack에서 우리는 항상 90%의 유스케이스를 쉽게 커버하면서도, 고급 유스케이스를 위해 틀을 벗어날 수 있는 유연성을 제공하는 도구를 만들기 위해 노력해왔습니다. 왜냐고요? 일이 진지해질 때, **여러분이 자신의 애플리케이션에 무엇이 최선인지 가장 잘 알고 있으며, 직접 제어할 자유를 누릴 자격이 있기 때문입니다.**

이것이 항상 TanStack의 철학이었고, React Server Components에서도 같은 경험을 제공하기 위해 시간을 들여온 우리를 믿어주셔서 감사합니다.

## 서버 컴포넌트가 뭔가요?

그건... 아닙니다. 이 글은 서버 컴포넌트 속성 과정이 아닙니다. 이 시점에서 서버 컴포넌트에 익숙하지 않다면, 잠시 [공식 React Server Components 문서](https://react.dev/reference/rsc/server-components)를 살펴보고 오시기 바랍니다.

## RSC가 왜 중요한가요?

RSC는 무겁거나 비용이 많이 드는 렌더링 로직을 클라이언트에서 서버로 옮기기 위한 필수적인 프리미티브(primitive)입니다.

**특히 정적이거나 변경이 드문 콘텐츠** 중에서 일관되고 세밀하게 캐싱할 수 있는 것들에 적합합니다.

마크다운 파서, 구문 하이라이터, 날짜 포맷팅 라이브러리, 검색 인덱싱, 콘텐츠 변환 등이 모두 훌륭한 사용 사례이지만, 물론 이것들만 있는 것은 아닙니다.

RSC는 매우 강력한 프리미티브입니다.

## RSC의 현재 상황

현재 대부분의 사람들은 RSC를 서버 우선(server-first) 방식으로 생각합니다: 서버가 트리를 소유하고, `'use client'`가 인터랙티브한 부분을 표시하며, 프레임워크의 컨벤션이 모든 것이 어떻게 맞물리는지 결정합니다.

이 모델은 매력적일 수 있습니다. 스트리밍, 서버 렌더링, 그리고 서버 사이드 작업의 코로케이션(colocation)이 처음부터 내장된 것처럼 느껴지게 해줍니다.

하지만 이 모델은 RSC를 유용한 프리미티브에서 여러분의 전체 앱이 중심을 잡아야 하는 존재로 바꿔버리기도 합니다. 결국 프레임워크가 RSC의 생성 방법, 렌더링 위치, 인터랙티브 경계 정의 방식, 데이터나 사용자 액션이 변경될 때 UI가 재구성되는 방식까지 모두 소유하게 됩니다.

바로 그 부분이 우리가 계속 걸렸던 지점입니다. 단지 RSC에서 가치를 얻기 위해 이 전체 모델을 처음부터 받아들여야 한다고는 생각하지 않습니다.

## 다른 RSC 모델

클라이언트에서 JSON을 fetch하는 것만큼 세밀하게 RSC를 사용할 수 있다면 어떨까요? 사실, 서버에서 렌더링된 UI를 어떻게 fetch하고, 캐싱하고, 조합할지를 클라이언트가 결정한다면 어떨까요?

TanStack Start에서 핵심 아이디어는 RSC가 서버 소유의 컴포넌트 트리가 아니라, 클라이언트에서 언제든지 여러분의 조건에 맞게 fetch, 캐싱, 렌더링할 수 있는 **단순한 데이터 스트림**이라는 것입니다. 이 하나의 전환이 RSC의 동작 방식에 대한 근본적인 변화 없이 훨씬 더 조합 가능하게 만들어줍니다.

TanStack Start에서 RSC는 그저 React Flight 스트림입니다. 이것은 너무 당연해서 굳이 말할 필요도 없어 보이지만, 바로 그것이 포인트입니다. 우리는 RSC가 특별한 규칙, API, 네트워크 효과로 프레임워크의 모든 것을 바꿔버리는 블랙박스 컨벤션으로 감싸지기를 원하지 않았습니다.

우리는 RSC가 다른 서버 데이터처럼 동작하기를 원했고, 이는 **스트리밍을 일급 시민으로 지원하는 것 외에는 프레임워크에서 특별히 할 일이 없어야 한다**는 뜻입니다.

이것이 실제로 의미하는 바는 다음과 같습니다:

- 서버 어디에서든 생성하고 반환할 수 있습니다 (서버 함수, API 라우트)
- 원하는 곳에서 디코딩할 수 있습니다 (SSR과 클라이언트 모두)
- 원하는 방식으로 캐싱할 수 있습니다. 그저 바이트 스트림일 뿐입니다. 기존의 모든 도구와 즉시 호환됩니다.

## 어떻게 생겼나요?

TanStack Start에서의 RSC는 이렇게 생겼습니다:

> 자연스럽게, 서버 동기화 로직을 줄이기 위해 TanStack Query를 사용하겠습니다!

```tsx
import { createServerFn } from '@tanstack/react-start';
import { createFromReadableStream, renderToReadableStream } from '@tanstack/react-start/rsc';

// 서버 함수 생성
const getGreeting = createServerFn().handler(async () => {
  // RSC readable stream 생성
  return renderToReadableStream(
    // JSX 반환
    <h1>Hello from the server</h1>,
  );
});

function Greeting() {
  const query = useQuery({
    queryKey: ['greeting'],
    queryFn: async () =>
      // 스트림에서 렌더링 가능한 엘리먼트 생성
      createFromReadableStream(
        // 서버 함수를 호출하여 스트림을 가져옴
        await getGreeting(),
      ),
  });

  // 렌더링!
  return <>{query.data}</>;
}
```

## 프리미티브 API

프리미티브 수준에서 API 표면은 의도적으로 작습니다:

- `renderToReadableStream`은 서버에서 React 엘리먼트를 Flight 스트림으로 렌더링합니다.
- `createFromReadableStream`은 클라이언트 또는 SSR 중에 Flight 스트림을 디코딩합니다.
- `createFromFetch`는 fetch 응답에서 직접 디코딩하며, 그 형태가 더 편리할 때 사용합니다.
  내부적으로 이야기는 간단합니다: React가 서버에서 Flight 스트림으로 렌더링하고, 클라이언트가 그 스트림을 다시 React 엘리먼트 트리로 디코딩합니다.

여기에 숨겨진 추가 프로토콜은 없습니다. 이것이 프리미티브입니다. 표준 Flight 스트림이 들어가고, 표준 React 엘리먼트가 나옵니다.

이것만으로도 많은 것을 구축할 수 있습니다. RSC 출력을 모든 결정을 거쳐야 하는 프레임워크 소유의 특별한 컨벤션이 아닌, 앱 내 다른 비동기 리소스처럼 취급할 수 있습니다.

## 캐싱

불필요한 프레임워크 컨벤션에 대해 말하자면: 캐싱은 새롭게 발명할 것이 아니며, **RSC도 예외가 아닙니다**.

RSC가 "그냥 데이터"가 되면 캐싱 이야기는 훨씬 단순해집니다. 이것들은 HTTP를 통해 평범하게 전달되고 렌더링 중에 투명하게 처리되는 세밀한 스트림이기 때문에, 클라이언트에서 캐싱하기 쉬울 뿐만 아니라 서버 측 어디서든 캐싱할 수 있습니다: 메모리, 데이터베이스, CDN 뒤, 혹은 여러분의 아키텍처가 이미 바이트, 응답, 데이터를 캐싱하는 그 어디서든 말입니다.

이는 새로운 접근 방식과 멘탈 모델의 전환을 요구하는 대신, **여러분이 클라이언트에서 이미 잘 알고 있는 캐싱 레이어**에도 동일하게 적용됩니다.

설명하겠습니다.

### Query: 세밀한 제어

TanStack Query가 이것을 아주 잘 보여줍니다. 특별한 "RSC 모드"가 필요하지 않습니다. RSC 페이로드가 비동기 쿼리의 일부가 되면, 여전히 명시적인 캐시 키, `staleTime`, 백그라운드 리페칭, 그리고 나머지 Query의 도구들을 그대로 사용할 수 있습니다. 정적 콘텐츠라면 `staleTime: Infinity`만 설정하면 끝입니다.

```tsx
import { createServerFn } from '@tanstack/react-start';
import { createFromReadableStream, renderToReadableStream } from '@tanstack/react-start/rsc';

const getGreeting = createServerFn().handler(async () => {
  return renderToReadableStream(<h1>Hello from the server</h1>);
});

function PostPage({ postId }: { postId: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ['greeting-rsc', postId],
    queryFn: async () => ({
      Greeting: await createFromReadableStream(await getGreeting()),
    }),
    staleTime: 5 * 60 * 1000,
  });

  return <>{data.Greeting}</>;
}
```

### Router: 자동 라우트 기반 캐싱

TanStack Router는 더 멋집니다. 네이티브로 스트림을 지원하기 때문에, 라우트 로더의 RSC 페이로드도 역시 "그냥 데이터"입니다.

await할 수도 있고, 스트리밍할 수도 있고(네, 스트림의 스트리밍입니다), 다른 로더 출력과 마찬가지로 라우터 캐시에 자연스럽게 결과를 캐싱할 수 있습니다.

```tsx
const getGreeting = createServerFn().handler(async () => {
  return renderToReadableStream(<h1>Hello from the server</h1>);
});

export const Route = createFileRoute('/hello')({
  loader: async () => ({
    greeting: getGreeting(),
  }),
  component: function HelloPage() {
    const { greeting } = Route.useLoaderData();
    return <>{greeting}</>;
  },
});
```

> `/posts/abc`에서 `/posts/xyz`로 이동하면 로더가 다시 실행됩니다. `/posts/abc`로 되돌아가면 Router가 캐싱된 결과를 즉시 제공할 수 있습니다. 이 빠른 뒤로 가기 버튼 경험은 여러분이 이미 사용하고 있는 동일한 로더 캐싱 모델에서 자연스럽게 나옵니다.

### CDN: GET 응답 자체를 캐싱

GET 서버 함수는 내부적으로 여전히 HTTP이기 때문에, CDN 레이어에서 응답 자체를 캐싱할 수도 있습니다.

```tsx
import { createServerFn } from '@tanstack/react-start';
import { renderToReadableStream } from '@tanstack/react-start/rsc';
import { setResponseHeaders } from '@tanstack/react-start/server';

const getGreeting = createServerFn({ method: 'GET' }).handler(async () => {
  setResponseHeaders(
    new Headers({
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control': 'public, max-age=300, durable, stale-while-revalidate=300',
    }),
  );

  return renderToReadableStream(<h1>Hello from the server</h1>);
});
```

이것은 블로그와 문서 콘텐츠에 우리가 여기서 사용하는 것과 동일한 패턴입니다. 브라우저 캐시 규칙은 보수적으로 유지하면서 CDN은 서버 함수 응답을 훨씬 더 공격적으로 캐싱할 수 있습니다.

Start를 사용하면, RSC는 여러분이 이미 사용하고 있는 동일한 데이터 워크플로에 맞아 들어갑니다.

## 보안: 단방향 데이터 흐름

최근 RSC 스택과 관련된 CVE를 보셨을 것입니다.

우리는 의도적으로 `'use server'` 액션을 지원하지 않습니다. 기존의 공격 벡터 때문이기도 하고, 매우 암시적인 네트워크 경계를 만들 수 있기 때문이기도 합니다.

TanStack Start는 `createServerFn`을 통한 명시적인 RPC를 요구합니다. 클라이언트-서버 경계는 의도적이며, 강화된 직렬화, 유효성 검사, 미들웨어 시맨틱을 통해 모든 사용자 입력을 기본적으로 신뢰하지 않는 것으로 취급하도록 권장합니다.

이렇게 하면 통신 패턴이 명시적이기 때문에 공격 표면이 더 작아집니다. 그래도 서버 함수는 다른 API 표면과 마찬가지로 인증, 유효성 검사를 수행하고 의존성을 최신 상태로 유지해야 합니다.

## 전체 스펙트럼

RSC를 프리미티브로 사용하면, TanStack Start는 모든 프론트엔드 유스케이스를 커버합니다. 정말로 모든 유스케이스를 말입니다:

- **완전한 인터랙티브**
  서버 컴포넌트를 전혀 사용하지 않습니다. 클라이언트 우선, SPA 스타일입니다. RSC는 필요할 때 추가하는 최적화이지, 중심에 두고 구축해야 하는 패러다임이 아닙니다. 이것이 오늘날 대부분의 "앱"이 이미 있는 곳입니다.

- **하이브리드**
  정적 셸, 데이터가 많은 영역, 또는 SEO가 중요한 콘텐츠에는 서버 컴포넌트를, 인터랙티비티가 중요한 곳에는 클라이언트 컴포넌트를 사용합니다. "앱"과 "사이트"가 혼합된 프로젝트(제품 + 마케팅)에 특히 잘 맞습니다. 실제로는 "앱" 쪽보다 "사이트" 쪽에 더 자주 도움이 되는 경향이 있습니다.

- **대부분 정적**
  주로 정적 콘텐츠를 서버 사이드에서 RSC로 파싱하고 렌더링하지만, 필요한 곳에 약간의 클라이언트 인터랙티비티가 뿌려진(예: 댓글, 검색, 동적 위젯) 강력하고 하이드레이션된 SPA입니다. 블로그, 문서, 마케팅 페이지를 생각해보세요.

- **완전한 정적**
  빌드 시점에 모든 것을 프리렌더링합니다. HTML만 보내면 됩니다. 하이드레이션이 필요 없다면 여기서는 RSC조차 필요하지 않을 수 있습니다!

**하나의 프레임워크. 하나의 멘탈 모델. 전체 스펙트럼.**<br/>
"인터랙티브 프레임워크"나 "정적 프레임워크"나 "RSC 프레임워크" 중에서 선택할 필요가 없습니다.<br/>
라우트별, 컴포넌트별, 유스케이스별로 패턴을 선택하면 됩니다. 아키텍처가 이 모든 것을 지원합니다. 다시 한번, 여러분의 앱에 무엇이 최선인지는 여러분이 가장 잘 알기 때문입니다.

## TanStack.com에서 확인한 것

분위기로 주장하고 싶지 않았기 때문에, tanstack.com의 콘텐츠가 많은 부분들을 마이그레이션하고 측정했습니다.

결과는 정확히 기대한 대로였고, 동시에 과대광고가 시사하는 것보다는 제한적이었습니다.

가장 좋은 페이지들은 의미 있게 작아졌습니다:

- **블로그 포스트 페이지**는 클라이언트 JS 그래프에서 약 **153 KB gzipped**가 줄었습니다.
- **문서 페이지**는 약 **153 KB gzipped**가 줄었습니다.
- **문서 예제 페이지**는 약 **40 KB gzipped**가 줄었습니다.

그리고 실제 수치도 함께 움직였습니다:

- `/blog/react-server-components`는 Lighthouse에서 **52 -> 74**로 올랐습니다.
  - Total Blocking Time이 **1,200ms -> 260ms**로 감소했습니다.
  - 전송 크기가 **1,101 KiB -> 785 KiB**로 감소했습니다.
- `/router/latest/docs/overview`는 **78 -> 81**로 올랐습니다.
  - Total Blocking Time이 **280ms -> 200ms**로 감소했습니다.
  - 전송 크기가 **917 KiB -> 777 KiB**로 감소했습니다.

이것이 포인트입니다. **무거운 클라이언트 작업이 더 이상 클라이언트로 전송되지 않았습니다**. 마크다운 파싱이 사라졌습니다. 구문 하이라이팅이 사라졌습니다. 브라우저가 더 적은 JavaScript를 받았고 더 적은 작업을 수행했습니다. 부수적인 효과로, 동일한 렌더링 로직의 두 가지 버전을 가지고 다니는 대신 기존의 클라이언트 마크다운과 하이라이팅 경로를 삭제할 수 있었습니다.

하지만 RSC가 성능에 대한 만능 쿠폰은 아닙니다. 일부 랜딩 페이지는 기본적으로 변화가 없었고, 몇몇은 약간 더 나빠지기도 했습니다. 이미 인터랙티브 UI 셸이 지배적인 페이지는 트리 어딘가에 서버 컴포넌트를 끼워 넣었다고 해서 자동으로 빨라지지 않습니다.

이것이 트레이드오프입니다:

- **RSC는 페이지가 콘텐츠 중심이거나, 의존성이 많거나, 둘 다인 경우에 좋습니다**. 문서, 블로그, 마크다운 파이프라인, 구문 하이라이팅, 변경이 드문 콘텐츠, SEO가 중요한 페이지. 이것이 스위트 스팟입니다.
- **RSC는 페이지가 이미 대부분 클라이언트 상태와 인터랙션인 경우에는 유용함이 덜 분명합니다**. 대시보드, 빌더, 장시간 유지되는 앱 세션, 그리고 일부 랜딩 페이지는 실제 클라이언트 사이드 작업을 제거하지 않는 한 효과가 미미하거나 혼합적일 수 있습니다.

이것이 우리가 RSC가 중요하다고 생각하는 이유입니다. 모든 라우트가 서버 컴포넌트가 되어야 해서가 아닙니다. 적합한 곳에서 사용하면 그 효과가 측정 가능하고 미묘하지 않기 때문입니다.

## Composite Components 소개

위의 모든 것은 그 자체로 완결됩니다. TanStack Start가 RSC를 fetch 가능하고, 캐싱 가능하고, 렌더링 가능한 데이터로 취급하는 것만 했더라도, 이미 RSC를 위한 더 나은 기반이라고 생각했을 것입니다.

하지만 우리는 하나의 질문을 계속 파고들었습니다: 서버가 UI의 클라이언트 형태의 모든 부분을 결정할 필요가 없다면 어떨까?

이것이 완전히 새로운 것을 만들게 이끌었습니다: **Composite Components**.

`use client`는 서버가 의도적으로 클라이언트 컴포넌트를 렌더링하고자 할 때 TanStack Start에서 동일한 방식으로 동작합니다. `use server`는 그렇지 않습니다. Start는 대신 명시적인 [Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)를 사용합니다.

Composite Components는 `use client`를 대체하는 것이 아닙니다. 반대 방향에서 유사한 합성 문제를 해결합니다. 서버가 어떤 클라이언트 컴포넌트를 어디에 렌더링할지 결정하는 대신, 서버가 접합 지점(join points)을 열어두고 클라이언트가 트리를 소유하며 무엇을 채울지 결정하게 할 수 있습니다.

이것이 우리에게 진정으로 새롭게 느껴지는 부분입니다.

### 하나의 컴포넌트 내부의 슬롯

Composite Component는 서버 UI를 렌더링하면서 클라이언트 콘텐츠를 위한 **슬롯(slots)**을 노출할 수 있습니다. 슬롯은 여러분이 이미 알고 있는 일반 React 패턴을 사용합니다:

- `children`
- render props (`renderPostActions`처럼)

클라이언트가 컴포넌트 트리를 소유하기 때문에, 슬롯에 전달하는 컴포넌트는 일반 클라이언트 컴포넌트입니다. `'use client'` 디렉티브가 필요하지 않습니다. 서버는 이들을 불투명한 플레이스홀더로 배치하지만 검사, 복제, 변환할 수 없습니다. 이것이 포인트입니다: 서버는 "여기에 무언가가 들어갑니다"라고 요청할 수 있지만, 그 무언가가 무엇인지 알 필요는 없습니다.

#### 서버

```tsx
import { createCompositeComponent } from '@tanstack/react-start/rsc';

const getPost = createServerFn().handler(async ({ data }) => {
  const post = await db.posts.get(data.postId);

  const src = await createCompositeComponent(
    (props: {
      children?: React.ReactNode;
      renderPostActions?: (data: { postId: string; authorId: string }) => React.ReactNode;
    }) => (
      <article>
        <h1>{post.title}</h1>
        <p>{post.body}</p>

        {/* 서버가 이 링크를 직접 렌더링 */}
        <Link to="/posts/$postId" params={{ postId: post.nextPostId }}>
          Next Post
        </Link>

        {/* 슬롯: 서버가 여기에 클라이언트 UI를 요청 */}
        <footer>
          {props.renderPostActions?.({
            postId: post.id,
            authorId: post.authorId,
          })}
        </footer>

        {/* 슬롯: 클라이언트가 children으로 이곳을 채움 */}
        {props.children}
      </article>
    ),
  );

  return { src };
});
```

#### 클라이언트

```tsx
import { CompositeComponent } from '@tanstack/react-start/rsc';

function PostPage({ postId }) {
  const { data } = useSuspenseQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost({ data: { postId } }),
  });

  return (
    <CompositeComponent
      src={data.src}
      renderPostActions={({ postId, authorId }) => (
        // 완전한 클라이언트 인터랙티비티: hooks, state, context
        <PostActions postId={postId} authorId={authorId} />
      )}
    >
      <Comments postId={postId} />
    </CompositeComponent>
  );
}
```

서버는 `<Link>`를 직접 렌더링하고 클라이언트를 위한 접합 지점을 남겨둡니다:

- 서버가 제공한 인자와 함께 `<PostActions>`를 위한 `renderPostActions` 슬롯
- `<Comments>`를 위한 `children` 슬롯

슬롯 이름은 그저 props입니다. `renderPostActions`는 예제 코드이지, 특별한 API 구문이 아닙니다.

Composite Component는 여전히 데이터이므로, 클라이언트는 이를 빌딩 블록으로도 취급할 수 있습니다:

- 새로운 트리에서 여러 프래그먼트를 인터리빙
- 클라이언트 프로바이더나 레이아웃으로 감싸기
- 슬롯을 통해 중첩
- 클라이언트 상태에 따라 재정렬하거나 교체

일반적인 React 합성과 동일한 멘탈 모델입니다. 차이점은 서버가 더 이상 트리의 모든 흥미로운 부분을 미리 결정할 필요가 없다는 것입니다.

## 현재 상태: Experimental

RSC 지원은 TanStack Start RC에서 실험적이며, 초기 v1까지 실험적으로 유지될 것입니다.

**직렬화**: 이 릴리스는 React의 네이티브 Flight 프로토콜을 사용합니다. TanStack Start의 일반적인 직렬화 기능은 현재 서버 컴포넌트 내에서 사용할 수 없습니다.

**API 표면**: 현재 헬퍼는 사용하기에 충분히 안정적이지만, 기능이 실험적인 동안 개선을 기대해 주세요. API가 발전함에 따라 문서도 최신 상태로 유지될 것입니다.

거친 부분이 있다면, [이슈를 열거나](https://github.com/tanstack/router/issues) [Discord](https://tlinz.com/discord)에 참여해 주세요.

## FAQ

질문을 받습니다. 여기 답변이 있습니다.

### Next.js App Router와 어떻게 비교되나요?

Next.js App Router는 서버 우선입니다: 컴포넌트 트리가 기본적으로 서버에 존재하고, `'use client'`로 클라이언트 인터랙티비티에 옵트인합니다.

TanStack Start는 **아이소모픽 우선(isomorphic-first)**입니다: 트리는 의미가 있는 곳 어디에든 존재합니다. 기본 수준에서 RSC 출력은 전체 트리를 소유하는 대신, 의미 있는 곳에서 fetch, 캐싱, 렌더링할 수 있습니다. 더 나아가고 싶다면, Composite Components를 통해 서버 소유의 트리를 그대로 받아들이는 대신 클라이언트가 최종 트리를 조립할 수 있습니다.

### Next.js나 Remix에서 사용할 수 있나요?

직접적으로는 안 됩니다—TanStack Start는 자체 프레임워크입니다. 하지만 이미 TanStack Query나 Router를 사용하고 있다면, 멘탈 모델은 그대로 이전됩니다.

### RSC를 꼭 사용해야 하나요?

아닙니다. RSC는 완전히 옵트인입니다. 완전한 클라이언트 사이드 라우트(`ssr: false` 포함)를 구축할 수도 있고, 서버 컴포넌트 없이 전통적인 SSR을 사용하거나, 완전히 정적으로 갈 수도 있습니다.

RSC는 도구 상자의 또 다른 도구이지, 새로운 필수적인 중심축이 아닙니다.

### 전체 기술 문서는 어디서 볼 수 있나요?

[Server Components 문서](https://tanstack.com/start/latest/docs/framework/react/guide/server-components)를 확인하세요. 설정, 헬퍼 API, 예제, 제약 사항, 그리고 이 글에서 의도적으로 생략한 저수준 세부 사항들이 다뤄져 있습니다.

### 보안은 어떤가요?

위의 [보안: 단방향 데이터 흐름](https://tanstack.com/blog/react-server-components#security-one-way-data-flow) 섹션을 참고하세요. 짧게 말하면: TanStack Start의 아키텍처는 클라이언트에서 Flight 데이터를 파싱하지 않으므로, 다른 RSC 프레임워크에 영향을 미치는 최근 CVE가 여기에는 적용되지 않습니다.

---

## 나만의 RSC, 나만의 방식으로

이 글은 간단한 아이디어에서 시작했습니다: 여러분의 애플리케이션 아키텍처에 무엇이 최선인지는 여러분이 가장 잘 압니다. 그래서 우리는 TanStack Start의 RSC 모델을 규범적이지 않고 유연하게 유지하도록 만들었습니다.

생태계의 너무 많은 부분이 RSC를 앱 아키텍처가 되어야 하는 것처럼 취급합니다. 우리는 RSC가 프리미티브로서 더 잘 동작한다고 생각합니다. 그리고 더 나아가고 싶다면, Composite Components가 대부분의 RSC 시스템이 시도조차 하지 않는 합성 모델을 열어줍니다. 완전한 인터랙티브 SPA를 원하시나요? 그렇게 하세요. 무거운 작업을 위해 서버 컴포넌트를 뿌리고 싶으시나요? 쉽습니다. 완전한 정적으로 가고 싶으시나요? 그것도 됩니다. 아키텍처가 이 모든 것을 지원합니다. 여러분의 앱은 획일적이지 않으니까, 프레임워크도 그래서는 안 됩니다.

TanStack Start의 RSC 모델은 현재 실험적 기능으로 사용 가능합니다. 여러분이 이것으로 무엇을 만들지 기대됩니다.

- [Server Components Docs](https://tanstack.com/start/latest/docs/framework/react/guide/server-components)
- [GitHub](https://github.com/tanstack/router)
- [Discord](https://tlinz.com/discord)

함께 멋진 것을 만들어 봅시다.
