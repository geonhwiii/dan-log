---
title: '[번역] ReactQuery Advanced Server Rendering'
summary: '리액트 쿼리 서버 렌더링 심화'
date: '02 18 2024'
draft: false
tags:
  - 번역
  - React Query
  - Server Rendering
---

> 원문 : https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr

고급 서버 렌더링 가이드에 오신 것을 환영합니다. 이 가이드에서는 스트리밍, 서버 컴포넌트 및 Next.js 앱 라우터와 함께 React 쿼리를 사용하는 모든 것을 배울 수 있습니다.

이 가이드에 앞서 서버 렌더링 및 하이드레이션 가이드를 읽어보시는 것이 좋으며, 이 가이드에서는 SSR과 함께 React Query를 사용하기 위한 기본 사항을 설명하고 성능 및 요청 워터폴과 프리페칭 및 라우터 통합에 대해서도 유용한 배경 지식을 담고 있습니다.

시작하기 전에 SSR 가이드에 설명된 초기데이터 접근 방식은 서버 컴포넌트에서도 작동하지만, 이 가이드에서는 하이드레이션 API에 초점을 맞출 것입니다.

## 서버 컴포넌트 및 Next.js 앱 라우터

여기서는 서버 컴포넌트에 대해 자세히 다루지는 않겠지만, 간단히 설명하자면 서버 컴포넌트는 초기 페이지와 페이지 전환 모두에서 서버에서만 실행되도록 보장되는 컴포넌트라고 할 수 있습니다.
이는 `Next.js getServerSideProps/getStaticProps` 및 `Remix loader`의 작동 방식과 유사합니다. 이들 역시 항상 서버에서 실행되지만 데이터만 반환할 수 있는 반면, 서버 컴포넌트는 훨씬 더 많은 작업을 수행할 수 있기 때문입니다. 하지만 데이터 부분은 React Query의 핵심이므로 여기서는 데이터에 집중해 보겠습니다.

