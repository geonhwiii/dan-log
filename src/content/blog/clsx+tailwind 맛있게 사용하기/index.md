---
title: 'clsx + tailwind 맛있게 사용하기'
summary: 'clsx + tailwind-merge 사용법'
date: '04 12 2024'
draft: false
tags:
  - React
  - CSS
---

## 1. 유틸함수 cn

`clsx`와 `tailwindcss` + `tailwind-merge` 를 사용하여 개발을 진행중입니다.

```tsx
// @/utils/clsx/index.ts
import { clsx, type ClassValue } from 'clsx';

import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

실제 사용은 아래와 같이 사용합니다.

```tsx
type Props = {
  message: Message;
};

export function ChatMessage({ message: { role, content } }: Props) {
  return <div className={cn(['flex items-center', role === 'user' ? 'justify-end' : 'justify-start'])}></div>;
}
```

## 2. Custom CSS 설정

`tailwindcss`를 커스텀해서 사용하고 있다면 주의해야할 점이 있습니다.
`text-**`와 같은 형식은 기본값을 제외하곤 모두 `color`로 간주하여,
`text-title-sm text-red-500`으로 할 경우, `text-title-xs`는 덮어씌워지게 됩니다.
(\* 여기서 `text-title-sm`은 `text-sm font-bold`를 합친 커스텀 설정입니다.)

그럴땐 아래와 같이 `extendTailwindMerge`를 사용해서 커스텀한 `classGroups`을 알려주면 됩니다.

```tsx
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": {
        "text-title-xs",
        "text-title-sm",
        ...
      }
    }
  }
})

export const cn = (...inputs: ClassValue[]) => customTwMerge(clsx(inputs));
```
