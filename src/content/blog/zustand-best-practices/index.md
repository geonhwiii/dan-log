---
title: 'Zustand Best Practices'
summary: 'Zustand를 올바르게 쓰기 위한 4가지 패턴. 빠른 시작부터 커스텀 훅 캡슐화, TypeScript 타입 추론, 스토어 밖 액션 관리까지'
date: '12 28 2025'
draft: false
image: 'https://github.com/pmndrs/zustand/raw/main/docs/bear.jpg'
tags:
  - React
---

![](https://github.com/pmndrs/zustand/raw/main/docs/bear.jpg)

# Zustand Best Practices — 레시피 모음

> 각 패턴은 독립적으로 읽을 수 있습니다. 필요한 레시피만 골라서 적용하세요.

---

## 목차

1. [빠르게 시작하기 — Ship Value First](#1-빠르게-시작하기--ship-first)
2. [커스텀 훅으로 캡슐화하기 — TkDodo 패턴](#2-커스텀-훅으로-캡슐화하기--tkdodo-패턴)
3. [TypeScript 타입 안전하게 만들기](#3-typescript-타입-안전하게-만들기)
4. [스토어 밖에서 액션 관리하기 — No Store Actions](#4-스토어-밖에서-액션-관리하기--no-store-actions)

---

## 1. 빠르게 시작하기 — Ship Value First

Zustand의 가장 큰 장점은 보일러플레이트 없이 바로 시작할 수 있다는 점입니다. 공식 docs의 기본 예제도 별도의 selector 없이 통째로 꺼내 쓰는 형태입니다.

```ts
// store/bear.ts
import { create } from 'zustand';

const useBearStore = create((set) => ({
  bears: 0,
  fish: 0,
  increasePopulation: (by) => set((state) => ({ bears: state.bears + by })),
  eatFish: () => set((state) => ({ fish: state.fish - 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));
```

```tsx
function BearCounter() {
  const { bears, increasePopulation } = useBearStore();
  return <button onClick={() => increasePopulation(1)}>{bears}</button>;
}
```

이대로 써도 됩니다. 스토어가 작고 컴포넌트가 대부분의 값을 사용한다면 이 방식으로 충분합니다.

### 리렌더링을 막아야 한다면

스토어가 커지면서 컴포넌트가 일부 값만 사용하는 상황이 되면, 무관한 상태 변경에도 리렌더가 발생합니다. 이때는 selector로 필요한 값만 구독합니다.

```tsx
function BearCounter() {
  // fish가 바뀌어도 이 컴포넌트는 리렌더되지 않습니다
  const bears = useBearStore((state) => state.bears);
  return <div>{bears}</div>;
}
```

여러 값이 필요하면 selector를 각각 호출하면 됩니다.

```tsx
function BearStatus() {
  const bears = useBearStore((state) => state.bears);
  const fish = useBearStore((state) => state.fish);
  return (
    <div>
      bears: {bears}, fish: {fish}
    </div>
  );
}
```

### 계산된 값이라면 `useShallow`

`Object.keys()`, `map()`, `filter()` 처럼 **selector가 매번 새 참조를 반환하는 경우**, Zustand는 내용이 같아도 `Object.is` 비교에서 항상 다르다고 판단해 리렌더를 유발합니다. 이때 `useShallow`를 사용합니다.

```tsx
import { useShallow } from 'zustand/react/shallow';

// ❌ 매 렌더마다 새 배열 반환 → 내용이 같아도 리렌더 발생
const names = useMeals((state) => Object.keys(state));

// ✅ 내용물을 얕은 비교로 체크 → 실제로 바뀐 값이 없으면 리렌더 안 함
const names = useMeals(useShallow((state) => Object.keys(state)));
```

처음부터 이 패턴을 강제할 필요는 없습니다. **실제로 리렌더가 문제가 된다고 느낄 때** 도입하면 됩니다.

---

## 2. 커스텀 훅으로 캡슐화하기 — TkDodo 패턴

> 참고: [Working with Zustand — TkDodo's blog](https://tkdodo.eu/blog/working-with-zustand)

스토어 자체를 export하지 않고, 각 상태 조각마다 커스텀 훅을 export합니다. 이 패턴의 핵심 가치는 **나중에 내부 구현을 바꿔도 소비자 코드를 건드릴 필요가 없다는 점**입니다.

```ts
// store/bear.ts

// ✅ 스토어 자체는 export하지 않는다
const useBearStore = create((set) => ({
  bears: 0,
  fish: 0,
  actions: {
    increasePopulation: (by) => set((state) => ({ bears: state.bears + by })),
    eatFish: () => set((state) => ({ fish: state.fish - 1 })),
    removeAllBears: () => set({ bears: 0 }),
  },
}));

// ✅ 상태는 각각 atomic하게 export
export const useBears = () => useBearStore((state) => state.bears);
export const useFish = () => useBearStore((state) => state.fish);

// ✅ 액션은 하나로 묶어서 export
export const useBearActions = () => useBearStore((state) => state.actions);
```

```tsx
function BearCounter() {
  const bears = useBears();
  const { increasePopulation } = useBearActions();

  return <button onClick={() => increasePopulation(1)}>{bears}</button>;
}
```

---

## 3. TypeScript 타입 안전하게 만들기

> 참고: [Advanced TypeScript — Zustand docs](https://zustand.docs.pmnd.rs/learn/guides/advanced-typescript)

### 왜 `create<T>()(fn)` 커링 패턴인가?

`create<T>(fn)` 대신 `create<T>()(fn)` (괄호가 두 번)을 써야 TypeScript가 `set`과 `get`의 타입을 올바르게 추론합니다.

```ts
// store/bear.ts
import { create } from 'zustand';

// ✅ State와 Actions를 별도 타입으로 분리
type BearState = {
  bears: number;
  fish: number;
};

type BearActions = {
  actions: {
    increasePopulation: (by: number) => void;
    eatFish: () => void;
    removeAllBears: () => void;
  };
};

type BearStore = BearState & BearActions;

// ✅ create<T>()() 커링 패턴
const useBearStore = create<BearStore>()((set) => ({
  bears: 0,
  fish: 0,
  actions: {
    increasePopulation: (by) => set((state) => ({ bears: state.bears + by })),
    eatFish: () => set((state) => ({ fish: state.fish - 1 })),
    removeAllBears: () => set({ bears: 0 }),
  },
}));

export const useBears = () => useBearStore((state) => state.bears);
export const useFish = () => useBearStore((state) => state.fish);
export const useBearActions = () => useBearStore((state) => state.actions);
```

### 타입 외부에서 추출하기 — `ExtractState`

스토어 타입을 다른 파일에서 참조해야 할 때 `ExtractState` 유틸리티를 사용합니다.

```ts
import { create, ExtractState } from 'zustand';

const useBearStore = create<BearStore>()((set) => ({
  /* ... */
}));

// 스토어 전체 타입 추출
type BearStoreState = ExtractState<typeof useBearStore>;
// → BearStore

// 특정 슬라이스 타입만 추출
type BearCount = ExtractState<typeof useBearStore>['bears'];
// → number
```

### `combine` 미들웨어를 쓸 때는 커링 불필요

`combine`은 초기 상태에서 타입을 직접 추론하기 때문에 커링 패턴이 필요 없습니다.

```ts
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

// ✅ create<T>() 없이도 타입이 올바르게 추론된다
const useBearStore = create(
  combine({ bears: 0, fish: 0 }, (set) => ({
    increasePopulation: (by: number) => set((state) => ({ bears: state.bears + by })),
  })),
);
```

### immer 미들웨어와 함께 쓸 때

```ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useBearStore = create<BearStore>()(
  immer((set) => ({
    bears: 0,
    fish: 0,
    actions: {
      // 불변성을 신경 쓰지 않아도 됩니다
      increasePopulation: (by) =>
        set((state) => {
          state.bears += by;
        }),
    },
  })),
);
```

---

## 4. 스토어 밖에서 액션 관리하기 — No Store Actions

> 참고: [Practice with No Store Actions — Zustand docs](https://zustand.docs.pmnd.rs/learn/guides/practice-with-no-store-actions)

```ts
// ✅ 기본 권장: 상태와 액션을 스토어 안에 함께
export const useBoundStore = create((set) => ({
  count: 0,
  text: 'hello',
  inc: () => set((state) => ({ count: state.count + 1 })),
  setText: (text) => set({ text }),
}));

// 대안: 액션을 스토어 밖으로 분리 (code splitting이 필요할 때)
export const useBoundStore = create(() => ({
  count: 0,
  text: 'hello',
}));

export const inc = () => useBoundStore.setState((state) => ({ count: state.count + 1 }));
export const setText = (text: string) => useBoundStore.setState({ text });
```

공식 문서의 예시처럼 함수를 개별 export하면 스토어와 액션이 흩어져 관리가 어려워집니다.

인라인으로 액션 함수를 사용할 때의 이득과 비용을 함께 생각하며 사용하는 것을 권장합니다.

```tsx
// 네임스페이스 객체를 사용해서 응집을 높이는 방법도 있습니다.
export const bearActions = {
  increasePopulation: (by: number) => useBearStore.setState((state) => ({ bears: state.bears + by })),
  eatFish: () => useBearStore.setState((state) => ({ fish: state.fish - 1 })),
  removeAllBears: () => useBearStore.setState({ bears: 0 }),
};

function BearCounter() {
  const bears = useBearStore((state) => state.bears);

  return <button onClick={() => bearActions.increasePopulation(1)}>{bears}</button>;
}
```

### 훅 규칙의 제약을 벗어납니다

`useBearStore.setState` / `useBearStore.getState`는 훅이 아닌 일반 함수입니다. 컴포넌트 최상위에서만 호출해야 한다는 훅 규칙에 적용받지 않습니다.

```ts
// services/bearService.ts
import { useBearStore } from '../store/bear';

// 서비스 레이어, API 인터셉터, WebSocket 이벤트 핸들러 등
export async function fetchAndSyncBears() {
  const { data } = await api.get('/bears');
  useBearStore.setState({ bears: data.count });
}

// 조건문 안에서도 가능
if (condition) {
  const { bears } = useBearStore.getState();
  console.log(`Current bears: ${bears}`);
}
```
