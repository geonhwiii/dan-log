---
title: '[번역] What is Reconciliation and the Virtual DOM (VDOM)?'
summary: 'Reconciliation and the Virtual DOM'
date: '08 01 2024'
draft: false
image: 'https://playfulprogramming.com/generated/what-is-reconciliation-and-the-vdom.twitter-preview.jpg'
tags:
  - 번역
  - React
  - Reconciliation
---

![](https://playfulprogramming.com/generated/what-is-reconciliation-and-the-vdom.twitter-preview.jpg)

> 원문 : https://playfulprogramming.com/posts/what-is-reconciliation-and-the-vdom

[지난 글](https://danlog.vercel.app/blog/what-is-reactivity)에서 `React`, `Angular` 또는 `Vue`와 같은 최신 프론트엔드 프레임워크가 `"Reactivity"`를 사용하여 자바스크립트 상태를 `DOM`에 쉽게 동기화하는 방법을 소개했습니다. 그 글의 마지막 부분에서 외부 링크를 통해 이러한 각 프레임워크의 반응성 메커니즘이 내부에서 어떻게 작동하는지에 대해 언급했습니다.

`React`와 `Vue`와 같은 프레임워크에서 사용하는 메커니즘 중 하나는 `가상 DOM`(`VDOM`이라고도 함)이며 `"Reconciliation"`이라는 프로세스를 사용하여 이 `VDOM`의 변경 사항을 실제 `DOM`에 반영합니다. 이것이 실제로 어떻게 작동하는지 살펴봅시다.

### 1. `가상 돔(VDOM)`이란 무엇인가요?

간단히 설명하자면 `가상 DOM(VDOM)`은 프레임워크에서 작성한 코드를 반영한 것으로, 결국 `DOM`에 미러링됩니다. 이는 자바스크립트 상태에 대한 업데이트가 `반응성(reactivity)`을 통해 `DOM`에 복제되도록 하기 위한 것입니다. 용어가 너무 어렵나요? 문제없습니다. 여기 예시가 있습니다. 약간의 `HTML`이 있다고 가정해 보겠습니다:

```tsx
<ul>
	<li><p>One</p></li>
	<li><p>One</p></li>
	<li><p>One</p></li>
</ul>
```

이렇게 하면 다음과 비슷하게 보이는 `DOM 트리`가 만들어질 수 있습니다:

![](https://playfulprogramming.com/content/crutchcorn/collections/react-beyond-the-render/posts/what-is-reconciliation-and-the-vdom/dom.svg)


>DOM의 작동 방식에 대해 다시 한 번 알아보고 싶다면 [해당 주제에 대한 포스팅을 참조](https://playfulprogramming.com/posts/understanding-the-dom)하세요.

마찬가지로 다음 JSX를 작성하면 됩니다:

```tsx
const App = () => {
	return (
		<ul>
			<li><p>One</p></li>
			<li><p>One</p></li>
			<li><p>One</p></li>
		</ul>
	)
}
```

JSX에서 작성한 마크업을 미러링하는 `VDOM`이 생성됩니다. 그런 다음 이 `JSX`는 `DOM` 자체에 반영됩니다:

![](https://playfulprogramming.com/content/crutchcorn/collections/react-beyond-the-render/posts/what-is-reconciliation-and-the-vdom/vdom-vs-dom.svg)

이러한 변경 사항이 반영되는 과정을 `Reconciliation`이라고 합니다.


### `Reconciliation`이란 무엇인가요?

`Reconciliation`은 3단계 프로세스를 통해 프레임워크의 `가상 DOM`의 변경 사항을 `DOM`에 반영하는 과정입니다. 

1. 상태의 변경 사항을 감지하기
2. 변경 사항을 `VDOM`에 적용
3. 변경 사항을 `VDOM`에서 `DOM`으로반영(commit)하기


### `key` 속성은 무엇인가요?

이 조정 프로세스는 처음에는 간단해 보이지만 상당히 복잡해질 수 있습니다. 예를 들어 목록을 처리하는 방법을 생각해 보세요: [예시](https://stackblitz.com/github/playfulprogramming/playfulprogramming/tree/main/content/crutchcorn/collections/react-beyond-the-render/posts/what-is-reconciliation-and-the-vdom/react-list-key?template=node&embed=1&file=src%2Fmain.jsx)

```tsx
import { useState } from 'react';

const fakeNames = [
	'Gulgowski',
	'Johnston',
	'Nader',
	'Flatley',
	'Lemke',
	'Stokes',
	'Simonis',
	'Little',
	'Baumbach',
	'Spinka',
];

let id = 0;

function createPerson() {
	return {
		id: ++id,
		name: fakeNames[Math.floor(Math.random() * fakeNames.length)],
	};
}

export default function App() {
	const [list, setList] = useState([
		createPerson(),
		createPerson(),
		createPerson(),
	]);
	
	function addPersonToList() {
		const newList = [...list];
		// 랜덤위치에 new friend 추가
		newList.splice(
			Math.floor(Math.random() * newList.length),
			0,
			createPerson()
		);
		setList(newList);
	}
	
	return (
		<div>
			<h1>My friends</h1>
			<button onClick={addPersonToList}>Add friend</button>
			<ul>
				{list.map((person) => (
					<li>
						<label>
							<div>{person.name} notes</div>
							<input />
						</label>
					</li>
				))}
			</ul>
		</div>
	);
}
```


여기에서는 친구 목록을 저장하고 사용자가 버튼을 눌러 이 목록에 추가할 수 있도록 하고 있습니다. 친구에 대한 메모를 저장할 수 있는 작은 공간도 있습니다! 하지만 누군가가 목록의 시작 부분에 추가되면 그 메모는 어떻게 되는지 주목하세요:

![](https://i.imgur.com/IK9ywlR.gif)


Little에 대한 노트가 이제 어떻게 엉뚱한 사람에게 할당되었는지 보세요. 

`React`는 목록에서 어떤 요소가 어떤 요소인지 식별할 수 있는 방법이 필요하기 때문입니다. 기본적으로 이것은 목록 항목의 인덱스이므로, 원래 목록의 맨 위에 있던 Little에 대한 노트가 다른 사람이 추가되더라도 여전히 목록의 맨 위에 있는 이유입니다. 

이 기본 동작이 없다면 사용자가 목록에 추가할 때마다 기존 항목의 `DOM` 내용을 다시 렌더링하지 않도록 알 수 없기 때문에 목록 내부의 입력이 모두 사라지게 됩니다:

![](https://playfulprogramming.com/content/crutchcorn/collections/react-beyond-the-render/posts/what-is-reconciliation-and-the-vdom/render_without_keys.svg)

이 문제를 해결하려면 특별한 `key` 속성을 사용하여 목록에서 어떤 사용자가 어떤 사용자인지 `React`에 명시적으로 알려주면 됩니다:

```tsx
<ul>
    {list.map((person) => (
      <li key={person.id}>
        <label>
          <div>{person.name} notes</div>
          <input />
        </label>
      </li>
    ))}
</ul>
```


![](https://playfulprogramming.com/content/crutchcorn/collections/react-beyond-the-render/posts/what-is-reconciliation-and-the-vdom/render_with_keys.svg)


### 결론

이 시리즈에서는 `React`가 `반응성(Reactivity)`을 처리하는 방법과 `가상 DOM`과 `reconciliation`을 사용해 `반응성`을 작동시키는 방법을 살펴봤습니다. 

이 두 가지가 결합되어 `React`가 백그라운드에서 작동하는 방식의 토대를 구축합니다. 다음 몇 개의 글에서는 `서버 측 렌더링(SSR)과 정적 사이트 생성(SSG)이란 무엇인가?`를 시작으로 `React`가 일반적인 클라이언트 측 렌더링 프로세스를 지나 서버로 점차 진화하는 과정을 살펴보겠습니다. 

이 시리즈에서는 결국 `React 서버 액션`을 심층적으로 사용하는 방법과 `React` 지식을 활용하여 풀 스택 개발자가 되는 방법을 보여줄 것입니다.

