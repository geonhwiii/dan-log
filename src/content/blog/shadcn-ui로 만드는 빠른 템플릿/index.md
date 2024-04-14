---
title: 'shadcn-ui로 만드는 빠른 템플릿'
summary: 'shadcn-ui 시작하기'
date: '01 15 2024'
draft: false
tags:
  - React
  - shadcn-ui
---

![](https://i.imgur.com/MhDG4uR.png)

> 최근 가장 인기있는 라이브러리로 알려진 `shadcn/ui`의 간단한 사용기를 적어봅니다

## 1. Getting started

```shell
# NextJS 앱을 생성하고
pnpm create next-app@latest shadcn-example --typescript --tailwind --eslint

# shadcn-ui를 cli로 세팅해줍니다.
pnpm dlx shadcn-ui@latest init
```

`cli` 세팅에 따라 조금씩 다르지만 아래와 같은 `components.json` 파일이 생성됩니다.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york", // 스타일을 'new-york'으로 설정
  "rsc": true, // 서버 컴포넌트 사용 유무
  "tsx": true, // tsx 파일 사용 유무
  "tailwind": {
    "config": "tailwind.config.ts", // tailwind 설정 파일위치
    "css": "src/app/global.css", // global css 파일위치
    "baseColor": "zinc", // 기본적으로 설정되는 main 컬러
    "cssVariables": true, // cssVariables 사용 유무
    "prefix": "" // tailwind에 사용될 prefix
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

저는 `shadcn-ui`를 최대한 빠르게 `UI`를 구현하고자 사용하는 것이라서 `prefix`를 별도로 설정하지 않고,

컴포넌트를 최대한 수정없이 사용하는 것으로 하였습니다.

## 2. Setting global.css

`shdacn-ui` 공식 홈페이지에서 제공하는 `Color-set`을 원하는대로 가져와서 사용합니다.

아래는 `blue`컬러로 가져온 예시입니다.

이후에 `cli`를 통해 설치하는 모든 컴포넌트는 해당 `color`를 `base`로 사용하게 됩니다.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }
}
```

## 3. Add Components

```shell
# cli로 button 컴포넌트를 생성합니다.
npx shadcn-ui@latest add button
```

```tsx
// ui폴더에 button 컴포넌트가 이미 생성되어있습니다.
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}
```

위와 같이 간단한 설정만으로 아래와 같은 버튼 컴포넌트가 생성됩니다.

![](https://i.imgur.com/m9IbNu5.png)

## 4. tailwind indicator

`shadcn-ui` 예제를 보다가 재미있는 컴포넌트를 발견해서 가져왔습니다.

코드는 아래와 같이 간단하며, 화면 크기에 따라 tailwindcss의 화면 사이즈를 표기해줍니다.

간단하지만 `css` 작업에 꽤 큰 도움을 줄 것 같습니다 :)

```tsx
// @/src/components/tailwind-indicator
export function TailwindIndicator() {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <div className="fixed bottom-1 left-1 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white">
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </div>
  );
}
```

![](https://i.imgur.com/1pMnl7K.png)
