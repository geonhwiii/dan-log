---
title: '[번역] What is Reactivity?'
summary: 'React Beyond the Render - What is Reactivity?'
date: '07 24 2024'
draft: false
tags:
  - 번역
  - React
---

![](https://playfulprogramming.com/generated/what-is-reactivity.twitter-preview.jpg)

> 원문 : https://playfulprogramming.com/posts/what-is-reactivity


숙련된 프론트엔드 엔지니어인 저는 다음과 같은 질문을 자주 받습니다.

>"왜 React, Angular 또는 Vue와 같은 최신 프론트엔드 프레임워크를 사용하려고 하나요?"

이 주제에 대한 [전체(무료) 책](https://framework.guide/) 이 있지만, 제 짧은 대답은 일반적으로 `"Reactivity"`입니다. 

>"Reactivity란 무엇인가요?" 

간단히 말해 `Reactivity`란 자바스크립트 애플리케이션의 메모리에 있는 내용을 `DOM`에 `HTML`로 반영하는 기능입니다. 정적 `HTML`만 사용하여 웹사이트를 구축하는 경우 `DOM`에 대한 출력은 간단합니다.

```jsx
<!-- index.html -->
<main id="a">
	<ul id="b">
		<li id="c">Item 1</li>
		<li id="d">Item 2</li>
	</ul>
	<p id="e">Text here</p>
</main>
```

문제는 출력에 상호작용을 도입하고자 할 때 시작됩니다. 

다음과 같은 소규모 애플리케이션을 만들어 보겠습니다. 

1. 내부에 카운터가 있는 버튼이 있습니다. 
2. 버튼을 클릭할 때마다 카운터를 0에서 시작합니다.
3. 버튼을 클릭할 때마다, 카운터에 1을 추가합니다.

이를 위해 몇 가지 HTML부터 시작하겠습니다:

```html
<main>
	<button id="add-button">Count: 0</button>
</main>
```

그런 다음 필요한 자바스크립트를 추가하여 버튼이 작동하도록 만들 수 있습니다.

```html
<script>
let count = 0;

const addBtn = document.querySelector('#add-button'); addBtn.addEventListener('click', () => {
	count++; 
	addBtn.innerText = `Count: ${count}`; 
});
</script>
```


### 목록 추가하기

너무 나쁘지 않다면 난이도를 조금 더 높여 보겠습니다.

1. 정렬되지 않은 목록 추가하기 (`<ul/>`)
2. 개수가 늘어날 때마다 내부에 고유 문자열이 포함된 새 `<li>`를 추가합니다.

다음과 같이 보일 수 있습니다.

```html
<main>
	<button id="add-button">Count: 0</button>
	<ul id="list"></ul>
</main>
<script>
	let count = 0;
	const listEl = document.querySelector('#list');
	function makeListItem(innerText) {
		const li = document.createElement('li');
		li.innerText = innerText;
		listEl.append(li); 
	}
	const addBtn = document.querySelector('#add-button');
	addBtn.addEventListener('click', () => {
		count++;
		addBtn.innerText = `Count: ${count}`;
		makeListItem(`List item: ${count}`);
	});
</script>
```


### 목록에서 항목 제거하기

좋아요! 열기가 뜨거워지고 있습니다! 마지막으로 한 가지 연습을 해보겠습니다:

1. 카운트에서 1을 제거하는 버튼 추가
2. 이 버튼을 누르면 목록에서 마지막 요소를 제거합니다.

```html
<main>
	<button id="add-button">Add one to: 0</button>
	<button id="remove-button">Remove one from: 0</button>
	<ul id="list"></ul>
</main>

<script>
	let count = 0;
	const listEl = document.querySelector('#list');
	function makeListItem(innerText) {
		const li = document.createElement('li');
		li.innerText = innerText; listEl.append(li); 
	}
	function removeListItem() {
		listEl.lastChild.remove(); 
	}

	const addBtn = document.querySelector('#add-button');
	const removeBtn = document.querySelector('#remove-button');
	
	function updateBtnTexts() {
		addBtn.innerText = `Add one to: ${count}`;
		removeBtn.innerText = `Remove one from: ${count}`;
	} 
	addBtn.addEventListener('click', () => {
		count++;
		updateBtnTexts();
		makeListItem(`List item: ${count}`);
	}); 
	removeBtn.addEventListener('click', () => {
		count--;
		updateBtnTexts();
		removeListItem(); 
	});
</script>
```

> 와우! 복잡해졌죠?! 바로 그거죠?! 

맞아요... 그래서 질문이 생겼습니다.


### 더 간단해야 하지 않을까요?

개수에 의존하는 다른 항목을 추가할 때마다 데이터는 변하지 않는 것을 알 수 있습니다. 

대신 자바스크립트 상태를 해당 상태의 `DOM` 표현에 붙이기 위해 코드베이스에 점점 더 많은 수준의 복잡성을 추가해야 했습니다. 

이 접착제를 모두 제거하면 코드베이스가 대폭 간소화됩니다:

```html
<main>
	<button id="add-button">Add one to: 0</button>
	<button id="remove-button">Remove one from: 0</button> <ul id="list"></ul></main>

<script>
	// 'count'가 변경되면 DOM이 자동 업데이트되는 마법의 지역
	let count = 0;
	addBtn.addEventListener('click', () => { count++; });
	removeBtn.addEventListener('click', () => { count--; });
</script>
```

>얼마나 많은 줄이 사라졌는지 보세요!

이 더 멋진 코드 작성 방법은 이론적으로 가능할 뿐만 아니라 수백만 명의 개발자가 프론트엔드 프레임워크를 통해 널리 채택하고 있습니다. 

프론트엔드 프레임워크의 몇 가지 예는 다음과 같습니다.

- React
- Vue
- Angluar

```tsx
// 예시는 React로만 표기합니다.
const App = () => {
	const [count, setCount] = useState(0);
	return (
		<div>
			<button onClick={() => setCount(count + 1)}>Add one to: {count}</button>
			<button onClick={() => setCount(count - 1)}> Remove one from: {count} </button>
			<ul>
				{Array.from({ length: count }).map((_, i) => (
					<li>List item {i}</li>
				))} 
			</ul>
		</div>
	);
};
```


독자 여러분, 이것이 바로 `Reactivity`의 핵심 아이디어입니다.

자바스크립트에 저장된 상태를 어떻게 변경할 것인지에 집중하고 다른 메커니즘이 화면에 표시되는 방식을 추상화할 수 있도록 하는 것입니다. 

이러한 메커니즘은 매우 다른 방법을 사용할 수도 있습니다! 

예를 들어 각 프레임워크가 내부적으로 활용하는 방법은 다음과 같습니다.

| 프레임워크   | Reactivity Method                                                                    | Rendering Method                                                                       |
| ------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| React   | [Explicit Function Calls](https://twitter.com/crutchcorn/status/1527059716907487232) | [VDOM](https://playfulprogramming.com/posts/unraveling-the-magic-of-the-virtual-dom)   |
| Angular | [Zone.js](https://playfulprogramming.com/posts/angular-internals-zonejs)             | [Incremental DOM](https://blog.angular.io/how-the-angular-compiler-works-42111f9d2549) |
| Vue     | [Proxies](https://vuejs.org/guide/extras/reactivity-in-depth.html)                   | [VDOM](https://playfulprogramming.com/posts/unraveling-the-magic-of-the-virtual-dom)   |

>지금은 정말 괴짜 같은 시간입니다. 지금 이 말이 횡설수설처럼 들리더라도 기분 나빠하지 마세요.


### 결론

지금까지 반응성이란 무엇이며 왜 최신 프론트엔드 프레임워크를 사용하여 앱에서 이를 활용해야 하는지 살펴보았습니다. 

다음 시간에는 "조정"이 무엇이며 오늘날 대부분의 React 및 Vue 프론트엔드 애플리케이션에 미치는 영향에 대해 이야기하겠습니다.