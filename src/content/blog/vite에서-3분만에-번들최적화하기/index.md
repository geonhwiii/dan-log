---
title: vite에서 5분만에 번들 최적화하기
summary: vite의 rolldown 설정을 통해 빠른 번들사이즈를 최적화할 수 있는 방법을 알아봅니다.
date: 09 20 2025
draft: false
tags: 
  - vite
---

> 참고문서 : https://rolldown.rs/guide/in-depth/advanced-chunks#advanced-chunks

바쁜 현업 속에서도 기본적으로 가져가면 좋을 최적화를 소개해드립니다.

## 1. index-*.js, vender-*.js

`vite.config.ts` 설정에서는 청크를 커스텀할 수 있는 옵션이 있습니다.

vite는 빌드 시에 `index-*.js` 와 `venter-*.js` 두 가지의 청크 파일이 생성됩니다.

#### 1. **vender-*.js**

- 외부 라이브러리와 의존성들이 포함된 청크입니다
- node_modules에서 가져온 React, Vue, Lodash 등의 라이브러리들이 여기에 포함됩니다
- 애플리케이션 코드와 분리되어 있어 캐시 효율성을 높입니다
- 외부 라이브러리가 변경되지 않는 한 재다운로드하지 않아도 됩니다

개발을 하다보면 위 파일들이 매우 커져서 초기 로드 시간이 커지게 됩니다.

우리는 **이 청크 파일들을 줄이거나 쪼개어 초기 로드 시간을 개선하며 성능을 최적화**할 수 있습니다.

#### 2. **index-*.js**

- 애플리케이션의 메인 로직이 포함된 청크입니다
- 사용자가 애플리케이션에 접근할 때 가장 먼저 로드되는 엔트리 포인트입니다
- 여러분이 작성한 컴포넌트, 페이지, 비즈니스 로직 등이 여기에 포함됩니다
- 애플리케이션의 핵심 기능을 담당하는 코드가 들어있습니다


## 2. vender-*.js 쪼개기

실제로 제가 사용하는 `advancedChunks` 옵션을 가져와봤습니다.

만약 `rollup`을 사용하신다면 `manualChunk`를 사용하시면 됩니다.

주요 핵심 라이브러리들을 `advancedChunks`에 등록해주면 됩니다.

결과는 마지막에 한번에 보겠습니다.

```ts
export default defineConfig(({ mode }) => {
  return {
    plugins: [...],
    ...,
    build: {
      rollupOptions: {
        output: {
          advancedChunks: {
            groups: [
              // Core React libraries - 가장 안정적이고 캐싱 효율이 높음
              {
                test: /node_modules\/(react(?!-native)|react-dom)/,
                name: 'react',
              },
              // TanStack 생태계 - Query & Router (자주 사용되는 핵심 기능)
              {
                test: /node_modules\/@tanstack\/(react-query|react-router)/,
                name: 'tanstack',
              },
              // TanStack Table - 큰 크기이지만 특정 페이지에서만 사용
              {
                test: /node_modules\/@tanstack\/react-table/,
                name: 'table',
              },
              // 시각화 라이브러리 - D3는 크기가 크고 특정 기능에서만 사용
              {
                test: /node_modules\/d3/,
                name: 'd3',
              },
              // 날짜 관련 라이브러리 - 자주 사용되지만 독립적
              {
                test: /node_modules\/(date-fns|@date-fns)/,
                name: 'date',
              },
              // UI 애니메이션 및 오버레이 라이브러리
              {
                test: /node_modules\/(motion|overlay-kit|sonner)/,
                name: 'ui-libs',
              },
              // 유틸리티 라이브러리 - 타입 검증 및 헬퍼 함수들
              {
                test: /node_modules\/(zod|es-toolkit|ts-pattern|clsx|tailwind-merge|class-variance-authority)/,
                name: 'utils',
              },
              // UI 컴포넌트 라이브러리
              {
                test: /node_modules\/(lucide-react|@radix-ui)/,
                name: 'ui-components',
              },
              // HTTP 클라이언트 및 상태 관리
              {
                test: /node_modules\/(ky|zustand|js-cookie)/,
                name: 'client-libs',
              },
              // 외부 서비스 SDK들 - 변경이 적고 독립적
              {
                test: /node_modules\/(@channel\.io|@microsoft\/clarity|@sentry)/,
                name: 'external-services',
              },
              // 기타 vendor 라이브러리
              {
                test: /node_modules/,
                name: 'vendor',
              },
            ],
          },
        },
      },
    },
  };
});

```


