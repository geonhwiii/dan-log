---
title: '[번역] Creating Query Abstractions'
summary: 'React Query에서 커스텀 훅 대신 queryOptions를 활용하여 더 나은 쿼리 추상화를 만드는 방법에 대해 알아봅니다.'
date: '2026-02-24'
draft: false
image: 'https://tkdodo.eu/blog/og-images/creating-query-abstractions.png'
tags:
  - 번역
  - React
  - React Query
---

![](https://tkdodo.eu/.netlify/images?w=828&h=552&fit=cover&url=%2Fblog%2F_astro%2Fcreating.BJi0s_V2.jpg)

개발자들은 추상화(abstractions)를 만드는 것을 좋아합니다. 다른 곳에서도 필요할 것 같은 코드를 보면 추상화합니다. 3줄짜리 코드지만 살짝 다르게 써야 할 때면 (플래그를 추가해서) 추상화합니다. 모든 `useQuery`가 해야 할 어떤 작업이 필요하다면 **aBsTrAcTiOn**을 만듭니다!

추상화 자체가 나쁜 것은 아니지만, 다른 모든 것들과 마찬가지로 트레이드오프(tradeoff)가 존재합니다. 제가 가장 좋아하는 발표 중 하나인 Dan Abramov의 [**The wet codebase**](https://www.deconstructconf.com/2019/dan-abramov-the-wet-codebase)에서 이 부분을 아주 잘 설명하고 있습니다.

## Custom Hooks (커스텀 훅)

React에서 추상화를 만드는 것은 대개 커스텀 훅(custom hooks)과 연관됩니다. 커스텀 훅은 여러 컴포넌트 간에 로직을 공유하거나, 지저분한 `useEffect`를 좋은 이름 뒤에 숨기는 데 아주 유용합니다.

아주 오랫동안 `useQuery`에 대한 자신만의 추상화를 만든다는 것은 커스텀 훅을 작성하는 것을 의미했습니다.

```ts
function useInvoice(id: number) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
  });
}

const { data } = useInvoice(1);
// const data: Invoice | undefined
```

이는 직관적이며, 이제 `queryKey`와 `queryFn`을 매번 반복할 필요 없이 원하는 곳 어디서든 `useInvoice()`를 호출할 수 있습니다. 자칫하면 중복된 캐시 엔트리를 만들 수 있는 `queryKey`의 일관성을 보장해 줍니다. 그리고 단순히 `useQuery`가 반환하는 것을 그대로 반환하기 때문에, TanStack Query의 API 표면과 일치하는 인터페이스를 가지게 되어 이 훅이 사용되는 곳에서 예상치 못한 이름이 등장하지 않습니다.

타입 또한 **완전히 추론**되는데, 어디서도 제네릭을 수동으로 명시하지 않아도 되기 때문에 아주 훌륭합니다. TypeScript 코드가 순수 JavaScript처럼 보일수록 더 좋습니다.

## Query Options (쿼리 옵션)

하지만 이 커스텀 훅의 입력(input)은 어떨까요? `useQuery`에는 24개의 옵션이 있는데, 현재의 추상화로는 그 중 어떤 것도 전달할 수 없습니다. 백그라운드 업데이트가 별로 중요하지 않은 특정 화면에서 다른 `staleTime`을 전달하고 싶다면 어떨까요? 뭐, 그냥 또 다른 매개변수로 받아들이면 되겠죠.

```ts
function useInvoice(id: number, staleTime?: number) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    staleTime,
  });
}
```

이 정도까지는 아직 괜찮아 보입니다. 하지만 그 다음 순간, 누군가 Query를 에러 바운더리(Error Boundaries)와 통합하고 싶어서 `throwOnError`를 전달하고 싶어할지도 모릅니다. 알겠습니다, 하지만 그렇게 매개변수가 많아지는 것은 좋은 인터페이스가 아닙니다. 애초에 그냥 객체로 만들었어야 했나 봅니다.

```ts
function useInvoice(id: number, options?: { staleTime?: number; throwOnError?: boolean }) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    ...options,
  });
}
```

이 시점에서, 여러분은 여전히 올바른 길을 가고 있는지 의문이 들 것입니다. React Query가 커버하는 새로운 유스케이스가 생길 때마다 항상 우리의 작은 추상화를 건드려야 한다는 것은 이상적이지 않아 보입니다. 반환값에 대해서는 라이브러리가 반환하는 것을 그대로 따르기로 했는데, 전달받는 옵션에 대해서도 똑같이 할 수는 없을까요?

## UseQueryOptions

조금 더 깊이 파고들어보면, React Query가 `UseQueryOptions`라는 타입을 노출한다는 것을 알 수 있습니다. 우리가 원하는 것 같네요.

```ts
import type { UseQueryOptions } from '@tanstack/react-query';

function useInvoice(id: number, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    ...options,
  });
}
```

타입 에러가 없으니 잘 작동하는 거겠죠? 글쎄요, 사용 사례를 다시 한 번 살펴봅시다.

```ts
const { data } = useInvoice(1, { throwOnError: true });
// const data: unknown
```

우리의 `data`가 `unknown` 타입이 되어버렸습니다. 예상치 못한 결과일 수 있지만, 이 모든 것은 이상적인 타입 추론을 위해 Query가 제네릭을 사용하는 방식에서 비롯됩니다. 이에 대해서는 이전에 [**#6 React Query and TypeScript**](https://tkdodo.eu/blog/react-query-and-type-script#the-four-generics)에서 다룬 적이 있습니다. `options`가 실제로 어떤 타입으로 추론되는지 확인해보면 문제가 더 명확해질 것입니다.

```ts
declare const options: UseQueryOptions;
// const options: UseQueryOptions<unknown, Error, unknown, readonly unknown[]>
```

`UseQueryOptions`는 동일하게 4개의 제네릭을 가지고 있으며, 만약 우리가 이를 생략하면 기본값이 대신 사용됩니다. `data`의 기본값이 마침 `unknown`이기 때문에, 해당 옵션들을 `useQuery`에 스프레드(spread)하면 타입들이 `unknown`으로 확장(widen)되는 것입니다.

## TypeScript 라이브러리

이것은 타입 추론을 통해 많은 타입 안정성을 제공하려는 라이브러리들에서 흔히 발견되는 문제라는 것을 알게 되었습니다. 이런 라이브러리들은 "직접" 사용할 때는 아주아주 잘 작동하지만, 그 위에 저수준(low-level)의 제네릭 추상화를 만들려고 하는 순간 올바르게 구현하기가 어려워집니다.

TanStack Query는 제네릭이 4개뿐이라서 어떻게든 다시 만들어볼 수도 있을 것입니다. 하지만 TanStack Form은 대부분의 타입에 23개의 타입 파라미터가 있고, TanStack Router는... 말하지 않는 게 좋겠습니다.

명확하게도, 이 방법은 어느 정도까지만 작동합니다. TanStack Query로 이를 어떻게 해결하는지에 대한 제 4년 전 [트윗](https://x.com/TkDodo/status/1491451513264574501)이 있지만, 솔직히 말해서 엉망진창입니다.

## The Naive Solution (순진한 해결책)

그리고 너무 복잡하기 때문에 사람들이 이를 잘못 사용하는 것을 항상 목격합니다. 가장 순진한(naive) 해결책은 단순히 `UseQueryOptions`의 첫 번째 타입 파라미터만 선언하는 것입니다.

```ts
function useInvoice(id: number, options?: Partial<UseQueryOptions<Invoice>>) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    ...options,
  });
}

const { data } = useInvoice(1, { throwOnError: true });
// const data: Invoice | undefined
```

이렇게 하면 `data`를 다시 추론하는 데는 "성공"하지만, `select`와 같이 다른 타입 파라미터에 의존하는 옵션이 필요해지면 무너져버립니다.

```ts
const { data } = useInvoice(1, {
  select: (invoice) => invoice.createdAt,
});
// Error ts(2322) ― Type '(invoice: Invoice) => string' is not assignable to type '(data: Invoice) => Invoice'. Type 'string' is not assignable to type 'Invoice'.
```

트윗 내용에서 볼 수 있듯이, 우리의 추상화에 더 많은 타입 파라미터를 추가할 수는 있지만, 이는 코드를 _Just JavaScript™_(그저 자바스크립트)처럼 보이는 것에서 점점 멀어지게 만듭니다. 애초의 약속은 우리가 직접 하지 않아도 되도록 라이브러리들이 그 지저분한 TypeScript 작업들을 대신 해준다는 것이었는데요...

## 더 나은 추상화 찾기

결론적으로, 저는 여기서 커스텀 훅이 올바른 추상화가 아니라는 결론에 도달했으며, 거기에는 여러 가지 이유가 있습니다.

1. 커스텀 훅은 컴포넌트나 다른 훅 내에서만 사용할 수 있습니다. React Query가 처음 출시되었을 때는 괜찮았을지 모르지만, 그 이후로 우리는 서버에서도 사용하고 싶어하고, 라우트 로더(route loaders)에서도 사용하고 싶어하며, 이벤트 핸들러에서 프리패칭(prefetching)을 위해서도 사용하고 싶어졌습니다. 이런 곳들은 모두 훅을 사용할 수 없는 환경입니다.
2. 커스텀 훅은 컴포넌트 간에 로직을 공유하는 훌륭한 방법이지만, 우리는 지금 로직을 공유하는 것이 아닙니다. 우리는 **설정**을 공유하고 있습니다.
3. 커스텀 훅은 우리를 특정 구현(`useQuery`)에 묶어놓지만, 우리는 이를 교체하고 싶을 수도 있습니다. 데이터 페칭에 **Suspense**를 사용하고 싶다면 다른 훅(`useSuspenseQuery`)이 필요합니다. 또한 여러 개의 Query를 병렬로 실행하기 위한 `useQueries`도 있는데, 이것을 `useInvoice`와 어떻게 결합할 수 있을까요? 불가능합니다...

v5부터 Query 추상화를 만드는 제가 가장 선호하는 방식은 더 이상 커스텀 훅이 아니라 `queryOptions`를 사용하는 것입니다.

## Query Options는 훌륭합니다!

`queryOptions`에는 다른 장점들도 있으며, 이는 제가 이미 [**#24 The Query Options API**](https://tkdodo.eu/blog/the-query-options-api)에서 다룬 바 있습니다. 이것을 먼저 읽어보시기를 강력히 추천합니다.

이 API는 언급된 모든 문제와 그 이상을 해결해줍니다. 서로 다른 훅들 사이에서 사용할 수 있으며, 심지어 명령형(imperative) 함수와도 공유할 수 있습니다. 이는 그저 일반적인 함수이기 때문에 어디서든 작동합니다. 런타임에는 아무 일도 하지 않습니다. 트랜스파일된 결과물은 다음과 같습니다.

```js
function queryOptions(options) {
  return options;
}
```

하지만 타입 레벨에서는 진정한 강자로 변모하여, 쿼리 설정들을 공유하는 최고의 방법이 됩니다.

```ts
import { queryOptions } from '@tanstack/react-query';

function invoiceOptions(id: number) {
  return queryOptions({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
  });
}

const { data: invoice1 } = useQuery(invoiceOptions(1));
// data: Invoice | undefined

const { data: invoice2 } = useSuspenseQuery(invoiceOptions(2));
// data: Invoice
```

좋습니다. 상호 운용성 문제는 해결되었지만, 이제 옵션은 어떻게 전달할 수 있을까요? 만약 `invoiceOptions`의 파라미터로 옵션들을 추가한다면 다시 원점으로 돌아가는 셈입니다.

## QueryOptions 작성

다행스러운 소식은, 그럴 필요가 없다는 것입니다. 핵심 아이디어는 `invoiceOptions`가 **모든 사용처 간에 공유하고자 하는 옵션들만 포함**한다는 것입니다. 가장 좋은 추상화는 외부에서 별도로 설정을 주입받지 않는(not configurable) 형태이므로, 우리는 이 상태를 그대로 유지하면 됩니다. 다른 옵션을 설정하고 싶다면, 사용되는 곳에서 `invoiceOptions` 위에 직접 옵션들을 전달하기만 하면 됩니다.

```ts
import { queryOptions } from '@tanstack/react-query';

function invoiceOptions(id: number) {
  return queryOptions({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
  });
}

const invoiceQuery = useQuery({
  ...invoiceOptions(1),
  throwOnError: true,
  select: (invoice) => invoice.createdAt,
});

invoiceQuery.data;
// data: string | undefined
```

그리고 이건 그냥 잘 작동합니다! 모든 옵션을 사용할 수 있고, 완벽한 타입 추론이 되며, JavaScript처럼 보이고, 절대적으로 직관적입니다. 원한다면 여전히 커스텀 훅을 만들 수는 있겠지만, 그것들은 아마도 가장 먼저 찾아야 할 추상화의 기본 구성 요소인 `queryOptions` 위에서 구축되어야 할 것입니다. 단순함이 최고이며, 이보다 더 단순할 수는 없습니다.
