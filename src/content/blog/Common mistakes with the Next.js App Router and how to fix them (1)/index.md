---
title: '[번역] Common mistakes with the Next.js App Router and how to fix them (1)'
summary: 'Next.js 앱 라우터의 일반적인 실수 및 해결 방법 (1)'
date: '01 20 2024'
draft: false
tags:
  - 번역
  - Next.js
  - App Router
---

> 원문 : https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them

수백 명의 개발자와 이야기를 나누고 수천 개의 `Next.js` 레포지토리를 살펴본 결과, `Next.js` 를
`App Router`로 빌드할 때 흔히 저지르는 10가지 실수를 발견했습니다.

이 글에서는 이러한 실수가 발생하는 이유와 이를 해결하는 방법, 그리고 새로운 `App Router` 모델을 이해하는 데 도움이 되는 몇 가지 팁을 공유합니다.

## 1. 서버 컴포넌트와 함께 라우트 핸들러 사용

서버 컴포넌트에 대한 다음 코드를 살펴봅시다.

```tsx
// app/page.tsx
export default async function Page() {
  let res = await fetch('http://localhost:3000/api/data');
  let data = await res.json();
  return <h1>{JSON.stringify(data)}</h1>;
}
```

이 `비동기` 컴포넌트는 라우트 핸들러에 요청하여 일부 JSON 데이터를 검색합니다:

```ts
// app/api/data/route.ts
export async function GET(request: Request) {
  return Response.json({ data: 'Next.js' });
}
```

이 접근 방식에는 두 가지 주요 문제가 있습니다:

