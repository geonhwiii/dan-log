---
title: 'Tailwind CSS v4 모노레포 구성: 디자인 시스템을 공유하는 방법'
summary: 'Turborepo와 Tailwind CSS v4를 활용해 일관된 디자인 시스템을 모노레포 전체에서 효율적으로 공유하는 방법을 알아봅니다.'
date: '01 09 2026'
draft: false
tags:
  - React
---

## 1. Tailwind CSS v4의 새로운 접근법

Tailwind CSS v4는 기존 버전과는 다르게 `tailwind.config.js` 파일 없이 CSS 파일만으로 설정을 관리할 수 있는 방식을 도입했습니다.

이 변화는 특히 모노레포 환경에서 디자인 시스템을 공유할 때 큰 이점을 제공합니다. CSS `@import`와 `@theme` 문법을 통해 더욱 직관적이고 모듈화된 방식으로 스타일을 관리할 수 있습니다.

기존에는 `tailwind.config.js`를 `packages/tailwind-config` 에서 관리하여 구조를 설정하였지만, `*.css`파일로 관리하게 되면서 설정이 조금 변경되었습니다.

이번 글에서는 `v4`에 맞춘 모노레포 설정을 같이 진행해보겠습니다.

## 2. 모노레포에서의 디자인 시스템 구조

모노레포에서 `tailwindcss v4`를 사용할 때는 다음과 같은 구조로 디자인 시스템을 구성할 수 있습니다.

```
packages/
├── tailwind-config/          # 공유 Tailwind 설정 패키지
│   ├── package.json
│   └── src/
│       ├── color.css         # 컬러 토큰
│       ├── typography.css    # 타이포그래피 설정
│       └── animation.css     # 애니메이션 설정
└── ui/                       # UI 컴포넌트 라이브러리
    ├── package.json
    └── src/
        └── styles.css        # UI 패키지 스타일
```

이 구조의 핵심은 **디자인 토큰을 독립적인 패키지로 분리**하여 여러 앱과 패키지에서 재사용할 수 있다는 점입니다.

## 3. 공유 설정 패키지 구성하기

### 3.1 tailwind-config 패키지 설정

먼저 공유 설정을 담을 패키지의 `package.json`을 구성합니다.

```json
{
  "name": "@acme/tailwind-config",
  "private": true,
  "version": "0.0.0",
  "exports": {
    "./color": "./src/color.css",
    "./typography": "./src/typography.css",
    "./animation": "./src/animation.css",
    "./radius": "./src/radius.css",
    "./postcss": "./postcss.config.js"
  },
  "devDependencies": {
    "postcss": "catalog:",
    "tailwindcss": "catalog:"
  }
}
```

`exports` 필드를 통해 각 CSS 모듈을 명시적으로 내보내며, 다른 패키지에서 선택적으로 import할 수 있습니다.

여기서 `catalog:`는 루트 `package.json`에서 버전을 공통으로 관리할 수 있는 기능입니다.

다음 링크를 참조해주세요.

> https://bun.com/docs/pm/catalogs

### 3.2 디자인 토큰 정의하기

Tailwind v4의 `@theme` 블록을 활용해 디자인 토큰을 정의합니다.

```css
/* color.light.css */
:root {
  /* Global Colors */
  --color-transparent: hsla(0, 0%, 0%, 0);

  /* Neutral */
  --global-neutral-white: hsla(0, 0%, 100%, 1);
  --global-neutral-black: hsla(0, 0%, 0%, 1);

  /* Gray */
  --global-gray-50: hsla(0, 0%, 98%, 1);
  --global-gray-100: hsla(240, 5%, 96%, 1);
  --global-gray-200: hsla(220, 13%, 91%, 1);
  /* ... 더 많은 색상 정의 */
}

:root {
  @theme {
    /* Text Colors */
    --color-text-global-primary: var(--global-gray-900);
    --color-text-global-secondary: var(--global-gray-500);
    --color-text-global-tertiary: var(--global-gray-400);

    /* Background Colors */
    --color-global-primary: var(--global-neutral-white);
    --color-global-secondary: var(--global-gray-50);
  }
}
```

이렇게 정의한 토큰은 `text-text-global-primary`, `bg-global-primary`와 같이 Tailwind 클래스로 사용할 수 있습니다.

### 3.3 애니메이션 정의하기

`@theme inline` 블록을 사용해 애니메이션을 정의합니다.

```css
/* animation.css */
@theme inline {
  --animate-accordion-down: accordion-down 300ms ease-out;
  --animate-accordion-up: accordion-up 300ms ease-out;

  @keyframes accordion-down {
    from {
      height: 0;
    }
    to {
      height: var(--radix-accordion-content-height);
    }
  }

  @keyframes accordion-up {
    from {
      height: var(--radix-accordion-content-height);
    }
    to {
      height: 0;
    }
  }
}
```

이제 `animate-accordion-down`와 같은 클래스를 바로 사용할 수 있습니다.

## 4. UI 패키지에서 설정 사용하기

UI 컴포넌트 라이브러리에서는 공유 설정을 import하여 사용합니다.

### 4.1 UI 패키지 설정

```json
{
  "name": "@acme/ui",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build:styles": "tailwindcss -i ./src/styles.css -o ./dist/index.css",
    "build:ui": "tsc",
    "dev:styles": "tailwindcss -i ./src/styles.css -o ./dist/index.css --watch",
    "dev:ui": "tsc --watch"
  },
  "devDependencies": {
    "@acme/tailwind-config": "workspace:*",
    "tailwindcss": "catalog:",
    "@tailwindcss/cli": "catalog:"
  }
}
```

`workspace:*`를 통해 모노레포 내 `tailwind-config` 패키지를 참조합니다.

`dev:styles`는 `tailwindcss cli`의 watch 기능을 통해 개발환경에서도 ui 패키지내에 변경되는 `tailwindcss`를 바로 적용할 수 있게 해줍니다.

`build:styles`를 통해 빌드타임에 ui패키지 내에 적용된 `tailwindcss`를 css파일로 빌드합니다.

### 4.2 Turborepo 태스크 구성

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "build:styles": {
      "outputs": ["dist/*.css"]
    },
    "build:ui": {
      "dependsOn": ["build:styles"],
      "outputs": ["dist/**/*.js", "dist/**/*.d.ts"]
    },
    "dev:styles": {
      "cache": false,
      "persistent": true
    },
    "dev:ui": {
      "cache": false,
      "persistent": true
    }
  }
}
```

`root`의 `turbo.json`을 위와 같이 설정합니다.

`build:ui`가 `build:styles`에 의존하도록 설정하여, 스타일이 먼저 빌드되도록 보장합니다.

## 5. 애플리케이션에서 사용하기

실제 `apps`/** 내의 프로젝트에서 빌드된 UI 패키지의 스타일을 `import`하기만 하면 됩니다.

```tsx
// apps/web/app/layout.tsx
import '@acme/ui/styles.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
```

이제 앱 전체에서 정의한 디자인 토큰을 사용할 수 있습니다.

```tsx
// 컴포넌트에서 사용
<button className="bg-bg-information-primary hover:bg-bg-information-primary-hover text-text-neutral-inverse">
  클릭하세요
</button>

<div className="animate-accordion-down">
  아코디언 콘텐츠
</div>
```

## 마치며

설정이 복잡해진 것 같지만, 기존의 `config` 폴더를 매번 지정해주어야했던 것에 비해,

하나의 `index.css`로 만들어 `export`하는 구조라서 직관적이라고도 볼 수 있겠네요 :)