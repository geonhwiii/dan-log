---
title: '[번역] Why Fetch Promise Doesn`t Reject on Error Responses'
summary: '오류 응답에서 fetch가 거부되지 않는 이유'
date: '01 02 2024'
draft: false
tags:
  - 번역
  - fetch
  - Promise
---

![](https://i.imgur.com/ahP0JC8.png)

## The problem

브라우저나 최신 버전의 Node.js에서 `fetch()` 함수를 사용해 본 적이 있다면, 이 함수가 프로미스를 반환한다는 것을 알고 있을 것입니다.

```ts
fetch(request).then((response) => {
  // Handle the response.
});
```

또한 자바스크립트에서 프로미스를 해결하는 동안 오류가 발생하면 프로미스가 거부된다는 것도 알고 계실 겁니다. 하지만 알 수 없는 이유로 `fetch()`에서 반환된 프로미스는 오류 응답을 받을 때 절대 거부되지 않습니다. 이는 혼란스러울 뿐만 아니라 응답을 더 처리하기 전에 명시적으로 응답 상태를 확인해야 합니다:

```ts
fetch(request).then((response) => {
	if (!response.ok) {
		throw new Error(`Server responded with ${response.statusCode}`)
	}
	return response.json()
}
```

이 동작을 자바스크립트의 이상한 점 목록에 추가하기 전에 이 동작이 완전히 올바른지 확인해 보겠습니다. 여러분은 단순히 `fetch` 프로미스가 여러분이 생각하는 것과는 다른 역할을 하기 때문에 이 동작이 예상치 못한 것이라고 생각할 수 있습니다. 설명해드리겠습니다.

## The promise

당연히 요청이 프로미스를 반환하면 이행 상태가 해당 요청의 상태를 반영할 것으로 예상합니다:

- 요청이 성공하면 프라미스가 해결됩니다;
- 요청이 성공하지 못하면(즉, 실패하면) 프라미스는 거부됩니다.

그리고 바로 이런 일이 일어납니다! 네트워크 코드의 관점에서 "성공적인 요청"이 실제로 무엇인지 잘못 해석하고 있을 가능성이 있다는 점을 제외하면 말이죠.