서버 렌더링 가이드에서 [프레임워크 로더에서 미리 가져온 데이터를 앱에 전달하는 것](https://tanstack.com/query/latest/docs/framework/react/guides/ssr#using-the-hydration-apis)에 대해 배운 내용을 어떻게 서버 컴포넌트와 Next.js 앱 라우터에 적용할 수 있을까요? 이에 대해 생각하는 가장 좋은 방법은 서버 컴포넌트를 "그저" 또 다른 프레임워크 로더로 간주하는 것입니다.

### 용어에 대한 간단한 참고 사항

지금까지 이 가이드에서는 서버와 클라이언트에 대해 이야기했습니다. 혼동하기 쉽지만 서버 컴포넌트와 클라이언트 컴포넌트는 1:1 일치하지 않는다는 점에 유의하세요. 서버 컴포넌트는 서버에서만 실행되도록 보장되지만 클라이언트 컴포넌트는 실제로 두 곳 모두에서 실행될 수 있습니다. 그 이유는 초기 서버 렌더링 패스 중에도 렌더링할 수 있기 때문입니다.

이를 한 가지 방법으로 생각하면 서버 컴포넌트도 렌더링하지만 '로더 단계'(항상 서버에서 발생)에서 발생하는 반면 클라이언트 컴포넌트는 '애플리케이션 단계'에서 실행된다고 생각할 수 있습니다. 해당 애플리케이션은 SSR 중에 서버에서 실행될 수도 있고 브라우저에서 실행될 수도 있습니다. 애플리케이션이 정확히 어디에서 실행되는지, SSR 중에 실행되는지 여부는 프레임워크마다 다를 수 있습니다.

### 초기 설정

React 쿼리 설정의 첫 번째 단계는 항상 `queryClient`를 생성하고 애플리케이션을 `QueryClientProvider` 로 감싸는 것입니다. 서버 컴포넌트를 사용하면 프레임워크에서 대부분 동일하게 보이지만, 한 가지 차이점은 파일 이름 규칙입니다:

```tsx
// app/providers.jsx
'use client';

// 서버 컴포넌트에서는 useState나 useRef를 사용할 수 없으므로 이 부분을
// 이 부분을 자체 파일로 추출하고 그 위에 'use client'를 추가합니다.
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // SSR을 사용하면 일반적으로 기본 staleTime을
            // 0 이상으로 설정하여 클라이언트에서 즉시 리프레시되지 않도록 합니다.
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

```tsx
// app/layout.jsx
import Providers from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

이 부분은 SSR 가이드에서 했던 것과 매우 유사하며, 두 개의 다른 파일로 나누기만 하면 됩니다.

### prefetching과 de/hydrating data

이제 실제로 데이터를 `prefetch`하고 데이터를 `de/hydrating`을 살펴보겠습니다. 다음은 `Next.js Page Router`를 사용한 모습입니다:

```tsx
// pages/posts.jsx
import { dehydrate, HydrationBoundary, QueryClient, useQuery } from '@tanstack/react-query'

// getServerSideProps도 될 수 있습니다.
export async function getStaticProps() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

function Posts() {
  // 이 useQuery는 더 깊은 하위 자식에서도 발생할 수 있습니다.
  // <PostsRoute>에서 발생할 수도 있으며, 어느 쪽이든 데이터를 즉시 사용할 수 있습니다.
  //
  // 여기서는 useSuspenseQuery 대신 useQuery를 사용하고 있다는 점에 유의하세요.
  // 이 데이터는 이미 prefetch되었으므로 컴포넌트 자체에서 일시 중단할 필요가 없습니다.
  // 만약 우리가 prefetch를 깜빡하거나 제거하면, 대신 클라이언트에서 데이터를 가져오고
  // useSuspenseQuery를 사용하면 더 나쁜 부작용이 발생했을 것입니다.
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })

  // 이 쿼리는 서버에서 prefetch되지 않았으며 클라이언트에서 시작될 때까지
  // fetch를 시작하지 않으며, 클라이언트에서는 두 패턴을 혼합해도 괜찮습니다.
  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  })

  // ...
}

export default PostsRoute({ dehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Posts />
    </HydrationBoundary>
  )
}
```

이것을 `App Router`로 변환하는 것은 실제로 매우 비슷해 보이지만, 약간의 이동만 하면 됩니다. 먼저 서버 컴포넌트를 생성하여 prefetching 부분을 수행하겠습니다:

```tsx
// app/posts/page.jsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import Posts from './posts';

export default async function PostsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  return (
    // 깔끔해졌어요! 이제 props를 전달하는 것만큼이나 직렬화가 쉬워졌습니다.
    // HydrationBoundary는 클라이언트 컴포넌트이므로 거기서 수화가 이루어집니다.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
    </HydrationBoundary>
  );
}
```

다음으로 클라이언트 컴포넌트 부분은 어떤 모습인지 살펴보겠습니다:

```tsx
// app/posts/posts.jsx
'use client';

export default function Posts() {
  // 이 useQuery는 <Posts>의 더 깊은 자식에서도 잘 동작하고,
  // 어느 쪽이든 데이터를 즉시 사용할 수 있습니다.
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts });

  // 이 쿼리는 서버에서 prefetch되지 않았으며, 클라이언트 렌더링 이전에 시작되지 않습니다.
  // 두 패턴을 혼합해도 괜찮습니다.
  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  });

  // ...
}
```

위의 예제에서 한 가지 깔끔한 점은 여기서 Next.js와 관련된 것은 파일 이름뿐이며, 다른 모든 것은 서버 컴포넌트를 지원하는 다른 프레임워크에서 동일하게 보인다는 점입니다.

SSR 가이드에서 모든 경로에 `<HydrationBoundary>`가 있어야 하는 상용구를 없앨 수 있다고 언급했습니다. 서버 컴포넌트에서는 이것이 불가능합니다.

> 참고: TypeScript 버전이 5.1.3 미만인 비동기 서버 컴포넌트와 18.2.8 미만인 @types/react 버전을 사용하는 동안 유형 오류가 발생하는 경우, 두 가지 모두 최신 버전으로 업데이트하는 것이 좋습니다. 또는 다른 컴포넌트 내에서 이 컴포넌트를 호출할 때 `{/* @ts-expect-error Server Component */}`를 추가하는 임시 해결 방법을 사용할 수 있습니다. 자세한 내용은 Next.js 13 문서에서 [비동기 서버 컴포넌트 타입스크립트 오류](https://nextjs.org/docs/app/building-your-application/configuring/typescript#async-server-component-typescript-error)를 참조하세요.

### 중첩 서버컴포넌트

서버 컴포넌트의 좋은 점은 중첩될 수 있고 React 트리의 여러 레벨에 존재할 수 있기 때문에 (리믹스 로더처럼) 애플리케이션의 최상단이 아닌 실제로 사용되는 위치에 더 가깝게 데이터를 `prefetch`할 수 있다는 점입니다. 이는 서버 컴포넌트가 다른 서버 컴포넌트를 렌더링하는 것처럼 간단할 수 있습니다. (이 예제에서는 간결함을 위해 클라이언트 컴포넌트는 생략하겠습니다):

```tsx
// app/posts/page.jsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import Posts from './posts';
import CommentsServerComponent from './comments-server';

export default async function PostsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
      <CommentsServerComponent />
    </HydrationBoundary>
  );
}

// app/posts/comments-server.jsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import Comments from './comments';

export default async function CommentsServerComponent() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Comments />
    </HydrationBoundary>
  );
}
```

보시다시피, 여러 곳에서 `<HydrationBoundary>`를 사용하고 `prefetching`을 위해 여러 `queryClient`를 생성하고 `dehydrate`하는 것은 완벽하게 괜찮습니다.

`comment` 서버 컴포넌트를 렌더링하기 전에 `getPosts`를 기다리기 때문에 서버 측 워터폴이 발생할 수 있다는 점에 유의하세요.

```bash
1. |> getPosts()
2.   |> getComments()
```

데이터에 대한 서버 지연 시간이 짧다면 큰 문제가 되지 않을 수 있지만 여전히 지적할 가치가 있습니다.

Next.js에서는 `page.tsx`에서 데이터를 `prefetching`하는 것 외에도 `layout.tsx`와 [병렬 라우트](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)에서도 `prefetching`을 수행할 수 있습니다. 이 모든 것이 라우팅의 일부이기 때문에 Next.js는 이 모든 것을 병렬로 가져오는 방법을 알고 있습니다. 따라서 위의 `CommentsServerComponent`를 병렬 경로로 대신 표현하면 워터폴이 자동으로 평탄화됩니다.

더 많은 프레임워크가 서버 컴포넌트를 지원하기 시작하면 다른 라우팅 규칙을 가질 수 있습니다. 자세한 내용은 프레임워크 문서를 참조하세요.

### 대안: 단일 queryClient를 사용하여 prefetch하기

위의 예에서는 데이터를 가져오는 각 서버 컴포넌트에 대해 새로운 queryClient를 생성합니다. 이것이 권장되는 방법이지만, 원한다면 모든 서버 컴포넌트에서 재사용되는 단일 컴포넌트를 만들 수도 있습니다:

```tsx
// app/getQueryClient.jsx
import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

// catch()는 요청별로 범위가 지정되므로 요청 간에 데이터가 유출되지 않습니다.
const getQueryClient = cache(() => new QueryClient());
export default getQueryClient;
```

이 방법의 장점은 유틸리티 함수를 포함하여 서버 컴포넌트에서 호출되는 모든 곳에서 `getQueryClient()`를 호출하여 이 클라이언트를 가져올 수 있다는 것입니다. 단점은 `dehydrate(getQueryClient())`를 호출할 때마다 이전에 이미 직렬화된 적이 있고 현재 서버 컴포넌트와 관련이 없는 쿼리를 포함하여 전체 `queryClient`를 직렬화하므로 불필요한 오버헤드가 발생한다는 것입니다.

Next.js는 이미 `fetch()`를 사용하는 요청을 중복 제거하지만, `queryFn`에서 다른 것을 사용하거나 이러한 요청을 자동으로 중복 제거하지 않는 프레임워크를 사용하는 경우 위에서 설명한 대로 단일 `queryClient`를 사용하는 것이 중복된 직렬화에도 불구하고 합리적일 수 있습니다.

> 향후 개선 사항으로, 마지막으로 `dehydrateNew()`를 호출한 이후 새로 생성된 쿼리만 `dehydrate`하는 `dehydrateNew()` 함수(이름 보류 중)를 만드는 것을 검토할 수 있습니다. 이 기능이 흥미롭고 도움이 될 것 같으면 언제든지 연락해 주세요!

### 데이터 소유권 및 재검증(revalidation)

서버 컴포넌트에서는 데이터 소유권 및 재검증에 대해 생각해 보는 것이 중요합니다. 그 이유를 설명하기 위해 위에서 수정한 예제를 살펴보겠습니다:

```tsx
// app/posts/page.jsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import Posts from './posts';

export default async function PostsPage() {
  const queryClient = new QueryClient();

  // 이번에는 fetchQuery()를 사용하고 있습니다
  const posts = await queryClient.fetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* 새로운 부분 */}
      <div>Nr of posts: {posts.length}</div>
      <Posts />
    </HydrationBoundary>
  );
}
```

이제 서버 컴포넌트와 클라이언트 컴포넌트 모두에서 `getPosts` 쿼리의 데이터를 렌더링하고 있습니다. 초기 페이지 렌더링에는 문제가 없지만 어떤 이유로 클라이언트에서 `staleTime`이 전달되었을 때 쿼리의 유효성을 다시 검사하면 어떻게 될까요?

React Qeury는 서버 컴포넌트의 유효성을 재검증하는 방법을 모르기 때문에 클라이언트에서 데이터를 다시 가져와서 React가 게시물 목록을 다시 렌더링하게 되면 게시물 수(Nr)가 달라집니다: `{posts.length}`가 동기화되지 않게 됩니다.

`staleTime: Infinity`로 설정하여 React Query가 재검증하지 않도록 하면 괜찮지만, 애초에 React Query를 사용하려는 목적이 아니라면 이는 원치 않을 수 있습니다.

서버 컴포넌트와 함께 React Query를 사용하는 것은 다음과 같은 경우에 가장 적합합니다:

- React Query를 사용하는 앱이 있고 모든 데이터 요청을 `rewriting`하지 않고 서버 컴포넌트로 마이그레이션하려는 경우
- 익숙한 프로그래밍 패러다임을 원하지만 서버 컴포넌트의 이점을 가장 적합한 곳에 뿌리고 싶은 경우
- React Query가 다루지만 선택한 프레임워크가 다루지 않는 사례가 있는 경우

React Query를 서버 컴포넌트와 함께 사용하는 것이 좋은 경우와 그렇지 않은 경우에 대해 일반적인 조언을 하기는 어렵습니다. **새로운 서버 컴포넌트 앱을 막 시작하는 경우, 프레임워크에서 제공하는 데이터 불러오기 도구로 시작하고 실제로 필요할 때까지 React Query를 가져오지 않는 것이 좋습니다.** 그럴 일은 없을 수도 있지만, 작업에 적합한 도구를 사용해도 괜찮습니다!

React Query의 관점에서 서버 컴포넌트는 데이터를 `prefetch`하는 장소로만 취급하세요.

물론 서버 컴포넌트가 일부 데이터를 소유하고 클라이언트 컴포넌트가 다른 데이터를 소유하는 것도 괜찮지만, 이 두 현실이 동기화되지 않도록 하세요.

## 서버 컴포넌트를 사용한 스트리밍

Next.js 앱 라우터는 애플리케이션에서 표시할 준비가 된 모든 부분을 가능한 한 빨리 브라우저로 자동 스트리밍하므로 아직 보류 중인 콘텐츠를 기다릴 필요 없이 완성된 콘텐츠를 즉시 표시할 수 있습니다. 이 작업은 `<Suspense>` 경계선을 따라 수행됩니다. `loading.tsx` 파일을 만들면 자동으로 `<Suspence>` 경계가 생성됩니다.

위에서 설명한 프리페칭 패턴을 사용하면 React Query는 이러한 형태의 스트리밍과 완벽하게 호환됩니다. 각 `Suspense boundary`에 대한 데이터가 해결되면 Next.js는 완성된 콘텐츠를 렌더링하여 브라우저로 스트리밍할 수 있습니다. 이는 위에서 설명한 대로 useQuery를 사용하는 경우에도 작동하는데, prefetch를 기다릴 때 실제로 일시 중단이 발생하기 때문입니다.

지금은 모든 prefetch를 기다려야 이 기능이 작동한다는 점에 유의하세요. 즉, 모든 prefetch는 중요한 콘텐츠로 간주되어 `Suspense boundary`를 차단합니다.

여담이지만, 앞으로는 이 `Suspense boundary`에 중요하지 않은 `'선택적 prefetch'`에 대한 대기를 건너뛸 수 있을 것입니다. 이렇게 하면 전체 `Suspense boundary`를 차단하지 않고도 가능한 한 빨리 prefetch를 시작하고 쿼리가 완료되면 데이터를 클라이언트로 스트리밍할 수 있습니다. 예를 들어 일부 사용자 상호 작용 후에만 표시되는 일부 콘텐츠를 prefetch하거나, 무한 쿼리의 첫 페이지를 기다렸다가 렌더링하되 렌더링을 차단하지 않고 2페이지부터 prefetch를 시작하려는 경우에 유용할 수 있습니다.

## Next.js에서 prefetching 없는 실험적 스트리밍

위에서 설명한 prefetching 솔루션은 초기 페이지 로드와 이후 페이지 탐색 모두에서 요청 워터폴을 평탄화하므로 권장하지만, prefetching을 완전히 건너뛰고 스트리밍 SSR을 계속 작동시키는 실험적인 방법이 있습니다: `@tanstack/react-query-next-experimental`

이 패키지를 사용하면 컴포넌트에서 `useSuspenseQuery`를 호출하여 서버(클라이언트 컴포넌트)에서 데이터를 가져올 수 있습니다. 그러면 `SuspenseBoundaries`가 해결되면서 결과가 서버에서 클라이언트로 스트리밍됩니다. `<Suspense>` 바운더리로 래핑하지 않고 `useSuspenseQuery`를 호출하면 가져오기가 해결될 때까지 HTML 응답이 시작되지 않습니다. 이는 상황에 따라 원하는 것일 수 있지만 `TTFB`가 손상될 수 있다는 점에 유의하세요.

이를 위해 앱을 `ReactQueryStreamedHydration` 컴포넌트로 래핑하세요:

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // 서버: 항상 새로운 queryClient를 생성
    return makeQueryClient();
  } else {
    // 브라우저: 아직 클라이언트가 없는 경우 새 쿼리 클라이언트를 만듭니다.
    // 아직 클라이언트가 없는 경우 새 쿼리 클라이언트를 만듭니다.
    // 이것은 매우 중요하므로 초기 렌더링 중에 React가 suspend하는 경우 새 클라이언트를 다시 만들지 않습니다.
    // 쿼리 클라이언트 생성 하위에 suspense boundary가 있는 경우 필요하지 않을 수 있습니다.
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers(props: { children: React.ReactNode }) {
  // NOTE: 이 코드와 suspend될 수 있는 코드 사이에 suspense boundary가 없다면
  // queryClient를 초기화할 때 useState를 사용하지 마십시오.
  // 리액트는 렌더링이 일시 중단되고 경계가 없는 경우 클라이언트를 버립니다.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>{props.children}</ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
}
```

자세한 내용은 [NextJs Suspense Streaming Example](https://tanstack.com/query/latest/docs/framework/react/examples/nextjs-suspense-streaming).를 확인하세요.

가장 큰 장점은 더 이상 수동으로 쿼리를 prefetch할 필요가 없으며, 결과도 스트리밍된다는 점입니다!
이를 통해 경이로운 DX와 코드 복잡성을 줄일 수 있습니다.

성능 및 요청 워터폴 가이드의 복잡한 요청 워터폴 예시를 다시 살펴보면 단점을 가장 쉽게 설명할 수 있습니다. prefetching을 사용하는 서버 컴포넌트는 초기 페이지 로드와 이후의 탐색 모두에서 요청 워터폴을 효과적으로 제거합니다. 그러나 prefetching을 사용하지 않는 접근 방식은 초기 페이지 로드 시 워터폴을 평평하게 만들 뿐, 페이지 탐색 시에는 원래 예시와 마찬가지로 깊은 워터폴이 됩니다:

```bash
1. |> JS for <Feed>
2.   |> getFeed()
3.     |> JS for <GraphFeedItem>
4.       |> getGraphDataById()
```

최소한 데이터 및 코드 요청을 병렬화할 수 있기 때문에 `getServerSideProps/getStaticProps`를 사용하는 것보다 훨씬 더 나쁩니다.

성능보다 코드 복잡성이 낮은 `DX/iteration/shipping speed`를 중요하게 생각하거나, 쿼리가 깊게 중첩되어 있지 않거나, `useSuspenseQueries`와 같은 도구를 사용하여 병렬 가져오기로 요청 워터폴을 처리하는 경우라면 이 방법이 좋은 절충안이 될 수 있습니다.

두 가지 접근 방식을 결합하는 것도 가능할 수 있지만 아직 시도해 보지는 않았습니다. 이 방법을 시도해 보신다면 결과를 보고해 주시거나 이 문서에 몇 가지 팁을 업데이트해 주세요!

> **_두 가지 접근 방식을 결합하는 것이 가능할 수도 있지만 아직 시도해 본 적은 없습니다. 이 방법을 시도해 보신다면 결과를 보고해 주시거나 몇 가지 팁을 추가하여 이 문서를 업데이트해 주세요!_**

## 마지막 한마디

서버 컴포넌트와 스트리밍은 아직 상당히 새로운 개념이며, React Query를 어떻게 적용하고 API를 개선할 수 있는지 계속 파악하고 있습니다. 제안, 피드백, 버그 보고를 환영합니다!

마찬가지로, 이 새로운 패러다임의 모든 복잡성을 한 번에 하나의 가이드에 모두 담는다는 것은 불가능합니다. 여기에 누락된 정보가 있거나 이 콘텐츠를 개선할 수 있는 방법에 대한 제안이 있다면 아래의 'Edit on GitHub' 버튼을 클릭해 도움을 주세요.
