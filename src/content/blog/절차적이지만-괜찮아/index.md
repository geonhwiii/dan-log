---
title: 절차적이지만 괜찮아
summary: 선언적 프로그래밍과 절차적 프로그래밍 비교
date: 09 10 2025
draft: false
tags: 
  - programming
  - declarative
  - procedural
---

최근에 프로젝트를 하다가 팀원과 코드 스타일 이야기를 나눴습니다.

“이건 너무 절차적인데?” 라는 말에 잠시 멈칫했는데,
사실 절차적이어도 괜찮을 때가 많다는 생각이 들어서 글로 정리해두려고 합니다.

---

## 1. 선언적 vs 절차적 프로그래밍

프로그래밍 스타일을 크게 나누면 두 가지로 이야기할 수 있습니다.

* **절차적(Procedural)**: 원하는 결과를 얻기 위해 *어떻게(how)* 동작할지 구체적으로 작성하는 방식.
* **선언적(Declarative)**: 원하는 결과가 *무엇(what)* 인지만 선언하고, 내부 동작은 추상화에 맡기는 방식.

### 특징 비교

1. 절차적: 코드 흐름이 명확하고 디버깅하기 쉽지만, 복잡해질수록 가독성이 떨어짐.
2. 선언적: 코드가 간결하고 읽기 좋지만, 내부 동작이 감춰져 있어 제어하기 까다로움.
3. 선언적은 결국 \*\*추상화(abstraction)\*\*의 힘을 빌립니다. 내부적으로는 여전히 절차적인 코드가 동작하지만, 그 과정을 숨겨 더 높은 수준의 표현력을 제공합니다.

---

## 2. 예제 - React에서 리스트 필터링하기

간단한 예시로, 문자열 배열에서 특정 키워드를 포함하는 아이템만 화면에 렌더링한다고 해봅시다.

### 절차적 방식

```tsx
// /components/ProceduralList.tsx
import { useState } from 'react';

const items = ["apple", "banana", "grape", "pineapple"];

export default function ProceduralList() {
  const [keyword, setKeyword] = useState("");
  const [filtered, setFiltered] = useState(items);

  const handleSearch = () => {
    const result: string[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].includes(keyword)) {
        result.push(items[i]);
      }
    }
    setFiltered(result);
  };

  return (
    <div>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <button onClick={handleSearch}>검색</button>
      <ul>
        {filtered.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

👉 `for` 루프, `if` 조건문, `push` 등 **어떻게 동작할지** 하나하나 명시하고 있습니다.

### 선언적 방식

```tsx
// /components/DeclarativeList.tsx
import { useState } from 'react';

const items = ["apple", "banana", "grape", "pineapple"];

export default function DeclarativeList() {
  const [keyword, setKeyword] = useState("");

  return (
    <div>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <ul>
        {items
          .filter((item) => item.includes(keyword))
          .map((item) => (
            <li key={item}>{item}</li>
          ))}
      </ul>
    </div>
  );
}
```

👉 `filter`와 `map`으로 **무엇을 하고 싶은지**만 선언했습니다. 내부적으로는 결국 `for`와 조건문이 실행되지만, 우리는 그 과정을 보지 않아도 됩니다. 이것이 바로 **추상화된 선언적 스타일**입니다.

---

## 3. 추상화(Abstraction) — 선언적 코드의 핵심

선언적 프로그래밍에서 가장 중요한 개념 중 하나는 **추상화**입니다. 추상화는 세부 구현(어떻게)을 숨기고, 도메인 관점에서 의미 있는 이름과 경계를 통해 **무엇(관계/규칙)** 만 드러내는 작업입니다. 선언적 코드는 단순히 `map`/`filter` 같은 함수 사용을 의미하는 것이 아니라, **그 함수들이 어떠한 추상화(비즈니스 의미)를 제공하는지**가 핵심입니다.

### 추상화가 하는 일

* **의미 전달**: 함수 이름만으로도 무엇을 하는지 읽을 수 있게 한다. (`calculateDiscount` vs `num * (1 - d)`)
* **복잡성 은닉**: 내부 절차(예외 처리, 최적화 등)를 숨겨 호출자는 관계에만 집중한다.
* **재사용성·테스트 용이성**: 작은 단위의 추상화는 독립적으로 검증하고 재조합할 수 있다.

### 추상화 예시

아래는 위의 리스트 필터링 예제를 추상화 관점에서 다시 정리한 코드입니다. 각 함수는 *무엇을 하는지*를 이름으로 나타내고, 합성으로 전체 동작을 구성합니다.

```ts
// /lib/listPipeline.ts
export const filterByKeyword = (keyword: string) => (items: string[]) =>
  items.filter(item => item.includes(keyword));

