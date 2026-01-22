---
title: "tailwind3.4 활용하기"
summary: "tailwindcss v3.4 기능 활용하기"
date: "05 01 2024"
draft: false
image: "https://tailwindcss.com/_next/static/media/card.a1cd9cff.jpg"
tags:
  - CSS
---

![](https://tailwindcss.com/_next/static/media/card.a1cd9cff.jpg)

> 작년에 `tailwindcss`가 3.4로 업데이트 되면서 추가된 유용한 기능을 알아봅니다.

## 1. dvh (Dynamic Viewport Height)

최신 모바일 브라우저에서는 스크롤에 따라 상하단 메뉴 막대가 생겼다가 사라졌다가 합니다.

이로 인해 `100vh`는 뷰포트의 높이를 동적으로 지원하지는 않습니다.

반응형 웹을 지원한다면 특정 상황을 제외하곤 `100vh`보단 `100dvh`를 권장합니다.

이를 지원하기 위해서는 기존에는 수동으로 `h-[100dvh]`를 사용했어야 하지만,

`h-dvh`로 공식 지원하기 시작했습니다.

```tsx
// v3.4 이전
<div className="h-[100dvh]">
	...
</div>

// v3.4 이후
<div className="h-dvh">
	...
</div>
```

이외 `svh(Short Viewport Height)`, `lvh(Large Viewport Height)`가 있으나 활용빈도가 적습니다.

## 2. :has()

`:has()` 는 부모뿐만 아니라 자식을 기준으로 요소의 스타일을 지정할 수 있습니다.

또한 형제를 기준으로 스타일을 지정하는 것도 가능합니다.

특히, 아래 예제처럼 `input`과 같은 상태를 UI로 핸들링할 때 유용합니다.

```tsx
// label 하위에 disabled가 있을 경우 opacity-50을 적용합니다.
<label className="has-[:disabled]:opacity-50 ...">
	<input disabled ... />
</div>

// 라디오 버튼이 checked 상태일 때, label의 스타일을 활성화합니다.
<label class="has-[:checked]:ring-blue-500 has-[:checked]:text-blue-900 ..">
	<input type="radio" checked class="accent-pink-500 ..." />
</label>

```

## 3. \* 로 자식 스타일링

`*`를 이용하여 하위 자식들의 스타일을 설정할 수 있습니다.

아래 예제의 사용 전/후를 비교하면 얼마나 유용한 지 바로 체감이 됩니다.

```tsx
// v3.4 이전
<ul>
	<li className="list-disc text-blue-500 px-2 py-1 border border-blue-500">리스트 1</li>
	<li className="list-disc text-blue-500 px-2 py-1 border border-blue-500">리스트 2</li>
	<li className="list-disc text-blue-500 px-2 py-1 border border-blue-500">리스트 3</li>
</ul>

// v3.4 이후
<ul className="*:list-disc *:text-blue-500 *:px-2 *:py-1 *:border *:border-blue-500">
	<li>리스트 1</li>
	<li>리스트 2</li>
	<li>리스트 3</li>
</ul>

// 아래처럼 각 자식요소에 hover시 underline과 같은 스타일링도 가능하다.
<ul class="hover:*:underline *:cursor-pointer">
    <li>리스트 1</li>
    <li>리스트 2</li>
	<li>리스트 3</li>
</ul>
```

아래 공식문서의 예제처럼 다양한 활용도 기대해볼 수 있습니다.

원래라면 하위 컴포넌트로 prop을 내려서 스타일링을 했어야하는데요...😅

```tsx
// 부모 컴포넌트에서 자식에 data-[slot=description]일 때 'mt-4'를 적용하도록 합니다.
function Field({ children }) {
	return (
		<div className="data-[slot=description]:*:mt-4 ...">
			{children}
		</div>
	)
}

// 자식 컴포넌트에 data-slot="description"을 추가합니다.
function Description({ children }) {
	return (
		<p data-slot="description" ...>
			{children}
		</p>
	)
}

// <Field>하위에 <Description> 컴포넌트에 'mt-4'가 적용됩니다.
function Example() {
	return (
		<Field>
			<Label>First name</Label>
			<Input />
			<Description>Please tell me you know your own name.</Description>
		</Field>
	)
}
```

## 4. size-\*

`w-2 h-2`와 같이 동일한 넓이, 높이를 스타일링을 반복해서 입력하는 부분을 대체합니다.

아래처럼 원이나 사각형 모양을 그릴 때 자주 사용되겠네요.

```tsx
// v3.4 이전
<div className="w-4 h-4 rounded-full border border-blue-500" />

// v3.4 이후
<div className="size-4 rounded-full border border-blue-500" />
```

## 5. text-balance & text-pretty

둘다 익숙하지 않은 `text-wrap` 유틸리티 입니다.

`text-balance`의 경우 제목 또는 부제목에 주로 쓰이며,

줄을 나눌 때, 밸런스있게(?) 나눠줍니다.

```tsx
// text-balance 비교
<div class="p-10">
	<div class="p-4 mb-5 w-[240px] border-2 border-red-500">
	  <h1 class="text-xl font-bold">스타일에 밸런스가 없는 제목입니다. 눈에 보이시나요?<h1>
	</div>
	<div class="p-4 w-[240px] border-2 border-black">
	  <h1 class="text-balance text-xl font-bold">스타일에 밸런스가 있는 제목입니다. 눈에 보이시나요?<h1>
	</div>
</div>
```

<img src="https://i.imgur.com/KlEZGr3.png" alt="text-balance-example" width="300" height="auto">

`text-pretty`는 문단 마지막에 한 단어씩만 남는 경우를 방지하는(?) 것인데, 사진으로 대체합니다.

아직은 자주 사용하진 않을 것 같습니다... ( 위: 미적용, 아래: 적용 )

위 기능들은 최신 브라우저에 동작하지만, 지원하지 않을 경우 기존 래핑 동작을 사용하므로,

호환에 크게 영향을 받지 않는 점이 장점입니다.

<img src="https://i.imgur.com/lLH0NkM.png" alt="text-pretty-example" width="300" height="auto">