1. [라우트 핸들러](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)와 [서버 컴포넌트](https://nextjs.org/docs/app/building-your-application/rendering/server-components)는 모두 서버에서 안전하게 실행됩니다. 추가 네트워크 홉이 필요하지 않습니다. 대신 라우트 핸들러 내부에 배치하려는 로직을 서버 컴포넌트에서 직접 호출할 수 있습니다. 이는 외부 API 또는 모든 프로미스일 수 있습니다.
2. 이 코드는 `Node.js`를 사용하여 서버에서 실행되므로 가져오기에 대한 절대 URL과 상대 URL을 제공해야 합니다. 실제로는 `localhost`를 하드코딩하지 않고 현재 환경에 따라 몇 가지 조건부 검사를 수행해야 합니다. 로직을 직접 호출할 수 있으므로 이 작업은 필요하지 않습니다.

대신 다음과 같이 수행하는 것이 좋습니다.

```tsx
// app/page.tsx
export default async function Page() {
  // 비동기 함수를 직접 호출
  let data = await getData(); // { data: 'Next.js' }
  // 또는 외부 API를 직접 호출
  let data = await fetch('https://api.vercel.app/blog');
  // ...
}
```

## 2. 정적 또는 동적 경로 핸들러

라우트 핸들러는 `GET` 메서드를 사용할 때 기본적으로 캐시됩니다. 이는 페이지 라우터와 API 라우트에서 이동하는 기존 Next.js 개발자에게는 종종 혼란을 줄 수 있습니다.

예를 들어 다음 코드는 다음 빌드 중에 미리 렌더링됩니다:

```ts
// app/api/data/route.ts
export async function GET(request: Request) {
  return Response.json({ data: 'Next.js' });
}
```

이 JSON 데이터는 다른 빌드가 완료될 때까지 변경되지 않습니다. 왜 그럴까요?

라우트 핸들러를 페이지의 빌딩 블록이라고 생각하면 됩니다. 경로에 대한 특정 요청에 대해 이를 처리하려고 합니다. Next.js에는 페이지 및 레이아웃과 같은 라우트 핸들러 위에 추가 추상화가 있습니다. 이것이 바로 라우트 핸들러가 [기본적으로 페이지처럼 정적](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#caching)이며 동일한 [ 라우트 세그먼트 구성](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) 옵션을 공유하는 이유입니다.

이 기능은 이전에는 페이지 라우터의 API 라우트에서 사용할 수 없었던 몇 가지 새로운 기능을 제공합니다. 예를 들어, 빌드 중에 계산하여 미리 렌더링할 수 있는 JSON 파일이나 `txt` 파일 또는 실제로 모든 파일을 생성하는 라우트 핸들러를 사용할 수 있습니다. 그러면 정적으로 생성된 파일이 자동으로 캐시되고 원하는 경우 [주기적으로 업데이트](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#revalidating-cached-data)될 수도 있습니다.

```ts
// app/api/data/route.ts
export async function GET(request: Request) {
  let res = await fetch('https://api.vercel.app/blog');
  let data = await res.json();
  return Response.json(data);
}
```

또한 라우트 핸들러는 [정적 내보내기](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)와 호환되므로 정적 파일 호스팅을 지원하는 모든 곳에 Next.js 애플리케이션을 배포할 수 있습니다.

## 3. 라우트 핸들러 및 클라이언트 컴포넌트

클라이언트 컴포넌트는 비동기로 표시할 수 없고 데이터를 가져오거나 변경할 수 없기 때문에 라우트 핸들러를 클라이언트 컴포넌트와 함께 사용해야 한다고 생각할 수 있습니다. 불러오기를 작성하고 라우트 핸들러를 생성할 필요 없이 클라이언트 컴포넌트에서 직접 [서버 액션](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)을 호출할 수 있습니다.

```tsx
// app/user-form.tsx
'use client';

import { save } from './actions';

export function UserForm() {
  return (
    <form action={save}>
      <input type="text" name="username" />
      <button>Save</button>
    </form>
  );
}
```

이는 양식과 이벤트 핸들러 모두에서 작동합니다:

```tsx
// app/user-form.tsx
'use client';

import { save } from './actions';

export function UserForm({ username }) {
  async function onSave(event) {
    event.preventDefault();
    await save(username);
  }

  return <button onClick={onSave}>Save</button>;
}
```

## 4. 서버 컴포넌트와 함께 서스펜스 사용

다음 서버 컴포넌트를 생각해 봅시다. 데이터를 가져오는 동안 표시할 `Fallback UI`를 정의하기 위해 Suspense를 어디에 배치해야 할까요?

```tsx
// app/page.tsx
async function BlogPosts() {
  let data = await fetch('https://api.vercel.app/blog');
  let posts = await data.json();
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <section>
      <h1>Blog Posts</h1>
      <BlogPosts />
    </section>
  );
}
```

페이지 컴포넌트 내부를 추측하셨다면 맞으셨습니다. Suspense 경계는 데이터 불러오기를 수행하는 비동기 컴포넌트보다 높은 곳에 위치해야 합니다. 경계가 비동기 컴포넌트 내부에 있으면 작동하지 않습니다.

```tsx
// app/page.tsx
import { Suspense } from 'react';

async function BlogPosts() {
  let data = await fetch('https://api.vercel.app/blog');
  let posts = await data.json();
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <section>
      <h1>Blog Posts</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <BlogPosts />
      </Suspense>
    </section>
  );
}
```

향후 부분 렌더링을 사용하면 어떤 컴포넌트를 미리 렌더링하고 어떤 컴포넌트를 온디맨드로 실행할지 정의하는 등 이 패턴이 더욱 보편화될 것입니다.

```tsx
import { unstable_noStore as noStore } from 'next/cache';

async function BlogPosts() {
  noStore(); // This component should run dynamically
  let data = await fetch('https://api.vercel.app/blog');
  let posts = await data.json();
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## 5. 수신 요청 사용

서버 컴포넌트에서 들어오는 요청 객체에 [액세스할 수 없기 때문에](https://nextjs.org/docs/app#how-can-i-access-the-request-object-in-a-layout) 들어오는 요청의 일부를 읽는 방법이 명확하지 않을 수 있습니다. 이로 인해 `useSearchParams`와 같은 클라이언트 후크를 불필요하게 사용할 수 있습니다.

서버 컴포넌트에는 들어오는 요청에 액세스할 수 있는 특정 함수와 프롭이 있습니다. 예를 들어

- [`cookies()`](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [`headers()`](https://nextjs.org/docs/app/api-reference/functions/headers)
- [`params`](https://nextjs.org/docs/app/api-reference/file-conventions/page#params-optional)
- [`searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)

```tsx
// app/blog/[slug]/page.tsx
export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <h1>My Page</h1>;
}
```

## 6. 앱 라우터에서 Context Provider 사용

[React 컨텍스트](https://react.dev/reference/react/hooks#context-hooks)를 사용하거나 컨텍스트에 의존하는 외부 의존성을 사용하고 싶을 수 있습니다. 제가 본 두 가지 일반적인 실수는 서버 컴포넌트(지원되지 않음)와 함께 컨텍스트를 사용하려고 하는 것과 앱 라우터에 공급자를 배치하는 것입니다.

서버 컴포넌트와 클라이언트 컴포넌트가 상호 작용할 수 있도록 하려면 `Provider`(또는 여러 `Provider`)를 자식을 소품으로 가져와 렌더링하는 별도의 클라이언트 컴포넌트로 만드는 것이 중요합니다. 예를 들어

```tsx
// app/theme-provider.tsx
'use client';

import { createContext } from 'react';

export const ThemeContext = createContext({});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
}
```

그런 다음 `Provider`를 클라이언트 컴포넌트로 별도의 파일에 저장하면 레이아웃 내에서 이 컴포넌트를 가져와서 사용할 수 있습니다.

```tsx
// app/layout.tsx
import ThemeProvider from './theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

`Provider`가 루트에서 렌더링되면 앱의 다른 모든 클라이언트 컴포넌트가 이 컨텍스트를 사용할 수 있습니다. 특히 이 구성은 트리의 하위에 있는 다른 서버 컴포넌트(페이지 포함)를 여전히 허용합니다.
