---
title: '[번역] Common mistakes with the Next.js App Router and how to fix them (2)'
summary: 'Next.js 앱 라우터의 일반적인 실수 및 해결 방법 (2)'
date: '01 30 2024'
draft: false
tags:
  - 번역
  - Next.js
  - App Router
---

> 원문 : https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them

## 7. 서버 및 클라이언트 컴포넌트 함께 사용하기

많은 React 및 Next.js 개발자가 서버 및 클라이언트 컴포넌트를 처음 사용하는 방법을 배우고 있습니다. 이 새로운 모델을 배우는 과정에서 실수도 있을 수 있고, 배울 기회도 있을 것으로 예상됩니다!

예를 들어 다음 페이지를 생각해 보세요:

```tsx
// app/page.tsx
export default function Page() {
  return (
    <section>
      <h1>My Page</h1>
    </section>
  );
}
```

이것은 서버 컴포넌트입니다. 컴포넌트에서 [직접 데이터를 가져올 수 있는 것](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating) 과 같은 새로운 기능이 제공되지만, 특정 클라이언트 측 React [기능을 사용할 수 없다](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns) 는 의미이기도 합니다.

예를 들어 카운터인 버튼을 만든다고 가정해 봅시다. 이 버튼은 상단에 "use client" 지시어가 표시된 새로운 클라이언트 컴포넌트 파일이어야 합니다:

```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

그런 다음 페이지에서 이 컴포넌트를 가져와서 사용할 수 있습니다:

```tsx
// app/page.tsx
import { Counter } from './counter';

export default function Page() {
  return (
    <section>
      <h1>My Page</h1>
      <Counter />
    </section>
  );
}
```

페이지는 서버 컴포넌트이고 `<Counter>`는 클라이언트 컴포넌트입니다. 멋지네요! 카운터보다 트리에서 아래쪽에 있는 컴포넌트는 어떨까요? 그것도 서버 컴포넌트가 될 수 있을까요? 예, 구성을 통해 가능합니다:

```tsx
// app/page.tsx
import { Counter } from './counter';

function Message() {
  return <p>This is a Server Component</p>;
}

export default function Page() {
  return (
    <section>
      <h1>My Page</h1>
      <Counter>
        <Message />
      </Counter>
    </section>
  );
}
```

클라이언트 컴포넌트의 자식도 서버 컴포넌트가 될 수 있습니다! 업데이트된 카운터는 다음과 같습니다:

```tsx
// app/counter.tsx
'use client';

import { useState } from 'react';

export function Counter({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      {children}
    </div>
  );
}
```

## 8. 불필요하게 `"use client"` 추가하기

앞의 예시를 바탕으로 모든 곳에 `"use client"` 지시문을 추가해야 한다는 뜻일까요?

`"use client"` 지시문을 추가하면 "클라이언트 경계"로 넘어가 클라이언트 측 JavaScript를 실행할 수 있습니다(예: React 훅 또는 상태 사용). 클라이언트 컴포넌트는 여전히 [서버에서 미리 렌더링](https://github.com/reactwg/server-components/discussions/4)되며, 이는 Next.js 페이지 라우터의 컴포넌트와 유사합니다.

이미 클라이언트 경계에 있으므로 `<Counter>`의 형제자매는 클라이언트 컴포넌트가 됩니다.
모든 파일에`"use client"` 를 추가할 필요는 없습니다. 이는 [앱 라우터의 점진적 채택](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration) 을 위해 취한 접근 방식일 수 있는데, 트리의 위쪽에 있는 컴포넌트가 클라이언트 컴포넌트가 되고 아래쪽에 있는 자식 서버 컴포넌트를 위빙하는 방식입니다.

## 9. mutation 이후 데이터 재검증 안 함

Next.js 앱 라우터에는 [데이터 가져오기, 캐싱, 재검증](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)에 대한 완전한 모델이 포함되어 있습니다. 개발자들이 여전히 이 새로운 모델을 학습하고 있고 피드백을 바탕으로 계속 개선하고 있기 때문에, 제가 본 일반적인 실수 중 하나는 변경 후 데이터의 유효성을 다시 검사하는 것을 잊어버리는 것입니다.

예를 들어 다음 서버 컴포넌트를 생각해 보세요. 이 컴포넌트는 [Server Action](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)을 사용하여 제출을 처리하고 [Postgres database](https://vercel.com/docs/storage/vercel-postgres).에 새 항목을 만드는 양식을 표시합니다.

```tsx
// app/page.tsx
export default function Page() {
  async function create(formData: FormData) {
    'use server';

    let name = formData.get('name');
    await sql`INSERT INTO users (name) VALUES (${name})`;
  }

  return (
    <form action={create}>
      <input name="name" type="text" />
      <button type="submit">Create</button>
    </form>
  );
}
```

양식이 제출되고 삽입이 성공적으로 이루어지면 이름 목록을 표시하는 데이터가 자동으로 업데이트되나요?
아니요, Next.js에 지시하지 않는 한 업데이트되지 않습니다. 예를 들어,

```tsx
// app/page.tsx
import { revalidatePath } from 'next/cache';

