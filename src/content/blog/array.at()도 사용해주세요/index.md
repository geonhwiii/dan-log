---
title: '[JS] array.at()도 사용해주세요'
summary: 'javascript array.at()의 정의와 사용 예시'
date: '12 24 2023'
draft: false
tags:
  - Javascript
  - Array.at()
---

> MDN : https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/at

## 1. array.at(index)

`Array.at()` : `Array` 인스턴스의 **`at()`** 메서드는 정숫값을 받아 해당 인덱스에 있는 항목을 반환하며, 양수와 음수를 사용할 수 있습니다. 음의 정수는 배열의 마지막 항목부터 거슬러 셉니다.

**index** : 반환할 배열 요소의 0부터 시작하는 인덱스로, [정수로 변환](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Number#%EC%A0%95%EC%88%98_%EB%B3%80%ED%99%98)됩니다. 음수 인덱스는 배열 끝부터 거슬러 셉니다. `index < 0`인 경우, `index + array.length`로 접근합니다.

```typescript
const fruits = ['사과', '바나나', '키위'];

fruits.at(1); // '사과'

fruits.at(-1); // '키위'

fruits[fruits.length - 1]; // '키위'

fruits.at(-2); // '바나나'
```

큰 차이는 없지만, 가독성 측면에서 장점이 많으므로 자주 사용해도 좋을 것 같습니다 :)

<br />

![](https://i.imgur.com/fo6uwvO.png)
