---
title: "tailwindcss v4.1 마이그레이션 진행하기"
summary: "tailwindcss v3.4.3 ~> v4.1.0 마이그레이션 가이드"
date: "05 07 2025"
draft: false
image: "https://tailwindcss.com/_next/static/media/card.09319a01.jpg"
tags:
  - CSS
---

![](https://tailwindcss.com/_next/static/media/card.09319a01.jpg)

> `tailwindcss v4`가 출시하고, 마이그레이션을 진행하며 경험한 내용을 바탕으로 가이드를 작성합니다 :)

## 1. 설치 및 변경사항

가장 먼저 `cli`를 사용하는 것이 좋습니다.

버전 업그레이드 및 v3에서 v4로 버전이 올라가면서 변경된 부분들을 간단하게 수정해줍니다.

```shell
# tailwindcss cli
npx @tailwindcss/upgrade
```

만약 별도로 `dependency`를 설치하려면 다음을 실행합니다.

```shell
# using npm
npm install tailwindcss @tailwindcss/postcss postcss
```

이후 `postcss.config.mjs` 파일을 수정합니다. `.js`라면 이번 기회에 `.mjs`로 변경하는 것을 권장합니다.

```ts
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

`next`가 아닌 `vite`를 사용하시면 아래와 같이 `vite.config.ts`에 플러그인을 추가해줍니다.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
});
```

이제 `globals.css` 또는 `styles.css`와 같은 전역 스타일 `css`파일을 수정하면 됩니다.

기존에 있던 `@tailwind ***` 부분은 모두 삭제합니다.

```css
/* globals.css */
@import "tailwindcss";
```

<br />

---

<br />

## 2. `tailwind.config.js` 마이그레이션

마이그레이션을 진행할 경우, 이 부분이 손이 많이 갈 수 있습니다.

먼저, 디자인 토큰은 아래와 같이 `globals.css`에 `@theme`를 사용하여 `Custom Properties`로 선언합니다.

```css
/* globals.css */

@theme {
  --color-red-50: oklch(0.971 0.013 17.38);
  --color-red-100: oklch(0.936 0.032 17.717);
  --color-red-200: oklch(0.885 0.062 18.334);
  --color-red-300: oklch(0.808 0.114 19.571);
  --color-red-400: oklch(0.704 0.191 22.216);
  ...
  ...
  --color-black-00: #000;
  --color-white-00: #fff;

  --radius-sm: 0.125rem;
  --radius-md: 0.25rem;
  --radius-lg: 0.5rem;
  ...
  ...
}
```

추가로 `text`, `breakpoint` 등을 오버라이딩 및 추가 선언이 가능합니다. 

`@theme`에 선언한 토큰들은 `var(--color-red-50)`처럼 `CSS variables`로 바로 사용이 가능합니다.

추가적인 변경사항은 [`theme 문서`](https://tailwindcss.com/docs/theme)를 참고해주세요.

<br />

커스텀으로 사용하고 있는 `class`들은 아래와 같이 `@utility`를 사용할 수 있습니다.

```css
/* globals.css */

@utility flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@utility flex-items-center {
  display: flex;
  align-items: center;
}

@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}
```

위처럼 여러 `css`를 함께 사용할 수 있고, `utility`로 선언하면 자동완성도 가능합니다.

```tsx
// utility 미적용
<div className="flex items-center justify-center">HELLO WORLD</div>

// utility 적용
<div className="flex-center">HELLO WORLD</div>
```

`custom varaints`는 아래와 같이 `@slot`과 함께 사용할 수 있습니다.

```css
/* globals.css */

@custom-variant theme-blue {
  &:where([data-theme="blue"] *) {
    @slot;
  }
}

@custom-variant pc {
  @media (min-width: 768px) {
    @slot;
  }
}
@custom-variant mobile {
  @media (max-width: 767px) {
    @slot;
  }
}
```

아래처럼 완전히 커스텀된 `media query`를 사용할 수 있습니다.

```tsx
// media 쿼리 커스텀 예시
<div className="pc:hidden">PC에서만 보여요</div>
<div className="mobile:hidden">Mobile에서만 보여요</div>
```

<br />

> 모노레포처럼 파일이 분리되어서 사용되어야 할때는 어떻게 하나요?

이때는 `theme.css`라는 공통 파일을 선언하고, `@theme`, `@utility`등을 분리해주세요.

```css
/* theme.css */

@theme {
  --color-red-50: oklch(0.971 0.013 17.38);
  --color-red-100: oklch(0.936 0.032 17.717);
  ...
}
@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}
...

```

이후 실제 사용하는 `apps/**`의 `globals.css`파일에 해당 경로의 `theme.css`를 `import` 해줍니다. 

만약, 모노레포에서 사용하는 디자인시스템 등이 있다면 아래와 같이 `@source`로 해당 경로를 설정합니다.

`@source`로 불러오지 않을 경우, 컴파일 단계에서 `tailwindcss`의 변수가 올바르게 생성되지 않습니다.

```css
/* globals.css */

@import "tailwindcss";
@import "@acme/config-tailwind/theme.css";

@source "../../../../packages/ui";

@plugin 'tailwindcss-animate';
```

`tailwindcss v4`로 업그레이드 되면서 좋은 유틸리티도 많이 추가가 되었습니다.

공식 문서를 참고해서 마이그레이션도 진행하고, 다양한 유틸리티도 많이 사용해보는 것을 추천드립니다!