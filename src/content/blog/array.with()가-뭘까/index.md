---
title: '[JS] array.with()가 뭘까?'
summary: 'javascript array.with()의 정의와 사용 예시'
date: '12 20 2023'
draft: false
tags:
  - Javascript
  - Array.with()
---

> MDN : [Array.prototype.with()](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/with)

## 1. array.with(index, value)

`Array` 인스턴스의 **`with()`** 메서드는 주어진 인덱스의 값을 변경하기 위해 [대괄호 표기법](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Property_accessors#bracket_notation)을 사용하는 것의 [복사](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods) 버전입니다. 이 함수는 지정된 인덱스의 요소가 지정된 값으로 대체된 새 배열을 반환합니다.

```ts
// 1. 하나의 요소만 변경한 채로 새로운 배열 만들기
const arr = [1, 2, 3, 4, 5];
console.log(arr.with(2, 6)); // [1, 2, 6, 4, 5]
console.log(arr); // [1, 2, 3, 4, 5]
```

```ts
// 2. 배열 메서드 연속하여 연결하기
const arr = [1, 2, 3, 4, 5];
console.log(arr.with(2, 6).map((x) => x ** 2)); // [1, 4, 36, 16, 25]
```

```ts
// 3. 희소 배열에서 with() 사용하기
const arr = [1, , 3, 4, , 6];
console.log(arr.with(0, 2)); // [2, undefined, 3, 4, undefined, 6]
```

## 2. 예시

위 예제 1, 2번 처럼 배열의 특정 인덱스의 값을 변경할 때 사용하고, 장점으로는 리턴값으로 복사본을 전달하기 때문에, `array.replace()`같은 메서드와 다르게 불변성을 유지하고 원본 데이터를 유지합니다.

```tsx
// 1. array.slice()
const SliceExample = () => {
  const [items, setItems] = useState(['사과', '바나나', '체리']);
  const replaceItem = () => {
    const modifiedItems =  [...items.slice(0, 1), '포도', ...items.slice(2)];
    setItems(modifiedItems);
  };
  return (
    <div>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <button onClick={replaceItem}>Replace Banana with Grape</button>
    </div>
  );
};

// 2. array.with()
const WithExample = () => {
  const [items, setItems] = useState(['사과', '바나나', '체리']);
  const withItem = () => {
    const modifiedItems = items.with(1, '포도');
    setItems(modifiedItems);
  };

  return (
    <div>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <button onClick={withItem}>Replace Banana with Grape</button>
    </div>
  );
};

```
