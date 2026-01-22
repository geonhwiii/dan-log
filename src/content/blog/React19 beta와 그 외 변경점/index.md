---
title: "React19 beta와 그 외 변경점"
summary: "React 19 beta 변경점"
date: "05 20 2024"
draft: false
tags:
  - React
---

> React 19가 beta로 출시되었습니다. 정식 버전이 출시 되기 전, 간단하게 정리해봅니다.

## 1. Action

### useTransition

기존에 비동기 상태 업데이트를 할 때는 `useState`로 상태를 관리해야했지만, React 19에서는 `useTransition`을 사용해서 `pending`상태를 관리할 수 있습니다.

```tsx
function updateNameWithUseTransition({}) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    // startTransition 함수에서 비동기 핸들링
    startTransition(async () => {
      const error = await updateName(name);
      if (error) {
        setError(error);
        return;
      }
      redirect("/path");
    });
  };
  // ...이하 생략
}
```

### useActionState

또한, 비동기 요청 이후의 `optimisitic updates`, 즉 낙관적 업데이트를 위한 `useOptimistic` 과 일반적인 처리를 위한 `useActionState`를 도입했습니다. 이외에 `react-dom`에서는 `form`을 자동으로 관리하기 위해 `form Action`을 추가하고 `form Action`에 대한 일반적인 경우를 지원하기 위해 `useFormStatus`를 추가했습니다.

아직은 `react-hook-form`에 익숙해서 그런지, 눈에 띄게 특별해 보이진 않습니다.
라이브러리를 사용하지 않고, 쉽게 `form`을 관리하는 점에서 보면 좋을 것 같습니다.

```tsx
function ChangeNameWithUseActionState({ name, setName }) {
	const [error, submitAction, isPending] = useActionState(
		async (previousState, formData) => {
			const error = await updateName(formData.get("name"));
			if (error) {
				return error;
			}
			redirect("/path");
			return null;
		},
		null,
	);
	return (
		<form action={submitAction}>
			<input type="text" name="name" />
			<button type="submit" disabled={isPending}>Update</button>
			{error && <p>{error}</p>}
		</form>
	);  `
}
```

[`useActionState`](https://react.dev/reference/react/useActionState)에서 상세히 확인할 수 있습니다.

### useFormStatus

컴포넌트 깊숙이 전달해야하는 `form` 상태를 관리하기 위해 `useFormStatus`도 추가되었습니다.

```tsx
import { useFormStatus } from "react-dom";

function DesignButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} />;
}
```

[`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus)에서 상세히 확인할 수 있습니다.

### useOptimisitc

그리고, [`useOptimistic`](https://react.dev/reference/react/useOptimistic)으로 낙관적 업데이트를 할 수 있는데, 업데이트 요청 시 먼저 결과를 업데이트하고, 실패하면 이전 상태로 간편하게 돌아갈 수 있습니다.

### use

`use`로 `promise`를 전달하면, `promise`가 `resolve`될 때까지 `react`는 `suspend` 됩니다.

특이한 점은, `use`는 조건부 렌더링에서도 호출 가능합니다.

```tsx
import { use } from "react";

function Comments({ commentsPromise }) {
  // `use`로 promise를 전달합니다.
  const comments = use(commentsPromise);
  return comments.map((comment) => <p key={comment.id}>{comment}</p>);
}

function Page({ commentsPromise }) {
  // Comments가 suspend 되는 동안 Loading 컴포넌트가 출력됩니다.
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}
```

[`use`](https://react.dev/reference/react/use)에서 상세히 확인할 수 있습니다.

---

## 2. React Server Component & Server Action

`서버 컴포넌트`와 `서버 액션`에 대한 내용도 추가되었습니다.

말그대로, 서버 컴포넌트는 `서버에서 렌더링되는 컴포넌트`이고, `서버 액션`은 서버에서 실행되는 함수입니다.

`서버 컴포넌트`는 `"use server"` 로 `서버 액션`을 정의할 수 있습니다:

```tsx
// Server Component

import Button from "./Button";

function EmptyNote() {
  async function createNoteAction() {
    // 서버 액션
    "use server";
    await db.notes.create();
  }
  return <Button onClick={createNoteAction} />;
}
```

서버 액션에 관한 자세한 정보는 [React Server Actions](https://react.dev/reference/rsc/server-actions)에서 확인할 수 있습니다.

---

## 3. Improvements

### ref

더 이상 `forwardRef`를 감싸지 않아도 `ref`를 전달받을 수 있습니다.

향후에는 `forwardRef`는 삭제될 예정입니다.

```tsx
function MyInput({ placeholder, ref }) {
  return <input placeholder={placeholder} ref={ref} />;
}
//...
<MyInput ref={ref} />;
```

### Hydration Error 개선

이제 hydration error의 설명이 더 상세해졌습니다.

기존에는 어디에서 오류가 발생한지 직접 찾아야했지만, 이제는 오류가 발생한 컴포넌트를 보여줍니다.

### `<Context>` as a provider

`<Context>`를 Provider로 사용할 수 있습니다.

향후 버전에서는`<Context.Provider>`는 `deprecated`될 예정입니다.

```tsx
const ThemeContext = createContext("");

function App({ children }) {
  return <ThemeContext value="dark">{children}</ThemeContext>;
}
```

### Document Metadata 지원

`React-helmet`과 같은 라이브러리를 사용하지 않고, `meta 태그`를 추가할 수 있도록 지원합니다.

컴포넌트에서 `meta 태그`를 추가하면, 렌더링 될 때 `<head>` 섹션으로 자동으로 올라갑니다.

CSR, SSR, Server Component 모두 지원합니다.

```tsx
function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <title>{post.title}</title>
      <meta name="author" content="Josh" />
      <link rel="author" href="https://twitter.com/joshcstory/" />
      <meta name="keywords" content={post.keywords} />
      <p>Eee equals em-see-squared...</p>
    </article>
  );
}
```

---

이외에 추가적인 변경사항들은 https://react.dev/blog/2024/04/25/react-19 에서 확인할 수 있습니다.
