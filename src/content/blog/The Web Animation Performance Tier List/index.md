---
title: "[번역] The Web Animation Performance Tier List"
summary: "Learn what makes web animations fast, slow, and everything in between with our 2025 web animation performance tier list."
date: "11 29 2025"
draft: false
image: "https://framerusercontent.com/images/65KmMjzVQVCjDt3he45PvCzZWo.png?width=1200&height=630"
tags:
  - 번역
  - React
---

![](https://framerusercontent.com/images/65KmMjzVQVCjDt3he45PvCzZWo.png?width=1200&height=630)

> 원문 : https://motion.dev/blog/web-animation-performance-tier-list

# 웹 애니메이션 성능 티어 리스트

애니메이션 성능은 제가 가장 많이 질문받는 주제 중 하나입니다. 당연한 일이죠 - 애니메이션 UI를 만드는 이유는 부드럽고 반응성 있게 느껴지게 하기 위함입니다. 만약 이 애니메이션들이 제대로 동작하지 않는다면, 오히려 전체 경험에 해가 됩니다.

하지만 성능은 종종 마법처럼 느껴질 수 있습니다. 범위가 넓고, 매우 미묘하며, 트레이드오프로 가득 차 있습니다.

이 글에서는 웹 애니메이션 성능에 대해 제가 아는 모든 것을 공유합니다. `will-change`를 언제 사용해야 하는지(그리고 언제 사용하지 말아야 하는지), CSS 변수가 왜 사실 좋지 않은지, 하드웨어 가속이 무엇을 의미하는지 - 모든 것을 다룰 것입니다.

네, 기술적인 세부 사항으로 들어가서 이러한 미묘함과 트레이드오프에 대해 이야기할 것입니다. 동시에, 모든 것을 애니메이션 성능 티어 리스트로 분류하여 어떤 기법을 선호해야 하고, 어떤 것을 주의해서 사용해야 하며, 어떤 것을 완전히 피해야 하는지 쉽게 기억할 수 있도록 하겠습니다.

## 렌더 파이프라인

순위를 매기기 전에, 브라우저의 렌더 파이프라인에 대해 조금 이해해야 합니다.

이것은 브라우저가 모든 HTML, CSS, 폰트, 이미지를 가져와서 화면에 보이는 최종 이미지로 변환하는 과정입니다.

모든 브라우저는 세부 사항에서 다르지만, 모두 같은 큰 단계를 따릅니다. 먼저, 각 요소에 적용될 스타일을 계산해야 합니다.

그것을 알고 나면, 다음 순서로 세 가지 렌더 단계가 실행됩니다:

1. 레이아웃: 모든 요소의 기하학적 속성을 계산합니다. 어디에 있는가? 얼마나 큰가? 답은 width, position, display 등의 규칙에 의해 결정됩니다.

2. 페인트: 어떤 요소들을 레이어로 그룹화할지 결정하고 픽셀을 그립니다. background-color나 color 같은 값을 변경하면 페인트가 트리거됩니다.

3. 컴포짓: 이 별도의 이미지들을 가져와서 하나로 합칩니다. transform과 filter 같은 값을 사용하면 페인트를 트리거하지 않고 컴포짓된 레이어를 조작할 수 있습니다.

중요한 점은 한 단계를 트리거하면 그 이후의 모든 단계가 트리거된다는 것입니다. 다시 말해, 레이아웃을 트리거하면 페인트와 컴포짓도 필요합니다. 반면 컴포짓을 트리거하면 다른 단계를 다시 실행할 필요가 없습니다.

![](https://framerusercontent.com/images/Wf9pdbE2d01jqB7ZXi8a9D6ecWo.png)

각 단계를 실행하는 정확한 비용(시간 측면에서)은 완전히 상황에 따라 다르며, 이것을 프로파일링하는 것은 그 자체로 별도의 글이 될 수 있습니다(되어야 합니다?). 하지만 예를 들어 페인트를 트리거하는 것은 컴포짓을 트리거하는 것보다 항상 더 비쌉니다. 왜냐하면 페인트를 하면 항상 컴포짓도 해야 하기 때문입니다.

### 스레드

추가로, 이러한 단계들 대부분이 "메인 스레드"에서 순차적으로, 하나씩 일어난다는 것을 알아야 합니다. 이것은 대부분의 JavaScript와 다른 브라우저 작업이 발생하는 CPU 프로세스입니다.

따라서 메인 스레드가 바쁘면, 렌더 파이프라인이 화면 업데이트를 차단당하고, 이것은 끊기는 애니메이션으로 나타납니다.

하지만 "컴포지터 스레드"도 있습니다. 스타일 변경(예: transform)이 컴포짓 단계만 트리거하면, 애니메이션 자체를 컴포지터 스레드에서 실행할 수 있는 경우가 많습니다. 이 경우, 메인 스레드가 차단되더라도 애니메이션은 부드럽게 유지됩니다.

![](https://framerusercontent.com/images/bnd24yVUN4rmGbIKZhxhEBxRUA.png)

### 티어

이제 브라우저가 실제로 어떻게 동작하는지 이해했으니, 애니메이션 기법을 순위 매기기 위한 기본 티어를 만들 수 있습니다:

- S-티어: 완전히 컴포지터 스레드에서 실행될 수 있는 애니메이션.

- A-티어: 메인 스레드에서 실행되지만 컴포지터를 트리거함.

- B-티어: 일부 DOM 설정 측정을 포함하지만, 그 후 A 또는 S-티어 애니메이션으로 실행됨.

- C-티어: 페인트를 트리거함.

- D-티어: 레이아웃을 트리거함.

- F-티어: 곧 보게 될 겁니다!

위의 내용에는 수많은 예외가 있습니다 - 그래서 이 글의 나머지가 있는 것입니다.

논의한 대로, 성능 좋은 애니메이션을 원하는 이유는 부드럽고 반응성 있는 UI를 만들기 위함입니다. 따라서 성능은 좋지만 어떤 이유로 반응성이 느껴지지 않는 애니메이션 기법은 등급이 하락합니다.

이 모든 것과 더 많은 것을 다룰 것입니다. 그럼 시작해봅시다!

## S-티어

S-티어 애니메이션은 완전히 컴포지터 스레드에서 실행될 수 있습니다. 무거운 메인 스레드 작업이 S-티어 애니메이션에 영향을 주지 않습니다 - 부드러운 60 또는 120fps를 유지합니다.

![](https://framerusercontent.com/images/V34YV2s7zfiI9GwLaG0aRx2mDo.png)

### 컴포지터 스타일

일반적으로 컴포지터를 통해 애니메이션할 수 있는 스타일은 `transform`, `opacity`, `filter`, `clip-path`입니다.

CSS, [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)(WAAPI), 또는 WAAPI를 지원하는 애니메이션 라이브러리([Motion](https://motion.dev/) 같은)로 이 값들을 애니메이션하면 메인 스레드가 바쁠 때도 애니메이션이 부드럽게 유지됩니다.

```ts
animate(".box", { opacity: 1 });
```

반면, `requestAnimationFrame` 기반 JavaScript 라이브러리(GSAP 같은)도 같은 속성을 업데이트할 수 있지만, 애니메이션 자체는 메인 스레드에서 실행됩니다. 이것은 애니메이션이 중단 가능하다는 의미입니다 - 보통은 부드럽지만, 메인 스레드가 차단될 때마다 버벅임에 취약합니다.

### 스타일 재계산 피하기

하드웨어 가속 애니메이션의 또 다른 주요 이점은 스타일을 재계산하지 않고도 요소의 시각적 모습을 업데이트할 수 있다는 것입니다.

기억하세요, 이것은 브라우저가 레이아웃, 페인트 또는 컴포짓 단계를 트리거해야 하는지 결정하기 전에 실행되는 메인 스레드 프로세스입니다.

스타일 재계산 자체가 매우 비용이 많이 들 수 있습니다. 특히 복잡한 DOM 구조나 느린 [CSS 선택자](https://web.dev/articles/reduce-the-scope-and-complexity-of-style-calculations)를 사용하는 페이지에서는 더욱 그렇습니다.

### 스크롤 애니메이션

CSS, WAAPI, 또는 Motion의 [`scroll()`](https://motion.dev/docs/scroll) 함수를 통해 [Scroll Timeline](https://developer.mozilla.org/en-US/docs/Web/API/ScrollTimeline)이나 [View Timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-timeline)을 사용하여 이러한 컴포지터 값을 애니메이션할 때, 이 스크롤 애니메이션들도 하드웨어 가속됩니다.

```ts
scroll(animate(element, { opacity: [0, 1] }));
```

하지만 이 애니메이션들이 훌륭하게 느껴지는 더 큰 이유가 있습니다: **스크롤 자체가 컴포지터 스레드에서 실행됩니다**.

스크롤은 UI를 반응성 있게 유지하는 데 있어 가장 중요한 인터랙션이라고 할 수 있으며, 그래서 브라우저가 메인 스레드와 별도로 처리합니다.

이것은 `scrollTop`을 읽어서 스크롤 애니메이션을 실행하면, 애니메이션이 스크롤보다 한 프레임 늦게 업데이트되거나, 완전히 다른 프레임레이트로 업데이트될 수 있다는 의미입니다. 이런 유형의 스크롤 애니메이션은 쉽게 D-티어입니다.

제 경험상 이 효과는 Safari에서 훨씬 더 눈에 띄며, `transform`을 업데이트하는 것보다 `position: sticky`나 `fixed`를 사용하여 요소 위치를 스크롤에 동기화하는 것이 역사적으로 권장되어 온 주된 이유입니다.

### 비최적화

하드웨어 가속 애니메이션에 대한 흥미로운 주름이 있습니다: 이를 지원하기 위해 브라우저는 본질적으로 두 개의 별도 애니메이션 엔진을 유지해야 합니다. 하나는 CPU 바인딩 메인 스레드용이고 하나는 GPU 컴포지터 스레드용입니다.

많은 사람들이 모르는 사실이 있습니다: 컴포지터 애니메이션 엔진은 스펙을 완전히 구현할 필요가 없습니다. 왜냐하면 사용자가 컴포지터 스레드가 지원하지 않는 기능을 요청하면, 브라우저는 조용히 메인 스레드에서 실행하여 하드웨어 가속을 잃을 수 있기 때문입니다.

Safari가 여기서 가장 큰 문제입니다. 아직 전용 컴포지터 엔진이 없어서, 대신 macOS의 Core Animation 프레임워크를 재사용합니다. 그래서 애니메이션이 Core Animation이 지원하지 않는 기능(예: `1`이 아닌 `playbackRate`)을 요구하면, 더 이상 하드웨어 가속되지 않습니다.

마찬가지로, 일부 값은 컴포지터 엔진에서 지원되지 않을 수 있습니다. 예를 들어, Chrome은 가속 애니메이션을 추가한 [훨씬 후에](https://developer.chrome.com/blog/hardware-accelerated-animations#percentage_animations) `%` 기반 `translate` 값 지원을 추가했습니다.

### 레이어 크기

S-티어 애니메이션의 또 다른 (문자 그대로) 큰 성능 주의점은 **항상 레이어 생성을 필요로 한다**는 것입니다.

레이어는 함께 페인트되는 요소 또는 요소 그룹입니다. 본질적으로, 컴포지터가 독립적으로 이동, 변환, 페이드할 수 있는 이미지이며, 모두 하나의 최종 이미지로 그룹화(또는 **컴포짓**)됩니다.

이 이미지들은 당신이 인식하지 못하는 사이에 **거대해질** 수 있습니다. 데스크톱 GPU는 보통 이것을 잘 처리하지만, 모바일 기기에서는 GPU 메모리를 초과하여 웹사이트를 충돌시키기 쉽습니다.

전형적인 문제 요소는 티커/마퀴 애니메이션입니다. 긴 목록의 복제된 항목들이 지속적으로 스크롤됩니다. 각 복제된 요소가 거대한 레이어에 기여하며, 종종 뷰포트 너비의 여러 배에 걸칩니다. 이것이 [Motion+ Ticker](https://motion.dev/docs/react-ticker)가 레이어 크기를 제한하기 위해 복제된 요소를 줄이거나 제거하는 [재투영 렌더러](https://motion.dev/blog/building-the-ultimate-ticker)를 사용하는 이유입니다. 이것은 의도적인 트레이드오프로, GPU 메모리를 통제하기 위해 가끔 페인트를 발생시킵니다.

여기서 혼란 요소는 블러입니다. 네, `filter: blur()`는 하드웨어 가속됩니다. 하지만 그것이 무료라는 의미는 아닙니다. 블러의 비용은 블러 반경의 픽셀이 증가할 때마다, 그리고 레이어가 클수록 급격히 상승할 수 있습니다. 블러 자체가 레이어를 더 크게 만들어 메모리에 더 영향을 줍니다. 이것이 오래전에 [Framer](https://framer.link/TVBc9hz)에서 `10px` 이상의 블러 값에 대해 경고 플래그를 추가한 이유입니다.

![](https://framerusercontent.com/images/iFMIh8OKhLT8MCxjY7NXTERopVI.png)

## A-티어

A-티어 애니메이션은 컴포짓된 값(예: `transform` 또는 `opacity`)을 변경하지만, 메인 스레드에서 구동됩니다. 이 값들을 변경하면 컴포지션만 트리거되므로, 이상적인 상황에서 애니메이션은 훌륭하게 수행되지만 다른 메인 스레드 작업에 의해 중단될 수 있습니다.

![](https://framerusercontent.com/images/NBAuXMdUtgYrSdoe5C1cQ7R2rc.png)

### 레이어만

스타일이 컴포지션만 트리거하려면, 설정되는 요소가 먼저 레이어로 승격되어야 합니다. 그렇지 않으면, `transform`과 `opacity` 같은 값을 업데이트해도 여전히 페인트가 트리거됩니다.

궁극적으로, 브라우저가 어떤 요소가 레이어가 될지 결정합니다. 이유는 브라우저마다 다르며, 다양하고 신비로운데, 다음을 포함합니다:

- 연관된 CSS/WAAPI `transform` (등) 애니메이션

- 3D `transform`

- `position: fixed` 또는 `sticky`

- `backdrop-filter`

- 다른 레이어와 겹침

`will-change`로 요소가 레이어가 되어야 함을 힌트할 수도 있습니다:

```css
dialog {
  will-change: transform, opacity;
}
```

[MDN 문서](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change)는 (거대한 빨간 상자로) `will-change`를 아껴서 사용해야 한다고 경고합니다. 핵심 우려는 너무 많은 레이어나 너무 큰 레이어를 생성하면 GPU 메모리 예산을 초과할 수 있다는 것입니다.

이것이 Motion이 모든 애니메이션 요소에 `will-change`를 무차별적으로 뿌리지 않는 이유입니다. 레이어화는 알고 있어야 하고, 의식적으로 사용해야 하는 도구입니다.

### JavaScript 애니메이션

요소가 레이어가 되면, `element.style`을 통해 컴포짓된 값을 변경하면 페인트를 건너뛰고 컴포지션만 트리거됩니다.

```ts
element.style.transform = "translateX(100px)";
```

이것은 GSAP 같은 모든 클래식 JS 애니메이션 라이브러리나 커스텀 `requestAnimationFrame` 구현에 해당됩니다. Motion이 독립적인 transform을 애니메이션하는 방식이기도 합니다:

```ts
animate(element, { x: 100 });
```

물론 JS 애니메이션을 실행할 때 추가적인 CPU 오버헤드가 있습니다(메인 스레드 CSS/WAAPI 애니메이션도 마찬가지입니다). 하지만 제 경험상 JS 런타임은 **거의 절대** 느린 애니메이션의 원인이 아닙니다. 거의 항상 **비용이 많이 드는 렌더**가 원인입니다.

수천 개의 작은 요소를 애니메이션하는 것과 같은 특정 경우에, [벤치마크](https://codepen.io/MakiBM/pen/WMXGVK)는 `requestAnimationFrame`이나 GSAP이 하드웨어 가속 애니메이션보다 더 나은 성능을 보인다는 것을 보여줍니다.

물론, 수천 개의 요소를 애니메이션한다면 셰이더를 사용하는 것이 더 나을 가능성이 높습니다.

### 셰이더

[셰이더](https://aerotwist.com/tutorials/an-introduction-to-shaders-part-1/)는 픽셀을 어떤 색으로 칠할지 결정하는 작은 WebGL/WebGPU 프로그램입니다. 대규모로 병렬 실행되기 때문에, 놀라운 성능으로 복잡한 효과를 만들 수 있습니다.

하지만 셰이더 업데이트는 여전히 `requestAnimationFrame`을 통해 스케줄됩니다. 이것은 타이밍이 메인 스레드에 의해 제어된다는 의미입니다. 그래서 셰이더가 S-티어가 아닌 이유입니다: 놀랍도록 빠르게 렌더링할 수 있지만, 메인 스레드가 차단되면 여전히 프레임을 놓칠 수 있습니다.

### `IntersectionObserver`

`IntersectionObserver`는 요소가 뷰포트에 들어오거나 나가는 것을 감지하는 가장 성능 좋은 방법입니다. Motion의 [`inView`](https://motion.dev/docs/inview) 함수와 [`whileInView`](https://motion.dev/docs/react-scroll-animations) prop 뒤에 있는 비밀 소스입니다.

옵저버는 백그라운드 스레드에서 뷰포트에 상대적인 요소 가시성을 효율적으로 추적합니다. `scrollTop` 읽기나 다른 DOM 측정 없이요. 따라서 메인 스레드에 최소한의 작업만 추가합니다.

매우 가볍기 때문에, 스크롤 트리거 애니메이션에 이상적입니다:

```ts
inView(element, () => {
  animate(element, { x: -100 });
});
```

```tsx
<motion.div whileInView={{ opacity: 1 }} />
```

하지만 `IntersectionObserver`에는 종종 간과되는 또 다른 강력한 기능이 있습니다: 화면 밖 애니메이션 비활성화.

페이지가 열려 있는 한 계속 재생되는 장기 실행 애니메이션이 있다고 상상해보세요:

```css
.in-view {
  animation: spin 2s infinite;
}
```

`IntersectionObserver`를 사용하면, 요소 자체가 보이는 영역 내에 있을 때만 이 애니메이션이 재생되도록 할 수 있습니다:

```ts
inView(element, () => {
  element.classList.add("in-view");

  return () => element.classList.remove("in-view");
});
```

```ts
.in-view {
  animation: spin 2s infinite;
}
```

이것이 [Motion+ Ticker](https://motion.dev/docs/react-ticker)가 티커가 보이는 동안에만 실행하여 장기 실행 애니메이션을 성능 좋고 배터리 친화적으로 유지하는 방법입니다.

## B-티어

B-티어 애니메이션은 추가적인 초기 비용이 있는 A 또는 S-티어 애니메이션입니다: DOM 측정.

### 레이아웃 애니메이션

Motion은 매 프레임마다 레이아웃을 트리거하지 않고 요소의 크기와 위치를 애니메이션할 수 있는 강력한 [레이아웃 애니메이션 엔진](https://motion.dev/docs/motion-directive)을 가지고 있습니다.

```tsx
<motion.div layout />
```

이것은 `transform` 스타일만 애니메이션하여 달성됩니다. 따라서 `width: 500px`와 `1000px` 사이를 애니메이션하는 대신, `width: 1000px`인 요소를 `scale(0.5)`와 `1` 사이로 애니메이션할 수 있습니다.

`width/height` 대신 `scale`을 애니메이션하는 단점은 요소가 왜곡될 수 있다는 것입니다. 하지만 Motion은 요소와 그 자식들에 대해 역변환과 `border-radius`를 계산하여 매 프레임마다 이를 보정합니다.

이 모든 것을 달성하기 위해, 먼저 [FLIP (First, Last, Invert, Play) 기법](https://aerotwist.com/blog/flip-your-animations/)이라고 알려진 것을 사용하여 일부 설정 측정을 해야 합니다.

Motion의 프레임별 계산으로 인해 스케일 보정(및 몇 가지 다른 이점)이 가능하며, 메인 스레드에서 이런 종류의 애니메이션을 수행합니다(A-티어). 하지만 우리가 직접 이것을 한다면, 단 한 요소 깊이로, 쉽게 S-티어 하드웨어 가속 애니메이션이 될 수 있습니다.

```ts
animate(element, { transform: [delta, "none"] });
```

이 한 번의 초기 측정이 가장 비용이 많이 드는 종류의 애니메이션을 가장 비용이 적은 것 중 하나로 만듭니다.

## C-티어

C-티어 애니메이션은 페인트 단계를 트리거합니다. 이것은 브라우저가 스타일을 재계산하고 영향받는 레이어를 다시 그리도록 강제합니다.

![](https://framerusercontent.com/images/LwKuQVeG5wTLwLiA28LNR1Ihg.png)

### 페인트되는 값

어떤 스타일이 페인트와 레이아웃을 트리거하는지 알려주는 (종종 오래된) 목록이 많이 있습니다. 하지만 더 쉬운 경험 법칙은 상식을 사용하는 것입니다: 값이 기하학적 속성을 변경하면 레이아웃을 트리거할 것입니다(`width`, `flex` 등). 하지만 `background-color`, `color`, 또는 `border-radius` 같은 것만 변경한다면, 이것은 페인트 단계에서 처리할 수 있는 것입니다.

앞서 봤듯이, `transform`과 `opacity` 등도 비레이어 요소에서 변경될 때 페인트를 트리거할 수 있습니다.

더 큰 레이어를 페인트하는 것이 더 비싸다는 것을 명심한다면, 페인트 애니메이션이 본질적으로 "나쁘다"고 단정할 수는 없습니다. 버튼의 색상을 변경하는 것은 아마 괜찮지만, 전체 페이지의 색상을 애니메이션하는 것은 더 큰 화면에서 비용이 많이 들 수 있습니다.

그 외에도, `filter: blur`에서 봤듯이, 모든 연산이 동등하지 않습니다. `background-color`를 애니메이션하는 것은 `mask-image`나 `background-image` 그라디언트를 애니메이션하는 것에 비해 저렴합니다. 후자의 경우 새로운 그라디언트 이미지도 그려야 하기 때문입니다.

### CSS 변수

CSS 변수는 강력하지만, 성능 측면에서 놀랍도록 좋지 않습니다.

어떤 JS 애니메이션 라이브러리로도 애니메이션할 수 있고, 점점 더 많은 브라우저가 [`@property`](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)를 지원하여 CSS나 WAAPI로도 애니메이션할 수 있게 되었습니다.

CSS 변수의 첫 번째 문제, 그리고 C-티어에 있는 이유는, 변경하면 영향받는 요소에 항상 페인트가 트리거된다는 것입니다.

이것은 요소가 `opacity` 같은 컴포지터 값 내에서만 변수를 사용할 때도 마찬가지입니다:

```css
div {
  --progress: 0;
  opacity: var(--progress);
}
```

그렇지 않으면 성능 좋은 애니메이션을 등급 하락시키는 빠른 방법입니다.

#### 상속 폭탄

하지만 CSS 변수 내에 숨겨진 주요한 F-티어 성능 킬러는 상속입니다.

웹의 많은 "영리한" 데모가 전역 CSS 변수를 애니메이션하며, 이것이 트리 내의 다양한 요소들에 상속됩니다.

```css
html {
  --progress: 0;
}

.box {
  transform: translateY(calc(var(--progress) * 100px));
}
```

문제는 이 값을 변경하면 전체 트리에 걸쳐 스타일을 무효화하여, 전체 트리를 재계산하도록 강제할 수 있다는 것입니다. 이것은 `var(—progress)`가 몇 군데에서만 사용되거나 - 전혀 사용되지 않더라도 마찬가지입니다!

저는 최근에 매 프레임마다 전역 CSS 변수를 업데이트하는 사이트를 발견했습니다. 1300개 이상의 요소에 스타일 재계산을 강제하여, 프레임당 무려 8ms가 소요되었습니다. 이것은 120fps 애니메이션의 전체 예산인데, 그저 어떤 요소가 렌더링이 필요한지 결정하는 데만 쓰입니다.

이 CSS 변수를 타겟팅된 JavaScript 스타일 업데이트로 교체하니 이 비용이 거의 없어졌습니다. 8ms에서 나노초로.

```ts
box.style.transform = `translateY(${progress * 100}px)`;
```

이 패턴은 DOM이 작고 CSS 선택자가 단순한 격리된 CodeSandbox 데모에서는 잘 작동합니다. 하지만 프로덕션에서, 수천 개의 노드와 복잡한 선택자가 있으면, 상속된 변수의 비용은 예측할 수 없습니다. 현실 세계에서 이 패턴은 성능을 완전히 망칠 수 있습니다.

#### CSS 변수 성능 개선하기

여전히 CSS 변수를 안전하게 애니메이션할 수 있습니다. `transform` 같은 값에는 절대 권장하지 않지만, 어차피 페인트를 트리거하는 `mask-image` 같은 스타일에서는 안전하게 사용할 수 있습니다.

상속 폭탄을 피하려면 두 가지 옵션이 있습니다:

##### 1. 범위 줄이기

CSS 변수를 전역으로 설정하는 대신, 사용 지점에 가능한 가깝게 설정하세요. 따라서 `html` 대신 특정 `section`에 설정합니다.

##### 2. 상속 비활성화

또는 이상적으로는, 전혀 상속하지 마세요. `@property`를 사용하면 CSS 변수가 현재 요소에만 영향을 미치도록 정의할 수 있습니다.

```css
@property --progress {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}
```

이것은 변수의 변경이 DOM을 통해 캐스케이딩되는 것을 방지하여, 재계산 확산의 위험을 제거합니다.

변수를 등록하면 일회성 스타일 재계산이 발생하므로, 여러 등록을 한 번에 배치하는 것이 좋습니다.

때로는 이것이 적용되지 않을 수 있습니다. 애니메이션이 상속에 의존할 수 있기 때문입니다(이 경우 타겟팅된 JS 업데이트가 더 나을 것입니다). 하지만 사용되지 않는 변수의 변경조차 큰 문제가 될 수 있으므로, `inherits: false`가 안전한 기본값입니다.

### SVG 속성

경로 데이터(`d`), 원 위치와 반지름(`cx`/`cy`/`r`) 등 네이티브 SVG 속성을 애니메이션하면, 브라우저는 매 프레임마다 도형을 다시 페인트해야 합니다.

때로는 이것이 불가피합니다. 예를 들어 "그리기" 스타일 애니메이션을 만들 때. 하지만 SVG 그래픽을 이동하거나 크기를 조정하려면, 가능한 한 `transform`을 사용하세요.

### View Transitions

기본적으로, 나가는 뷰와 들어오는 뷰를 스크린샷으로 찍은 다음 크로스페이드합니다. 이 크로스페이드는 `opacity`를 통해 S-티어 하드웨어 가속 애니메이션으로 수행됩니다.

추가로, `view-transition-name` 스타일이 일치하는 요소들의 크기와 위치를 `transform`(S-티어)과 `width`/`height`(D-티어)로 애니메이션할 수 있습니다.

그렇다면 전체적으로 왜 C-티어인가요? 두 가지 추가 요소가 작용하기 때문입니다: **중단**과 **격리**.

#### 중단

논의했듯이, 애니메이션을 성능 좋게 만드는 이유는 UI를 반응성 있게 유지하기 위함입니다. 이것의 또 다른 핵심 부분은 현재 상태에서 시작하여 새로운 애니메이션으로 즉시 중단할 수 있는 능력입니다. View Transitions는 그렇게 할 수 없습니다.

현재 애니메이션이 끝날 때까지 기다리거나, 다음 애니메이션을 시작하기 전에 현재 애니메이션을 즉시 끝내는 것 중 하나를 선택해야 합니다.

UI가 반응하지 않거나, 시각적으로 깨지거나 둘 중 하나입니다.

전체 화면 페이지 전환 같은 일부 상황에서는 일반적으로 괜찮습니다. 하지만 인터랙티브 요소가 이전 뷰와 새 뷰 양쪽에 남아 있는 상황에서는 완전히 부적합합니다.

Motion의 [`animateView`](https://motion.dev/docs/animate-view)는 중단하는 View Transitions를 큐에 넣고 배치하여 이 상황을 개선하려고 시도합니다. 곧, 중단될 때 활성 애니메이션을 미묘하게 "빨리 감기"할 것입니다. 하지만 이러한 기법들은 여전히 수정이지 해결이 아닙니다.

#### 격리

긍정적인 면에서, View Transitions는 레이아웃 트리거 비용을 제한하는 데 똑똑합니다. 이것은 다음에 탐구할 내용과 연결되지만, 본질적으로 모든 레이아웃이 동등하게 생성되지 않습니다.

일치하는 각 `view-transition-name` 요소 쌍은 단일 `::view-transition-group` 요소로 표현됩니다. 이 요소는 이전 요소와 새 요소의 스냅샷인 두 개의 다른 요소만 포함합니다.

이것은 매우 단순한 DOM이며, `position: absolute`를 사용하여 주변 요소로부터 격리된 레이아웃입니다. 계산이 저렴합니다.

따라서 네, 이것은 정의상 D-티어 애니메이션이지만, 가능한 한 좋은 D-티어 애니메이션이며, 웹 애니메이션에 있어 엄격한 규칙이 없다는 추가 증거입니다.

##### 추가 성능 개선

기본적으로, `::view-transition-group`은 크기가 동일할 때도 항상 `width`와 `height`를 애니메이션합니다.

View Transition 마법사 Bramus는 이러한 키프레임을 제거하는 기법을 알아냈습니다. 하드웨어 가속 위치 애니메이션만 남겨서 전체 애니메이션을 S-티어로 승격시킵니다. 제 생각에 이것은 스펙에 명시된 기법이어야 하지만, 개념 증명으로서 적어도 일부 상황에서는 가능하다는 것을 보여줍니다.

## D-티어

D-티어 애니메이션은 레이아웃 렌더 단계를 트리거하고, 따라서 매 프레임마다 전체 렌더 파이프라인을 트리거하는 것입니다.

이것은 프레임 예산에 막대한 영향을 줄 수 있습니다. 때로는 고급 기기에서도 프레임이 떨어질 수 있습니다.

![](https://framerusercontent.com/images/aKQO3N4aSHYlkJmAZdXGYyNuQ.png)

### 레이아웃

요소의 레이아웃을 변경하면 하나 이상의 요소의 기하학적 속성을 재계산합니다.

레이아웃의 모든 변경은 페이지 전체에 파급될 수 있으며, `width`, `margin`, `border`, `top`, `display`, `justify-content`, `grid-template-columns` 등 많은 스타일이 레이아웃에 영향을 줄 수 있습니다.

봤듯이, 모든 레이아웃 계산이 동등하지 않습니다. 비용은 무효화하는 트리의 크기와 복잡성에 따라 확장됩니다.

자식이 없는 작고 격리된 컴포넌트의 레이아웃 변경은 매우 저렴할 것입니다. 형제 요소로 둘러싸이고, 모두 리플로우되는 텍스트를 가진 수백 개의 자식을 포함하는 최상위 컨테이너의 `width`를 애니메이션하면 - 비용이 많이 들 것입니다.

#### 레이아웃 비용 줄이기

브라우저는 이미 레이아웃 재계산 범위를 정하는 데 꽤 똑똑합니다. 예를 들어, `position: absolute` 또는 `position: fixed` 요소의 크기와 위치 변경은 주변 요소의 재계산을 트리거하지 않습니다. 레이아웃이 격리되어 있기 때문입니다.

`contain` [CSS 규칙](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/contain)을 사용하여 레이아웃이 포함되어 있다고 브라우저에 수동으로 알릴 수도 있습니다. 이것은 브라우저에게 요소 내 레이아웃 변경이 주변 요소의 레이아웃에 영향을 주지 않을 것이라고 알려줍니다.

## F-티어

F-티어는 웹 애니메이션의 대죄입니다. E-티어는 신경 쓰지 않았습니다 - 이것이 피해야 할 것입니다.

### 쓰래싱 (Thrashing)

**스타일** 및 **레이아웃** 쓰래싱은 DOM에 쓰고, 측정하고, 쓰고, 측정하는 과정을 반복하는 것입니다.

예를 들어, 요소의 크기를 설정하면:

```ts
element.style.width = "100px";
```

그것을 다시 읽고:

```ts
const width = element.offsetWidth;
```

다시 설정하면:

```ts
element.style.width = width * 2 + "px";
```

그리고 계속 - 이것이 쓰래싱입니다.

또는 더 현실적인 사용 사례:

```tsx
const header = useRef();

useLayoutEffect(() => {
  const element = header.current;

  // 읽기
  if (element.scrollWidth > element.clientWidth) {
    // 쓰기
    header.current.dataset.overflowing = "yes";
  } else {
    header.current.dataset.overflowing = "";
  }
}, [text]);

return <div ref={header}>...</div>;
```

이 컴포넌트의 인스턴스가 하나만 있으면 괜찮지만, 이 컴포넌트의 많은 버전을 렌더링하기 시작하면 심각한 쓰래싱 영역에 들어갑니다.

이것은 성능에 막대한 부정적 영향을 미치며, 각각 DOM에서 읽고 쓰는 다양한 라이브러리를 혼합하여 사이트에 쉽게 도입됩니다.

DOM에서 읽고 있는 것이 항상 명확하지 않습니다. 예를 들어, 이 Motion 애니메이션을 보세요:

```ts
animate(element, { width: "auto" });
```

Motion은 `auto`가 무엇인지 어떻게 알까요? 일반적으로 JS 애니메이션 라이브러리는 이런 키프레임을 즉시 해결하며, 종종 읽기/쓰기를 포함합니다.

하지만 대신, Motion은 지연된 키프레임 해결이라는 WAAPI에서 영감받은 프로세스를 사용하여 이러한 모든 읽기와 쓰기가 배치되도록 합니다. 이 배칭이 Motion이 알 수 없는 값에서 애니메이션할 때 [GSAP보다 2.5배 빠르고](https://motion.dev/docs/gsap-vs-motion#start-up-time), 단위 변환에서 6배 빠른 이유입니다.

![](https://framerusercontent.com/images/AsWfoNbgvANQZwb4HCgRnh8Ycxc.png)

Motion은 모든 애니메이션 [`frame`](https://motion.dev/docs/frame)마다 모든 읽기와 쓰기를 배치하며, 이것을 frame이라는 저수준 API로 제공합니다. 이것은 다른 라이브러리 작성자와 개발자가 서로의 발을 밟지 않고 의도치 않게 쓰래싱을 도입하는 것을 방지합니다.

```tsx
let width = 0;
frame.read(() => {
  width = element.offsetWidth;

  frame.update(() => {
    element.style.width = width * 2 + "px";
  });
});
```

## 결론

성능은 마법이 아닙니다. 하지만 예술입니다. 렌더 파이프라인이 어떻게 동작하는지 이해하면, 왜 애니메이션이 버벅거릴 수 있는지, 대신 무엇을 사용해야 하는지에 대한 직관을 갖게 됩니다.

엄격한 규칙은 없습니다. 모든 선택 - 메모리, 레이어, 하드웨어 가속 등 - 에는 교차하는 트레이드오프가 있습니다. 제 경험상 성능 문제의 90%는 그냥 큰 `filter: blur`이지만, 이제 나머지 10%를 다루는 데 더 잘 준비되셨기를 바랍니다.

거의 4000단어에 달하는 이 글은 예상보다 길어졌지만, 여전히 일부를 놓치거나 다른 것들에 대해 충분히 깊이 들어가지 못한 것 같습니다. 아직 당신을 곤란하게 하는 것이 있나요? 아니면 위의 주제 중 하나를 더 자세히 탐구하는 글을 원하시나요? [알려주세요](https://x.com/motiondotdev)!

추신: 이 글을 교정하고 사실 확인해 준 Framer의 [Jacob](https://x.com/kurtextrem)과 [Ivan](https://x.com/iamakulov)에게 감사드립니다!