export const normalize = (items: string[]) =>
  items.map(item => item.trim().toLowerCase());

export const toViewModel = (items: string[]) =>
  items.map(item => ({ id: item, label: item }));

// 파이프 합성 (간단한 compose 구현)
export const compose = (...fns: Function[]) => (arg: any) =>
  fns.reduceRight((v, f) => f(v), arg);

export const buildPipeline = (keyword: string) =>
  compose(toViewModel, normalize, filterByKeyword(keyword));

// 사용
const pipeline = buildPipeline('app');
const result = pipeline([' apple ', 'banana', 'pineapple']);
// result => [{id: 'apple', label: 'apple'}, {id: 'pineapple', label: 'pineapple'}]
```

위 코드에서 **중요한 포인트**는 `filterByKeyword`, `normalize`, `toViewModel` 같은 이름이 곧 비즈니스 관계를 설명한다는 점입니다. 호출부는 이 함수들을 어떻게 구현했는지 알 필요 없이 `keyword -> viewModel`이라는 관계만 이해하면 됩니다.

### 실무에서의 팁

* 추상화 이름에 *도메인 용어*를 사용하라. (예: `applyPromotion`, `isEligibleUser`)
* 한 함수는 한 가지 의미만 가지게 하라(단일 책임 원칙). 복합적 로직이면 더 작은 단위로 분해하라.
* 추상화의 경계를 문서화하고, 인풋/아웃풋(불변성 등)을 명확히 하라.
* 항상 추상화가 필요한 것은 아니다. 성능·디버깅·예외 처리가 중요한 곳에서는 낮은 레벨(절차적) 구현이 더 적합할 수 있다.

---

## 3. 절차적이지만 괜찮은 이유

실무에서는 선언적이 더 “깔끔해 보인다”라는 인식이 강합니다. 하지만 절차적인 코드가 나쁜 건 아닙니다.

* 디버깅 시엔 절차적인 코드가 더 직관적일 수 있습니다.
* 복잡한 예외 처리를 해야 할 때는 오히려 선언적보다 절차적인 접근이 명확합니다.
* 협업 시 팀원 모두가 한눈에 이해하기 쉬운 건 언제나 선언적 코드만은 아닙니다.

즉, **절차적이냐 선언적이냐는 절대적인 선악의 문제가 아니라 상황에 맞는 도구 선택의 문제**입니다.

그리고 잊지 말아야 할 점은, **선언적도 결국 절차적 위에 쌓인 추상화일 뿐**이라는 사실입니다. 우리는 그 추상화를 활용할지, 혹은 직접 절차를 다룰지를 선택할 뿐입니다.

---

## 4. 결론

“절차적이지만 괜찮아”라는 말은 곧,

* 선언적이 미학적으로 멋져 보여도,
* 절차적이 실무적으로 안정적일 때가 많고,
* 결국 코드의 가치는 상황에 맞는 해결을 하는 것에서 나온다.

라는 의미를 담고 싶습니다.

앞으로 팀에서 코드 리뷰할 때도, 선언적/절차적이라는 잣대로 단순히 평가하기보단,
**왜 이 방식을 택했는가**를 먼저 묻고 싶습니다.
