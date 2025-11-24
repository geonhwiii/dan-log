---
title: "CSS corner-shape: 다양한 모서리 스타일 만들기"
summary: "CSS corner-shape 속성을 사용해 squircle, bevel, notch 등 다양한 모서리 효과를 만들고 Tailwind CSS 플러그인으로 통합하는 방법을 알아봅니다."
date: "11 20 2025"
draft: false
tags:
  - CSS
  - tailwindcss
---

## 1. corner-shape란?

`corner-shape`는 CSS의 새로운 실험적 속성으로, `border-radius`로 둥글게 만든 모서리의 모양을 더 세밀하게 제어할 수 있게 해줍니다.

기존 `border-radius`는 완벽한 원형 곡선만 만들 수 있었지만, `corner-shape`를 사용하면 squircle, bevel, notch, scoop 같은 다양한 모서리 스타일을 구현할 수 있습니다.

```css
/* border-radius가 있어야 corner-shape가 적용됩니다 */
.element {
  border-radius: 20px;
  corner-shape: squircle;
}
```

`corner-shape`의 주요 특징:

- `border-radius`가 0이면 `corner-shape`는 적용되지 않습니다
- border, outline, shadow, background 모두 정의된 모서리 형태를 따릅니다
- 다양한 모서리 형태 간 부드러운 애니메이션이 가능합니다

## 2. corner-shape의 다양한 값

`corner-shape`는 키워드 또는 `superellipse()` 함수를 사용합니다.

### 주요 키워드 값

```css
/* 기본 원형 곡선 (기본값) */
corner-shape: round;

/* 직선 모서리 (border-radius를 무효화) */
corner-shape: square;

/* 각진 경사 */
corner-shape: bevel;

/* 안쪽으로 파인 경사 */
corner-shape: notch;

/* 부드러운 사각형 (애플 스타일) */
corner-shape: squircle;

/* 안쪽으로 둥글게 파인 모양 */
corner-shape: scoop;
```

<img src="https://i.imgur.com/46elM3B.png" width="800" height="auto" alt="corner-shape 키워드 값 비교" />

### superellipse() 함수

더 세밀한 제어가 필요하다면 `superellipse()` 함수를 사용할 수 있습니다.

```css
/* 커스텀 곡률 지정 */
corner-shape: superellipse(0.6);
corner-shape: superellipse(-1.2);
```

키워드들은 내부적으로 `superellipse()` 값으로 변환됩니다:

- `round` = `superellipse(1)`
- `bevel` = `superellipse(0)`
- `squircle` = `superellipse(0.6)`

## 3. 다양한 모서리 조합

각 모서리마다 다른 스타일을 적용할 수 있습니다.

```css
/* 1개 값: 모든 모서리 동일 */
corner-shape: squircle;

/* 2개 값: 좌상/우하, 우상/좌하 */
corner-shape: notch squircle;

/* 3개 값: 좌상, 우상/좌하, 우하 */
corner-shape: bevel squircle scoop;

/* 4개 값: 좌상, 우상, 우하, 좌하 (시계방향) */
corner-shape: scoop bevel notch squircle;
```

개별 모서리를 제어하는 longhand 속성도 있습니다:

```css
/* 물리적 속성 */
corner-top-left-shape: squircle;
corner-top-right-shape: bevel;
corner-bottom-right-shape: notch;
corner-bottom-left-shape: scoop;

/* 논리적 속성 (writing-mode 고려) */
corner-start-start-shape: squircle;
corner-start-end-shape: bevel;
```

## 4. Tailwind CSS 플러그인 통합

[toolwind/corner-shape](https://github.com/toolwind/corner-shape) 플러그인을 사용하면 Tailwind CSS에서 `corner-shape`를 손쉽게 사용할 수 있습니다.

### 설치

```bash
npm install -D @toolwind/corner-shape
# 또는
pnpm add -D @toolwind/corner-shape
```

### 설정

`tailwindcss 4.0` 이상이라면 간단하게 아래처럼 통합할 수 있습니다.

```js
/* globals.css */
@import "tailwindcss";
@plugin "@toolwind/corner-shape";
```

### 사용법

플러그인이 제공하는 유틸리티 클래스를 사용할 수 있습니다:

```tsx
// 모든 모서리에 squircle 적용
<div className="rounded-2xl corner-squircle">
  애플 스타일 카드
</div>

// 개별 모서리 제어
<div className="rounded-3xl corner-tl-bevel corner-tr-notch corner-br-scoop corner-bl-squircle">
  각 모서리가 다른 스타일
</div>
```

사용 가능한 클래스들:

```css
/* 전체 모서리 */
corner-round      /* 기본 원형 */
corner-square     /* 직선 */
corner-bevel      /* 경사 */
corner-notch      /* 안쪽 경사 */
corner-squircle   /* 부드러운 사각형 */
corner-scoop      /* 안쪽 둥근 */

/* 개별 모서리 (top-left, top-right, bottom-right, bottom-left) */
corner-tl-squircle
corner-tr-bevel
corner-br-notch
corner-bl-scoop

/* 그룹 제어 (top, right, bottom, left) */
corner-t-squircle
corner-r-bevel
corner-b-notch
corner-l-scoop
```

## 5. 브라우저 지원 및 주의사항

현재 `corner-shape`는 **실험적 기능**입니다:

- ✅ Chrome
- ❌ Safari, Firefox

```

## 참고

- [MDN: corner-shape](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/corner-shape)
- [GitHub: @toolwind/corner-shape](https://github.com/toolwind/corner-shape)
```
