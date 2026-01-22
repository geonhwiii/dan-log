---
title: "[번역] Zustand and React Context"
summary: "Zustand와 React 컨텍스트"
date: "04 21 2024"
draft: false
image: "https://tkdodo.eu/blog/static/f18038b8566526e3d3dfcf7c3b807b2a/bbe0c/zustand-context.jpg"
tags:
  - 번역
  - React
---

![](https://tkdodo.eu/blog/static/f18038b8566526e3d3dfcf7c3b807b2a/bbe0c/zustand-context.jpg)

> 원문 : https://tkdodo.eu/blog/zustand-and-react-context

`Zustand`는 글로벌 클라이언트 상태 관리를 위한 훌륭한 라이브러리입니다. 간단하고 빠르며 번들 크기도 작습니다. 하지만 한 가지 마음에 들지 않는 점이 있습니다:

> 스토어는 전역입니다.

알겠죠? 하지만 글로벌 상태 관리의 요점은 바로 여기에 있지 않을까요? 어디서나 앱에서 해당 상태를 사용할 수 있도록 하는 것 아닐까요?

가끔은 그렇게 생각하기도 합니다. 하지만 지난 몇 년 동안 `zustand`를 어떻게 사용해왔는지 살펴보면서 전체 애플리케이션이 아니라 **하나의 컴포넌트 하위 트리**에서 전역적으로 사용할 수 있는 상태가 필요한 경우가 더 많다는 것을 깨달았습니다. `zustand`를 사용하면 기능별로 여러 개의 작은 스토어를 만드는 것도 괜찮고 심지어 권장할 만합니다. 그렇다면 대시보드 경로에서만 필요한데 대시보드 필터 스토어를 전 세계적으로 사용할 수 있어야 하는 이유는 무엇일까요? 물론 문제가 되지 않는다면 그렇게 할 수 있지만 글로벌 스토어에는 몇 가지 단점이 있다는 것을 알게 되었습니다:

## Props로부터 초기화하기

전역 스토어는 React 컴포넌트 라이프사이클 외부에서 생성되므로 프로퍼티로 얻은 값으로 스토어를 초기화할 수 없습니다. 글로벌 스토어를 사용하려면 먼저 알려진 기본 상태로 스토어를 생성한 다음, `useEffect`를 사용하여 프로퍼티와 스토어를 동기화해야 합니다:

```tsx
// sync-with-useEffect
const useBearStore = create((set) => ({
  // ⬇️ initialize with default value
  bears: 0,
  actions: {
    increasePopulation: (by) => set((state) => ({ bears: state.bears + by })),
    removeAllBears: () => set({ bears: 0 }),
  },
}));

const App = ({ initialBears }) => {
  //😕 write initialBears to our store
  React.useEffect(() => {
    useBearStore.set((prev) => ({ ...prev, bears: initialBears }));
  }, [initialBears]);

  return (
    <main>
      <RestOfTheApp />
    </main>
  );
};
```

사용 효과를 작성하고 싶지 않다는 것 외에도 두 가지 이유로 이상적이지 않습니다:

1. 먼저 `<RestOfTheApp />`을 `bears: 0`으로 렌더링한 다음 올바른 `initialBears`로 다시 한 번 렌더링합니다.
2. 실제로 store를 `initialBears`로 초기화하지 않고 동기화합니다. 따라서 `initialBears`가 변경되면 스토어에도 업데이트가 반영되는 것을 볼 수 있습니다.

## Testing

`zustand`에 대한 [테스트 문서](https://docs.pmnd.rs/zustand/guides/testing)는 꽤 혼란스럽고 복잡합니다. 테스트 사이에 스토어를 재설정하는 등 `zustand`를 모킹하고 재설정하는 것이 전부입니다. 이 모든 것이 스토어가 전역이라는 사실에서 비롯된 것 같아요. 컴포넌트 하위 트리로 범위를 지정하면 해당 컴포넌트를 렌더링할 수 있고 스토어는 해당 컴포넌트에 격리되어 이러한 '해결 방법'이 필요하지 않을 것입니다.

## 재사용성

모든 스토어가 앱에서 한 번만 사용하거나 특정 경로에서 한 번만 사용할 수 있는 싱글톤은 아닙니다. 때로는 재사용 가능한 컴포넌트를 위한 저장소도 필요합니다. 제가 생각할 수 있는 과거의 한 가지 예는 디자인 시스템의 복잡한 다중 선택 그룹 컴포넌트입니다. 이 컴포넌트는 선택 항목의 내부 상태를 관리하기 위해 React 컨텍스트와 함께 전달된 로컬 상태를 사용하고 있었습니다. 항목이 50개 이상이 되면 항목이 선택될 때마다 속도가 느려졌습니다. 그래서 이 트윗을 쓰게 되었습니다:

![](https://i.imgur.com/6KvYtRk.png)

이러한 `zustand` 스토어가 전역이라면 서로의 상태를 공유하고 덮어쓰지 않고는 컴포넌트를 여러 번 인스턴스화할 수 없습니다.

---

흥미롭게도 이 모든 문제를 해결할 수 있는 한 가지 방법이 있습니다:

## React Context

`Context`를 상태 관리 도구로 사용하는 것이 애초에 앞서 언급한 문제를 일으켰기 때문에 `React Context`가 해결책이라는 것은 재미있고 아이러니한 일입니다. 하지만 제가 제안하는 것은 그런 것이 아닙니다. 이 아이디어는 스토어 값 자체가 아니라 `React Context`를 통해 **스토어 인스턴스**를 공유하자는 것입니다.

개념적으로 이것은 `React Query`가 `<QueryClientProvider>`로 하는 일이며, `redux`가 단일 스토어로 하는 일도 마찬가지입니다. 스토어 인스턴스는 자주 변경되지 않는 정적 싱글톤이기 때문에 리렌더링 문제를 일으키지 않고 쉽게 `React Context`에 넣을 수 있습니다. 그런 다음 `zustand`에 의해 최적화될 스토어에 구독을 생성할 수 있습니다. 그 모습은 다음과 같습니다:

> **v5 syntax**
> 이 글에서는 `zustand`와 `React Context`를 결합하는 `v5 syntax`을 보여드리겠습니다.
> 그 전에는 `zustand`에서 명시적으로 `createContext` 함수를 내보냈습니다.

```tsx
// zustand-and-react-context
import { createStore, useStore } from "zustand";

const BearStoreContext = React.createContext(null);

const BearStoreProvider = ({ children, initialBears }) => {
  const [store] = React.useState(() =>
    createStore((set) => ({
      bears: initialBears,
      actions: {
        increasePopulation: (by) =>
          set((state) => ({ bears: state.bears + by })),
        removeAllBears: () => set({ bears: 0 }),
      },
    })),
  );

  return (
    <BearStoreContext.Provider value={store}>
      {children}
    </BearStoreContext.Provider>
  );
};
```

여기서 가장 큰 차이점은 이전과 같은 바로 사용할 수 있는 훅을 제공하는 `create`를 사용하지 않는다는 것입니다. 대신, 우리는 `vanila zustand` 함수인 `createStore`에 의존하고 있으며, 이 함수는 우리를 위해 스토어를 생성합니다. 그리고 컴포넌트 내부에서도 원하는 곳 어디에서나 이 작업을 수행할 수 있습니다. 하지만 저장소 생성이 한 번만 발생하도록 해야 합니다. 이 작업은 참조로 수행할 수 있지만 저는 이를 위해 `state`를 사용하는 것을 선호합니다. 그 이유를 알고 싶으시면 해당 주제에 대한 [별도의 블로그 게시물](https://tkdodo.eu/blog/use-state-for-one-time-initializations)을 참조하세요.

컴포넌트 내부에 스토어를 생성하기 때문에 `initialBears`와 같은 `props`를 `closure`하고 이를 실제 초기값으로 `createStore`에 전달할 수 있습니다. `useState` 초기화 함수는 한 번만 실행되므로 `props`에 대한 업데이트는 스토어에 전달되지 않습니다. 그런 다음 `store 인스턴스`를 가져와서 일반 `React Context`에 전달합니다. 여기에는 더 이상 `zustand`에 대한 구체적인 내용이 없습니다.

---

그 후에는 스토어에서 일부 값을 선택하고자 할 때마다 해당 `context`를 사용해야 합니다. 이를 위해 `store`와 `selector`를 `zustand`에서 가져올 수 있는 `useStore` 훅에 전달해야 합니다. 이는 커스텀 훅에서 추상화하는 것이 가장 좋습니다:

```ts
// useBearStore.ts
const useBearStore = (selector) => {
  const store = React.useContext(BearStoreContext);
  if (!store) {
    throw new Error("Missing BearStoreProvider");
  }
  return useStore(store, selector);
};
```

그런 다음 익숙한 것처럼 `useBearStore` 훅을 사용하고 `atomic selectors`를 사용하여 커스텀 훅을 내보낼 수 있습니다:

```ts
// useBears.ts
export const useBears = () => useBearStore((state) => state.bears);
```

글로벌 스토어를 만드는 것보다 작성해야 하는 코드가 조금 더 많지만 세 가지 문제를 모두 해결할 수 있습니다:

1. 예제에서 볼 수 있듯이, 이제 React 컴포넌트 트리 안에서 생성하기 때문에 프로퍼티로 스토어를 초기화할 수 있습니다.
2. 테스트는 매우 쉬워졌습니다. `BearStoreProvider`가 포함된 컴포넌트를 렌더링하거나 테스트를 위해 직접 렌더링할 수 있기 때문입니다. 두 경우 모두 생성된 스토어는 테스트에 완전히 격리되므로 테스트 사이에 재설정할 필요가 없습니다.
3. 이제 컴포넌트는 `BearStoreProvider`를 렌더링하여 자식에게 캡슐화된 스토어를 제공할 수 있습니다. 이 컴포넌트를 한 페이지에서 원하는 만큼 자주 렌더링할 수 있으며, 각 인스턴스에는 자체 스토어가 있으므로 재사용성을 확보할 수 있습니다.

따라서 스토어에 접근하기 위해 `Context Provider`가 필요하지 않다고 [`zustand` 문서](https://docs.pmnd.rs/zustand/getting-started/introduction#then-bind-your-components,-and-that's-it!)에서 자랑스럽게 말하지만, 스토어 생성과 `React Context`를 결합하는 방법을 아는 것은 캡슐화 및 재사용이 필요한 상황에서 매우 유용할 수 있다고 생각합니다. 저는 이 추상화를 진정한 `global zustand`보다 더 많이 사용했습니다. 😄