## 3. index-*.js 쪼개기

`index-*.js`를 줄이는 가장 쉬운 방법은 `lazy loading`등을 통한 `code splitting`을 적용하는 것입니다.

특히, 우리가 사용하는 주요 라이브러리들은 이를 간편하게 지원합니다.


### 1. tanstack/router, react-router

**autoCodeSplitting**을 통해 경로마다 **code splitting**을 자동으로 적용합니다.

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true, // Enable automatic code splitting
    }),
  ],
})
```

`react-router`의 경우에는 각 라우트별로 적용해줄 수 있습니다.

```tsx
// route.ts
import { lazy } from 'react'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact },
]
```

### 2. tanstack/form

form에 사용되는 각 컴포넌트를 `lazy loading`으로 불러옵니다.

```ts
// form.ts
import { lazy } from 'react'
import { createFormHook } from '@tanstack/react-form'

const TextField = lazy(() => import('../components/text-fields.tsx'))

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
  },
  formComponents: {},
})
```

### 3. 그 외 적용할 수 있는 케이스

무거운 차트, 테이블에 적용

```tsx
const HeavyChart = lazy(() => import('./components/HeavyChart'))
const DataTable = lazy(() => import('./components/DataTable'))
const ImageGallery = lazy(() => import('./components/ImageGallery'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyChart />
    </Suspense>
  )
}
```

무거운 차트, 테이블에 적용

```tsx
const HeavyChart = lazy(() => import('./components/HeavyChart'))
const DataTable = lazy(() => import('./components/DataTable'))
const ImageGallery = lazy(() => import('./components/ImageGallery'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyChart />
    </Suspense>
  )
}
```

## 결과 비교

#### 1. 최적화 전

아래는 청크 옵션에서 **react**만 분리한 경우입니다.

![](https://i.imgur.com/6P6cfBh.png)

#### 2. 최적화 후 

빌드 시간도 극단적인 경우 아래처럼 **2.16s -> 1.27s** 까지 차이가 날 수 있으며,

- `index-*.js` 파일: `63.75kb` → `37.18kb` (**41.7% 감소**)
- `vendor-*.js` 파일: `209.41kb` → `33.31kb` (**84.1% 감소**)

## 최적화의 장점

### 1. 캐시 효율성 향상
배포 후 사용자는 **변경되지 않은 리소스를 다시 다운로드할 필요가 없습니다**. 
예를 들어, React 라이브러리가 업데이트되지 않았다면 사용자는 해당 청크를 캐시에서 불러와 
네트워크 요청을 줄일 수 있습니다.

### 2. 초기 로딩 시간 단축
특정 페이지에서 **불필요한 JavaScript를 받지 않기 때문에** 초기 로드 시간이 훨씬 빨라집니다.
사용자가 실제로 사용하는 기능만 로드하여 더 나은 사용자 경험을 제공할 수 있습니다.

### 3. 네트워크 사용량 감소
총 **202.67kb**의 절약으로 모바일 환경에서 특히 큰 효과를 볼 수 있습니다.

## 주의사항

⚠️ **청크를 너무 잘게 쪼갤 경우** 청크 파일이 많아져서 오히려 초기 로드 시간이 느려질 수 있습니다.

적절한 균형을 맞추는 것이 중요합니다:
- 자주 함께 사용되는 라이브러리들은 같은 청크로 묶기
- 너무 작은 청크들은 합치기
- 실제 사용 패턴을 분석하여 최적화하기













![](https://i.imgur.com/MoY3m5T.png)

