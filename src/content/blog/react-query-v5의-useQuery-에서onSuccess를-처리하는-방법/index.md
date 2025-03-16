---
title: 'react-query v5의 useQuery에서 onSuccess를 깔끔하게 처리하는 방법'
summary: 'tanstack/react-query v5에서 onSuccess/onError 등의 콜백을 깔끔하게 처리하는 방법이 무엇인지 알아봅니다.'
date: '03 16 2025'
draft: false
tags:
  - React
  - reqct-query
---

## 1. 왜 v5에서 useQuery의 onSuccess가 없어졌을까?

> Dominic의 x 글 : https://x.com/TkDodo/status/1647341498227097600

위 x글에서 시작된 여러 스레드를 보면 핵심은 다음과 같습니다.

### 1. `useQuery`의 `onSuccess`와 같은 콜백은 의도된 방식으로 동작하지 않을 수 있습니다.

별도의 컴포넌트에서 두 번 호출하는 경우, api는 1번만 호출되지만 `onSuccess`는 두 번 호출됩니다.

이는 `onError`, `onSettled`와 같은 콜백도 동일하게 발생합니다.

### 2. 비즈니스 로직을 React의 라이프사이클과 분리하기 위해

`onSuccess`, `onError` 같은 콜백을 사용하면 비즈니스 로직이 `useQuery` 내부에 묶이게 됩니다.

`React Query`는 “데이터 패칭 라이브러리”일 뿐이므로, 상태 관리나 UI 업데이트 같은 작업을 React의 다른 적절한 위치에서 처리하는 것을 권장합니다.

Dominic이라는 개발자의 개발 철학을 엿볼수 있는 부분입니다.

이외에 리렌더링 및 동기화 문제, 가독성 문제 등이 있습니다.

---

## 2. 그래서 어떻게 해결하면 좋을까요?

사실 방법은 모두가 알고 있습니다.

네, `useEffect`를 사용하면 됩니다.

`onSuccess`의 경우는 아래와 같이 `query.data`를 확인하면 됩니다.

```tsx
// onSuccess를 useEffect로 대체
const query = useQuery({
  queryKey: ["user"],
  queryFn: fetchUserData,
});
useEffect(() => {
  if (query.data) {
    console.log("[onSuccess] :", query.data);
  }
}, [query.data]); 
```
`onError`도 아래와 같은 방식으로 `query.error`를 확인하면 됩니다.

```tsx
// onError를 useEffect로 대체
export function useTodos() {
  const query = useQuery({
    queryKey: ['todos', 'list'],
    queryFn: fetchTodos,
  })

  React.useEffect(() => {
    if (query.error) {
      console.error("[onError] :", query.error);
    }
  }, [query.error])

  return query
}
```

## 3. useQueryEffects

그럼 이제 `useEffect`를 계속 사용할 수 없으니, 훅을 하나 만들어서 사용하겠습니다.

물론 사용하는 상황에 따라 더 개선할 수 있으니 참고하는 정도로 사용하면 좋겠습니다 :)

아래는 `useQueryEffects` 훅의 구현입니다.

```tsx
import { useEffect, useRef } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

type QueryEffectsOptions<TData, TError> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: (data: TData | undefined, error: TError | null) => void;
};

/**
 * 쿼리 결과에 따른 사이드 이펙트를 관리하는 커스텀 훅
 * @param query - React Query의 useQuery 결과
 * @param options - 쿼리 상태에 반응할 콜백 함수들
 * @returns 원본 쿼리 객체를 그대로 반환
 */
export function useQueryEffects<TData, TError>(
  query: UseQueryResult<TData, TError>,
  options: QueryEffectsOptions<TData, TError>,
) {
  const { onSuccess, onError, onSettled } = options;

  // 이전 상태를 추적하기 위한 ref
  const prevStateRef = useRef({
    isSuccess: false,
    isError: false,
    data: undefined as TData | undefined,
    error: null as TError | null,
  });

  useEffect(() => {
    const { isSuccess, isError, data, error } = query;
    const prevState = prevStateRef.current;

    // 성공 상태 확인 및 콜백 실행 (새로운 성공 상태일 때만)
    if (isSuccess && onSuccess && !prevState.isSuccess) {
      onSuccess(data as TData);
    }

    // 에러 상태 확인 및 콜백 실행 (새로운 에러 상태일 때만)
    if (isError && onError && !prevState.isError) {
      onError(error as TError);
    }

    // 완료 상태(성공 또는 에러) 확인 및 콜백 실행 (새로운 완료 상태일 때만)
    if ((isSuccess || isError) && onSettled && !(prevState.isSuccess || prevState.isError)) {
      onSettled(data, error);
    }

    // 현재 상태 저장
    prevStateRef.current = { isSuccess, isError, data, error };
  }, [query.isSuccess, query.isError, query.data, query.error, onSuccess, onError, onSettled]);

  return query;
}
```

마지막으로 사용 예시를 확인해보겠습니다.

```tsx
const query = useQuery({
  queryKey: ["user"],
  queryFn: fetchUserData,
});

useQueryEffects(query, {
  onSuccess: (data) => {
    console.log("[onSuccess]:", data);
  },
  onError: (error) => {
    console.error("[onError]:", error);
  },
  onSettled: (data, error) => {
    console.log("[onSettled]:", data, error);
  },
});
```