export default async function Page() {
  let names = await sql`SELECT * FROM users`;

  async function create(formData: FormData) {
    'use server';

    let name = formData.get('name');
    await sql`INSERT INTO users (name) VALUES (${name})`;

    revalidatePath('/');
  }

  return (
    <section>
      <form action={create}>
        <input name="name" type="text" />
        <button type="submit">Create</button>
      </form>
      <ul>
        {names.map((name) => (
          <li>{name}</li>
        ))}
      </ul>
    </section>
  );
}
```

## 10 . try/catch 블록 내부 리디렉션

서버 컴포넌트 또는 서버 작업과 같은 서버 측 코드를 실행할 때 리소스를 사용할 수 없거나 변경에 성공한 후 [리디렉션](https://nextjs.org/docs/app/api-reference/functions/redirect)을 수행해야 할 수 있습니다.

`redirect()` 함수는 TypeScript `never` 타입을 사용하므로 `return redirect()`를 사용할 필요가 없습니다. 또한 내부적으로 이 함수는 Next.js 관련 오류를 발생시킵니다. 즉, `try/catch` 블록 외부에서 리디렉션을 처리해야 합니다.

예를 들어 서버 컴포넌트 내부에서 리디렉션을 시도하는 경우 다음과 같이 보일 수 있습니다:

```tsx
// app/page.tsx
import { redirect } from 'next/navigation';

async function fetchTeam(id) {
  const res = await fetch('https://...');
  if (!res.ok) return undefined;
  return res.json();
}

export default async function Profile({ params }) {
  const team = await fetchTeam(params.id);
  if (!team) {
    redirect('/login');
  }

  // ...
}
```

또는 클라이언트 컴포넌트에서 리디렉션을 시도하는 경우 이벤트 핸들러가 아닌 서버 액션 내부에서 리디렉션을 수행해야 합니다:

```tsx
// app/client-redirect.tsx
'use client';

import { navigate } from './actions';

export function ClientRedirect() {
  return (
    <form action={navigate}>
      <input type="text" name="id" />
      <button>Submit</button>
    </form>
  );
}
```

```tsx
// app/actions.ts
'use server';

import { redirect } from 'next/navigation';

export async function navigate(data: FormData) {
  redirect('/posts');
}
```

## 결론

Next.js 앱 라우터는 React 애플리케이션을 구축하기 위한 새로운 접근 방식이며 몇 가지 새로운 개념을 배워야 합니다. 이러한 실수를 저질렀다고 해서 낙심하지 마세요. 저도 모델이 어떻게 작동하는지 배우면서 실수를 저질렀으니까요.

더 많은 것을 배우고 이 지식을 적용하고 싶다면 [Next.js Learn course](https://nextjs.org/learn)을 통해 앱 라우터로 실제 대시보드 애플리케이션을 구축해 보세요.
