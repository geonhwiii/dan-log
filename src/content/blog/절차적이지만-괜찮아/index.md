---
title: 절차적이지만 괜찮아
summary: 선언적 프로그래밍과 절차적 프로그래밍의 활용
date: 09 10 2025
draft: false
tags:
  - Journal
---

![](https://i.imgur.com/vwrm5NC.jpeg)

> 원작은 "사기꾼이지만 괜찮아" 입니다.

리액트를 개발하다보면 선언적 프로그래밍에 대해 많이 듣게 됩니다.

_"선언적이라서 가독성이 좋은 걸까요?"_

_"선언적이면 더 나은 추상화라고 보면 될까요?"_

_"절차적인 코드는 나쁜 코드일까요?"_

물론 이런 글을 쓴다는 것은 위 질문들은 모두 정답이 아니라는 것입니다.

---

## 1. 선언적 vs 절차적 프로그래밍

프로그래밍 스타일을 크게 나누면 두 가지로 이야기할 수 있습니다.

- **절차적(Procedural)**: 원하는 결과를 얻기 위해 _어떻게(how)_ 동작할지 구체적으로 작성하는 방식.
- **선언적(Declarative)**: 원하는 결과가 _무엇(what)_ 인지만 선언하고, 내부 동작은 추상화에 맡기는 방식.

### 특징 비교

#### 절차적 프로그래밍의 특징

- **명시적 제어**: 코드의 실행 흐름을 개발자가 직접 제어할 수 있어 디버깅이 용이합니다.
- **성능 최적화**: 필요한 부분에 정확한 최적화를 적용할 수 있습니다.
- **예외 처리**: 복잡한 에러 상황을 세밀하게 처리할 수 있습니다.
- **단점**: 코드가 길어지고, 비즈니스 로직과 구현 세부사항이 섞여 가독성이 떨어질 수 있습니다.

#### 선언적 프로그래밍의 특징

- **간결성**: 코드가 짧고 의도가 명확하게 드러납니다.
- **재사용성**: 추상화된 함수들을 조합하여 다양한 로직을 만들 수 있습니다.
- **테스트 용이성**: 작은 단위의 함수들을 독립적으로 테스트하기 쉽습니다.
- **단점**: 내부 동작이 숨겨져 있어 성능 이슈나 예외 상황 처리가 어려울 수 있습니다.

### 추상화

선언적 프로그래밍은 결국 `추상화(abstraction)`의 힘을 빌립니다. 내부적으로는 여전히 절차적인 코드가 동작하지만, 그 과정을 숨겨 더 높은 수준의 표현력을 제공합니다.

예를 들어, React의 `useState`는 내부적으로 복잡한 상태 관리 로직을 추상화하여 개발자가 "상태를 선언한다"는 의도만 표현할 수 있게 해줍니다. 이는 단순히 코드를 숨기는 것이 아니라, **도메인 개념을 코드로 표현**하는 것입니다.

---

## 2. 예제 - 사용자 목록에서 관리자만 필터링하기

실무에서 자주 마주치는 상황으로, 사용자 목록에서 관리자 권한을 가진 사용자만 화면에 표시하는 기능을 구현해봅시다.

### 절차적 방식

```tsx
// /components/ProceduralUserList.tsx
import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  role: "admin" | "user";
  email: string;
}

const users: User[] = [
  { id: 1, name: "김철수", role: "admin", email: "kim@example.com" },
  { id: 2, name: "이영희", role: "user", email: "lee@example.com" },
  { id: 3, name: "박민수", role: "admin", email: "park@example.com" },
];

export default function ProceduralUserList() {
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  useEffect(() => {
    const result: User[] = [];

    // 1단계: 모든 사용자를 순회
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      // 2단계: 관리자인지 확인
      if (user.role === "admin") {
        result.push(user);
      }
    }

    // 3단계: 결과를 상태에 저장
    setAdminUsers(result);
  }, []);

  return (
    <div>
      <h2>관리자 목록</h2>
      <ul>
        {adminUsers.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- **어떻게(How)**: `for` 루프로 순회 → `if` 조건으로 필터링 → `push`로 결과 추가 → `setState`로 저장하는 **단계별 과정**을 명시적으로 작성했습니다.

### 선언적 방식

```tsx
// /components/DeclarativeUserList.tsx
import { useState } from "react";

interface User {
  id: number;
  name: string;
  role: "admin" | "user";
  email: string;
}

const users: User[] = [
  { id: 1, name: "탄지로", role: "admin", email: "tan@example.com" },
  { id: 2, name: "네즈코", role: "user", email: "nae@example.com" },
  { id: 3, name: "젠이츠", role: "admin", email: "zen@example.com" },
];

export default function DeclarativeUserList() {
  const [showAdminsOnly, setShowAdminsOnly] = useState(true);

  return (
    <div>
      <h2>사용자 목록</h2>
      <label>
        <input
          type="checkbox"
          checked={showAdminsOnly}
          onChange={(e) => setShowAdminsOnly(e.target.checked)}
        />
        관리자만 보기
      </label>
      <ul>
        {users
          // 1. 필터링: "관리자만 보기"가 체크되어 있으면 관리자만, 아니면 모든 사용자
          .filter((user) => !showAdminsOnly || user.role === "admin")
          // 2. 변환: 각 사용자 객체를 JSX 요소로 변환
          .map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
      </ul>
    </div>
  );
}
```

- **무엇(What)**: "관리자만 필터링해서 보여줘"라는 **의도**만 선언했습니다. `filter`와 `map`이 내부적으로 어떻게 동작하는지는 신경 쓰지 않습니다.
- **체이닝**: 함수들을 연결해서 데이터 변환 파이프라인을 만듭니다.
- **선언적 표현**: "어떻게"가 아닌 "무엇을" 하고 싶은지만 코드에 드러냅니다.

---

## 3. 추상화(Abstraction) — 선언적 코드의 핵심

선언적 프로그래밍에서 가장 중요한 개념 중 하나는 **추상화**입니다. 추상화는 세부 구현(어떻게)을 숨기고, 도메인 관점에서 의미 있는 이름과 경계를 통해 **무엇(관계/규칙)** 만 드러내는 작업입니다. 선언적 코드는 단순히 `map`/`filter` 같은 함수 사용을 의미하는 것이 아니라, **그 함수들이 어떠한 추상화(비즈니스 의미)를 제공하는지**가 핵심입니다.

### 추상화가 하는 일

- **의미 전달**: 함수 이름만으로도 무엇을 하는지 읽을 수 있게 한다. (`calculateDiscount` vs `num * (1 - d)`)
- **복잡성 은닉**: 내부 절차(예외 처리, 최적화 등)를 숨겨 호출자는 관계에만 집중한다.
- **재사용성·테스트 용이성**: 작은 단위의 추상화는 독립적으로 검증하고 재조합할 수 있다.

### 추상화 예시

아래는 위의 리스트 필터링 예제를 추상화 관점에서 다시 정리한 코드입니다. 각 함수는 *무엇을 하는지*를 이름으로 나타내고, 합성으로 전체 동작을 구성합니다.

```ts
// /lib/listPipeline.ts
export const filterByKeyword = (keyword: string) => (items: string[]) =>
  items.filter((item) => item.includes(keyword));

export const normalize = (items: string[]) =>
  items.map((item) => item.trim().toLowerCase());

export const toViewModel = (items: string[]) =>
  items.map((item) => ({ id: item, label: item }));

// 파이프 합성 (간단한 compose 구현)
export const compose =
  (...fns: Function[]) =>
  (arg: any) =>
    fns.reduceRight((v, f) => f(v), arg);

export const buildPipeline = (keyword: string) =>
  compose(toViewModel, normalize, filterByKeyword(keyword));

// 사용
const pipeline = buildPipeline("app");
const result = pipeline(["apple", "banana", "pineapple"]);
// result => [{id: 'apple', label: 'apple'}, {id: 'pineapple', label: 'pineapple'}]
```

위 코드에서 **중요한 포인트**는 `filterByKeyword`, `normalize`, `toViewModel` 같은 이름이 곧 비즈니스 관계를 설명한다는 점입니다. 호출부는 이 함수들을 어떻게 구현했는지 알 필요 없이 `keyword -> viewModel`이라는 관계만 이해하면 됩니다.

### 실무에서의 팁

- 추상화 이름에 *도메인 용어*를 사용하기. (예: `applyPromotion`, `isEligibleUser`)
- 한 함수는 한 가지 의미만 가지게 하가(단일 책임 원칙). 복합적 로직이면 더 작은 단위로 분해하기.
- 항상 추상화가 필요한 것은 아닙니다. 성능·디버깅·예외 처리가 중요한 곳에서는 절차적 구현이 더 적합할 수 있습니다.

---

## 3. 절차적이지만 괜찮아

실무에서는 선언적이 더 "깔끔해 보인다"라는 인식이 강합니다. 하지만 절차적인 코드가 나쁜 건 아닙니다.

### 절차적이 더 나은 상황들

#### 1. 복잡한 예외 처리

```tsx
// 선언적 방식
const processPayment = (amount: number, paymentMethod: string) => {
  return paymentMethods
    .find((method) => method.type === paymentMethod)
    ?.process(amount)
    .catch((error) => {
      // 에러 처리가 애매함 - 어떤 단계에서 실패했는지 모름
      console.error("결제 실패");
      throw error;
    });
};

// 절차적 방식
const processPayment = async (amount: number, paymentMethod: string) => {
  try {
    // 1단계: 결제 수단 검증
    const method = paymentMethods.find((m) => m.type === paymentMethod);
    if (!method) {
      throw new Error("지원하지 않는 결제 수단입니다");
    }

    // 2단계: 금액 검증
    if (amount <= 0) {
      throw new Error("결제 금액이 올바르지 않습니다");
    }

    // 3단계: 결제 처리
    const result = await method.process(amount);

    // 4단계: 로그 기록
    console.log(`결제 완료: ${amount}원, ${paymentMethod}`);

    return result;
  } catch (error) {
    // 5단계: 에러 처리 및 복구
    console.error("결제 실패:", error.message);

    // 실패한 결제에 대한 롤백 처리
    await rollbackPayment(amount, paymentMethod);

    throw error;
  }
};
```

#### 2. 성능이 중요한 상황

```tsx
// 선언적 방식
const ExpensiveComponent = ({ items }) => {
  return (
    <div>
      {items
        .filter((item) => item.isActive) // 모든 아이템 순회
        .map((item) => item.name) // 다시 모든 아이템 순회
        .filter((name) => name.length > 3) // 또 다시 모든 아이템 순회
        .map((name) => (
          <div key={name}>{name}</div>
        ))}
    </div>
  );
};

// 절차적 방식
const OptimizedComponent = ({ items }) => {
  const processedItems = useMemo(() => {
    const result = [];

    // 한 번의 순회로 모든 작업 처리
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.isActive && item.name.length > 3) {
        result.push(<div key={item.id}>{item.name}</div>);
      }
    }

    return result;
  }, [items]);

  return <div>{processedItems}</div>;
};
```

복잡한 예외 처리를 해야 할 때는 오히려 선언적보다 절차적인 접근이 명확합니다

협업 시 팀원 모두가 한눈에 이해하기 쉬운 건 언제나 선언적 코드만은 아닙니다.

즉, **절차적이냐 선언적이냐는 상황에 맞게 선택하면 될 문제**입니다.
