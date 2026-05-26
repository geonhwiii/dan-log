---
title: '번들러 완전 정복 — webpack부터 tsdown까지'
summary: 'webpack부터 tsdown까지 직접 빌드해보면서 각 번들러의 특징에 대해 알아봅니다'
date: '05 26 2026'
draft: false
image: https://i.imgur.com/bogFZkO.png
tags:
  - React
---

> 이 글은 동일한 코드를 7개 번들러/빌드 도구로 각각 빌드해보는 실습 프로젝트를 바탕으로 작성했습니다.  
> Github Project 참고: [bundler-example](https://github.com/geonhwiii/bundler-example)

---

## 들어가며

프론트엔드 개발을 하다보면 webpack부터 시작해서 rollup, esbuild, tsup, vite, rolldown, tsdown 등 새로운 번들러와 빌드 툴이 계속해서 등장합니다. 왜 이렇게 많은 번들러가 등장하는 걸까요?

각 도구들은 단순히 트렌드가 아니라, 이전 세대 번들러가 가진 한계나 새로운 환경(브라우저, Node.js, 개발 방식 등)에서 발생하는 문제를 해결하기 위해 만들어집니다.

이 글에서는 번들러가 존재하는 이유부터 시작해서, 현재 프론트엔드 생태계에서 주요하게 쓰이는 7개 도구를 동일한 소스 코드로 직접 빌드해보며 비교합니다.

---

## 1. 번들러가 왜 필요한가?

### 문제 1. 브라우저는 파일을 직접 읽지 못한다

코드를 모듈로 분리하면 `import './math.ts'` 같은 구문을 쓰게 됩니다. 그런데 브라우저는 보안상 로컬 파일 시스템에 접근할 수 없고, 서버에서 파일을 받아올 때 **파일 하나마다 HTTP 요청이 1번씩** 발생합니다.

```
[Without bundler]
browser -> request index.js
        -> request math.js
        -> request greet.js
        -> request utils.js
        -> ... (100+ requests)

[With bundler]
browser -> request bundle.js  (1 request)
```

번들러는 수백 개의 파일을 빌드 시점에 하나로 합쳐 요청 횟수를 줄입니다.

### 문제 2. 브라우저는 TypeScript를 실행하지 못한다

브라우저와 Node.js 런타임은 `.ts` 파일을 직접 실행할 수 없습니다. TypeScript 코드는 반드시 JavaScript로 **트랜스파일** 되어야 합니다.

```
src/index.ts  -->  [bundler]  -->  dist/index.js  -->  browser
```

### 문제 3. npm 라이브러리 배포 시 포맷을 맞춰야 한다

패키지를 npm에 올리면 다양한 환경에서 소비됩니다.

- **ESM** (`import`) 환경 — 최신 번들러, 브라우저 native module
- **CJS** (`require`) 환경 — 구형 Node.js, Jest 등

TypeScript 소스를 그대로 배포하면 대부분의 환경에서 바로 사용할 수 없습니다. 번들러는 하나의 소스에서 ESM/CJS 두 포맷을 동시에 생성하고, `.d.ts` 타입 선언 파일도 만들어줍니다.

### 번들러가 주는 추가 이점

| Feature               | Description                                  |
| --------------------- | -------------------------------------------- |
| Tree-shaking          | 사용하지 않는 코드를 번들에서 제거           |
| Minification          | 공백·주석 제거, 변수명 단축                  |
| Code splitting        | 앱을 여러 청크로 나눠 필요한 시점에 로드     |
| Source map            | 압축된 코드와 원본 코드를 연결               |
| Env variable inlining | `process.env.NODE_ENV` 등을 빌드 시점에 치환 |

---

## 2. 번들러와 빌드 도구는 다르다

흔히 모두를 "번들러"라고 통칭하지만, 엄밀히는 역할에 따라 구분됩니다.

**번들러 (Bundler):** 여러 JS/TS 모듈 파일을 분석해 하나(또는 소수)의 파일로 합치는 도구

**빌드 도구 (Build tool):** 번들러를 내부적으로 호출하면서, `.d.ts` 생성·포맷 변환·clean 등 라이브러리 배포에 필요한 작업을 추가로 처리해주는 상위 도구

```
[저수준 번들러]             [고수준 빌드 도구]
  webpack (2012)
  rollup  (2015)
  esbuild (2020)   -->   tsup   (2021, esbuild 기반)  [deprecated]
  rolldown(2023)   -->   tsdown (2024, rolldown 기반)

[App 빌드 도구]
  vite (2020) -- wraps esbuild(dev) + rollup/rolldown(prod)
```

또한 용도에 따라 앱 빌드 도구와 라이브러리 빌드 도구로 나뉩니다.

| Tool     | 목적          | HMR | Dev Server |
| -------- | ------------- | :-: | :--------: |
| webpack  | App build     | ✅  |     ✅     |
| vite     | App build     | ✅  |     ✅     |
| rollup   | Library build | ❌  |     ❌     |
| esbuild  | Library build | ❌  |     ❌     |
| rolldown | Library build | ❌  |     ❌     |
| tsup     | Library build | ❌  |     ❌     |
| tsdown   | Library build | ❌  |     ❌     |

---

## 3. 실습 프로젝트 구성

이 글에서는 아래 공통 소스를 7개 도구로 각각 빌드해서 결과를 비교합니다.

```
src/
  math.ts    -- add, subtract, multiply, divide, factorial, calculate 함수
  greet.ts   -- greet, greetAll (multi-language)
  index.ts   -- re-export entry point (트리쉐이킹 비교)
```

```ts
// src/math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

export interface MathResult {
  value: number;
  operation: string;
  operands: [number, number];
}
```

```ts
// src/index.ts
export { add, subtract, multiply, divide, factorial, calculate } from './math';
export type { MathResult } from './math';
export { greet, greetAll } from './greet';
export type { Language } from './greet';
```

---

## 4. 번들러별 상세 분석

### webpack — 역사의 시작 (2012)

webpack은 최초의 현대적 JS 번들러입니다. 2012년 등장 당시 CommonJS 기반으로 설계되었고, 이후 수년간 프론트엔드 빌드 생태계를 지배했습니다.

**핵심 아키텍처: Loader + Plugin**

webpack의 가장 큰 특징은 **Loader 시스템**입니다. 파일 형식별로 변환 파이프라인을 구성할 수 있어, TypeScript는 `ts-loader`, CSS는 `css-loader`로 처리합니다. 번들러 자체가 TypeScript를 이해하지 못하기 때문에 외부 도구에 위임하는 구조입니다.

```js
// webpack.config.js
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default {
  entry: './src/index.ts',
  module: {
    rules: [
      // TypeScript 를 native로 지원하지 않아서 'ts-loader'가 필요
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: { type: 'module' },
    clean: true,
  },
  experiments: { outputModule: true },
  mode: 'production',
};
```

또한 webpack은 번들에 **자체 런타임 코드**를 포함시킵니다. 브라우저에서 모듈 시스템을 구현하기 위한 코드로, 이로 인해 번들 크기가 다소 증가합니다.

**HMR (Hot Module Replacement)**

webpack은 `webpack-dev-server`를 통해 HMR을 지원합니다. 파일이 변경되면 영향받는 모듈 전체를 재번들링한 뒤 교체합니다. 프로젝트 규모가 커질수록 이 재번들링 시간이 길어지는 것이 단점입니다. 이 문제가 훗날 vite 등장의 배경이 됩니다.

**빌드 결과**

```
dist/
  bundle.js  -- 560 B (minified, single file)
```

ESM/CJS 분리 출력보다 단일 앱 번들 형태가 기본입니다. `.d.ts`는 생성되지 않습니다.

---

### rollup — ES 모듈의 정석 (2015)

rollup은 ES 모듈 명세를 처음부터 고려해 설계된 번들러입니다. npm 라이브러리를 배포할 때 가장 많이 사용된 도구로, React·Vue 등 수많은 라이브러리가 rollup으로 빌드됩니다.

**정교한 Tree-shaking**

rollup의 가장 큰 강점은 tree-shaking입니다. 정적 분석을 통해 실제로 사용하지 않는 export를 번들에서 정밀하게 제거합니다. 소비자가 `add`만 import하면 `factorial`, `greet` 등은 번들에 포함되지 않습니다.

**TypeScript는 플러그인으로**

rollup 자체는 JavaScript 번들러이므로, TypeScript 처리를 위해 `@rollup/plugin-typescript` 플러그인이 필요합니다. `.d.ts` 생성도 `rollup-plugin-dts`라는 별도 플러그인을 사용합니다.

```js
// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.mjs', format: 'es', sourcemap: true },
      { file: 'dist/index.cjs', format: 'cjs', sourcemap: true },
    ],
    plugins: [typescript({ declaration: false })],
  },
  // 타입 선언 파일(.d.ts)은 별도의 과정에서 생성됩니다
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts()],
  },
];
```

설정이 비교적 상세하지만, 그 덕분에 번들러가 내부적으로 무슨 일을 하는지 가장 명확하게 이해할 수 있습니다.

**빌드 결과**

```
dist/
  index.mjs      -- 1,219 B (ESM)
  index.mjs.map
  index.cjs      -- 1,367 B (CJS)
  index.cjs.map
  index.d.ts     -- type declarations
```

---

### esbuild — 속도의 혁명 (2020)

esbuild는 Go 언어로 작성된 번들러입니다. 기존 JavaScript 기반 번들러 대비 **10~100배 빠른** 빌드 속도로 등장 즉시 생태계에 충격을 줬습니다.

esbuild의 가장 독특한 점은 `rollup.config.js` 같은 설정 파일 개념이 없다는 것입니다. 대신 **JS API를 직접 호출하는 빌드 스크립트**를 작성합니다.

```ts
// build.ts -- esbuild는 설정 파일이 없으므로 직접 스크립트를 작성합니다
import * as esbuild from 'esbuild';

// ESM output
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/index.mjs',
  platform: 'node',
});

// CJS output
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'cjs',
  outfile: 'dist/index.cjs',
  platform: 'node',
});
```

**TypeScript는 트랜스파일만**

esbuild는 TypeScript를 직접 처리하지만, **타입 검사는 수행하지 않습니다**. TypeScript를 그냥 "타입 어노테이션이 있는 JavaScript"로 취급하며 타입을 제거하고 변환합니다. 덕분에 빠르지만, 타입 오류가 빌드 단계에서 잡히지 않습니다.

또한 `.d.ts` 파일 생성이 불가능합니다. `tsc --emitDeclarationOnly`를 별도로 실행해야 합니다.

**CJS 출력이 큰 이유**

esbuild의 CJS 출력을 보면 ESM보다 파일이 유독 큽니다.

```
dist/index.mjs  --  898 B
dist/index.cjs  -- 2,101 B  (why so large?)
```

이는 esbuild가 CJS 출력 시 ESM → CJS 변환을 위한 interop 헬퍼를 자동 삽입하기 때문입니다.

```js
// esbuild가 ESM → CJS 변환을 위해 자동 삽입하는 interop 헬퍼 코드
var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __toCommonJS = (mod) => { ... };
```

---

### vite — 개발 경험의 혁신 (2020)

vite는 번들러가 아니라 **빌드 도구(Build tool)** 입니다. Evan You(Vue 창시자)가 만든 도구로, 빠른 개발 서버와 프로덕션 빌드를 하나의 도구로 제공합니다.

**vite가 풀려던 문제**

webpack의 HMR은 파일 변경 시 영향받는 모듈을 재번들링합니다. 프로젝트가 커지면 이 시간이 수 초에서 수십 초로 늘어납니다.

```
[webpack HMR]
파일 변경됨
  -> 영향 받은 모듈만 다시 번들링
  -> 새 번들 전체를 브라우저에 전송
  (프로젝트가 커질수록 점점 느려짐)

[vite HMR]
파일 변경됨
  -> 딱 그 파일만 변환 (esbuild)
  -> 변경된 단일 모듈만 네이티브 ESM으로 전송
  (프로젝트 크기와 무관하게 항상 빠름)
```

vite는 개발 서버에서 **번들링을 하지 않습니다**. 파일을 요청받을 때 esbuild로 변환만 해서 네이티브 ESM으로 브라우저에 바로 서빙합니다. 그래서 프로젝트 크기와 무관하게 HMR이 빠릅니다.

**내부 아키텍처 변천 (중요)**

vite는 역사적으로 내부에서 두 가지 다른 도구를 동시에 사용해왔습니다.

```
[Vite 1~6: 듀얼 파이프라인 구조]
  개발 서버(의존성 사전 번들링)   -->  esbuild  (빠른 트랜스폼)
  프로덕션 빌드                -->  rollup   (최적화 번들링)
  -> 개발/프로덕션 파이프라인이 달라 일관성 부족

[Vite 7: 실험적 통합 (rolldown-vite 패키지)]
  개발/프로덕션 모두            -->  rolldown  (통합 파이프라인)

[Vite 8: 공식 통합]
  개발 서버(의존성 사전 번들링)   -->  rolldown  (esbuild 대체)
  프로덕션 빌드                -->  rolldown  (rollup 대체)
  JS 변환/최적화(minify)       -->  Oxc       (esbuild 대체)
  CSS 최적화(minify)          -->  Lightning CSS (esbuild 대체)
  -> 단일 파이프라인, 개발/프로덕션 일치
```

공식 문서는 이 문제를 직접 언급합니다.

> _Vite는 처음에 개발 환경에서는 빠른 컴파일을 위해 esbuild를, 프로덕션 빌드에서는 최적화를 위해 Rollup을 각각 별도로 사용했습니다. 이 방식은 동작하긴 했지만, 두 가지 빌드 파이프라인을 유지하다 보니 변환 동작의 차이, 플러그인 시스템 분리, 꾸준히 늘어나는 연결 코드 등 여러 가지 불일치와 복잡함이 발생했습니다._

**Library Mode**

vite는 Library Mode를 통해 npm 라이브러리 배포용 번들도 생성할 수 있습니다.

```ts
// vite.config.ts (Vite 8)
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ include: ['src'] })],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rolldownOptions: { external: [] }, // Vite 8: rollupOptions -> rolldownOptions
  },
});
```

단, [공식 문서](https://ko.vite.dev/guide/build#library-mode)는 복잡한 라이브러리 빌드에는 tsdown 또는 rolldown 직접 사용을 권장합니다.

---

### tsup — esbuild 위의 편의 도구 (2021)

tsup은 esbuild를 내부에서 사용하는 TypeScript 라이브러리 빌드 도구입니다.

esbuild는 빠르지만 라이브러리 배포에 필요한 것들이 없습니다.

```
[esbuild alone]                  [tsup on top of esbuild]
- No .d.ts generation        ->  dts: true
- Manual ESM+CJS setup       ->  format: ['esm', 'cjs']
- No auto external detection ->  auto-detects node_modules
- No config file convention  ->  tsup.config.ts
- No clean option            ->  clean: true
```

2021년 당시 rolldown은 존재하지 않았고, esbuild는 너무 저수준이었습니다.

tsup은 그 공백을 채워주는 빌드 도구였습니다.

```ts
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true, // .d.ts generated in one option
  clean: true,
  sourcemap: true,
});
```

설정이 매우 간결합니다. `dts: true` 옵션 하나로 `.d.ts` 파일까지 자동 생성됩니다.

현재는 유지보수가 되지 않아, tsdown으로의 마이그레이션을 권장합니다.

---

### rolldown — Rust로 rewrite된 rollup (2023)

rolldown은 Vite 팀(VoidZero)이 Rust로 개발한 rollup의 후계자 번들러입니다. rollup과 동일한 플러그인 API를 가지면서 Rust 기반의 성능을 제공합니다.

rollup과의 가장 큰 실용적 차이는 TypeScript를 내장 지원한다는 것입니다. rollup에서처럼 `@rollup/plugin-typescript`가 필요 없이, 내부적으로 Rust 기반 파서/트랜스파일러인 Oxc를 사용합니다.

```ts
// rolldown.config.ts -- TypeScript supported natively, no plugin needed
import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.mjs', format: 'esm', sourcemap: true },
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.cjs', format: 'cjs', sourcemap: true },
  },
]);
```

설정 구조는 rollup과 거의 동일합니다. rollup을 쓰던 사람이라면 바로 적응할 수 있습니다.

**속도 비교**

```
rollup build time    ~1,000 ms
rolldown build time     ~9 ms   (100x faster)
```

같은 설정, 같은 소스 코드인데 100배 가까운 차이가 납니다.

rolldown 공식 문서는 라이브러리 번들링에 rolldown 직접 사용보다 **tsdown 사용을 권장**합니다. Vite 8 내부에서 이미 rolldown이 돌아가고 있으므로, 프론트엔드 개발자가 rolldown을 직접 다룰 일은 Vite/rollup 플러그인 제작처럼 특수한 경우로 한정됩니다.

---

### tsdown — tsup의 공식 후계자 (2024)

tsdown은 rolldown 기반의 TypeScript 라이브러리 빌드 도구입니다. tsup을 rolldown 엔진으로 교체한 것으로 이해하면 됩니다.

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

tsup 설정과 거의 동일합니다. 공식적으로 tsup → tsdown 마이그레이션 가이드를 제공하며, 대부분의 옵션이 그대로 호환됩니다.

내부 엔진이 rolldown으로 바뀌었기 때문에 Oxc 기반 `.d.ts` 생성이 더 빠르고, Vite 팀이 직접 유지보수하므로 생태계와의 통합이 자연스럽습니다.

---

## 5. 실제 빌드 결과 비교

> 동일한 소스(math.ts + greet.ts + index.ts)를 각 도구로 빌드한 결과입니다.

### 출력 파일 형식

| Tool     |     ESM     |     CJS     |     .d.ts     | sourcemap |
| -------- | :---------: | :---------: | :-----------: | :-------: |
| webpack  |      -      |      -      |      ❌       |    ❌     |
| rollup   | `index.mjs` | `index.cjs` |   ✅ (단일)   |    ✅     |
| esbuild  | `index.mjs` | `index.cjs` |      ❌       |    ❌     |
| vite     | `index.js`  | `index.cjs` | ✅ (파일마다) |    ❌     |
| tsup     | `index.js`  | `index.cjs` |   ✅ (단일)   |    ✅     |
| rolldown | `index.mjs` | `index.cjs` |      ❌       |    ✅     |
| tsdown   | `index.js`  | `index.cjs` |   ✅ (단일)   |    ✅     |

webpack은 단일 `bundle.js` 출력 (minified, 560 B)

### 번들 크기 비교

```
Tool         ESM          CJS
----------   ----------   ----------
webpack      560 B (bundle.js, minified)
rollup       1,219 B      1,367 B
esbuild        898 B      2,101 B  ← CJS가 큰 이유는 interop 헬퍼 코드가 들어가서임
vite           735 B        673 B  ← tree-shaking과 minify가 기본 적용되어 작음
tsup           931 B      2,135 B  ← esbuild와 동일한 interop 헬퍼 영향
rolldown     1,038 B      1,244 B
tsdown       1,037 B      1,244 B
```

**esbuild/tsup CJS가 큰 이유:** ESM → CJS 변환을 위한 `__toESM`, `__toCommonJS` interop 헬퍼를 자동 삽입합니다. rollup/rolldown 계열은 더 경량의 래퍼를 생성합니다.

**vite Library Mode가 작은 이유:** rollup의 tree-shaking + minification이 기본 적용됩니다.

### 빌드 속도 비교

| 툴       | 빌드 속도 | 설명                                                   |
| -------- | --------- | ------------------------------------------------------ |
| esbuild  | ~즉시     | Go로 작성된 네이티브 바이너리, 매우 빠름               |
| rolldown | ~9 ms     | Rust로 작성된 네이티브 바이너리, esbuild 다음으로 빠름 |
| vite     | ~530 ms   | rolldown과 dts 플러그인 조합, 비교적 빠름              |
| tsup     | ~650 ms   | esbuild 기반 + 타입 선언(dts) 생성                     |
| rollup   | ~1,000 ms | JS 엔진 기반, 타입 선언 포함                           |
| webpack  | ~1,000 ms | JS 엔진 기반, 전통적인 방식                            |
| tsdown   | ~1,500 ms | rolldown + Oxc 기반 dts 생성, 타입 추출로 가장 느림    |

네이티브 언어(Go, Rust)로 작성된 번들러가 JavaScript 기반 번들러보다 훨씬 빠릅니다.

---

## 6. 생태계의 흐름 — 왜 이렇게 많아졌나?

각 도구가 등장한 맥락을 이해하면 생태계 전체가 명확해집니다.

```
2012  webpack 등장
        - 최초의 모던 번들러, CommonJS 중심
        - 강력하지만 복잡한 설정, 느린 HMR

2015  rollup 등장
        - ES 모듈 우선 설계
        - 더 뛰어난 트리셰이킹, 라이브러리용 특화
        - vite, tsdown 플러그인 API의 원형

2020  esbuild 등장
        - Go 기반, webpack 대비 10~100배 빠름
        - .d.ts 미지원, 라이브러리 제작 관습 부재
        -> 부족한 부분을 채우기 위해 tsup(2021) 등장

2020  vite 등장
        - 개발 서버: esbuild + 네이티브 ESM (번들링 없음)
        - 프로덕션 빌드: rollup 사용
        - 문제점: 두 파이프라인 → dev/prod 불일치

2023  rolldown 등장
        - Rust 기반 rollup 대체 번들러
        - esbuild + rollup 역할 통합
        - Vite 8 코어 번들러로 채택
        -> tsdown(2024)이 tsup의 뒤를 잇는 후속작으로 등장
        -> Vite 7(rolldown-vite) → Vite 8(공식화)

현재(2025년) 생태계:
  앱 개발         ->  vite (내부에 rolldown + Oxc)
  라이브러리 배포  ->  tsdown (내부에 rolldown)
```

핵심 흐름: 단순히 "빠른 번들러"를 만드는 것을 넘어, **개발/프로덕션 파이프라인을 하나로 통합**하는 방향으로 수렴하고 있습니다.

---

## 7. 언제 무엇을 써야 할까?

| 상황                      | 추천 도구           | 이유                                        |
| ------------------------- | ------------------- | ------------------------------------------- |
| React/Vue 앱 개발         | vite                | 빠른 HMR, 개발 서버, 풍부한 플러그인 생태계 |
| npm 라이브러리 배포       | tsdown              | .d.ts 지원, ESM+CJS, rolldown의 빠른 성능   |
| 번들러 내부 구조 학습     | esbuild 또는 rollup | 로우레벨, 직접적인 설정 제어 가능           |
| Vite/rollup 플러그인 개발 | rolldown            | 동일한 플러그인 API 사용                    |

---

## 참고 자료

- [toss/frontend-fundamentals — 번들러란](https://github.com/toss/frontend-fundamentals/blob/main/fundamentals/bundling/bundler.md)
- [esbuild 공식 문서](https://esbuild.github.io/)
- [rollup 공식 문서](https://rollupjs.org/)
- [rolldown 공식 문서](https://rolldown.rs/)
- [vite 공식 문서](https://vite.dev/)
- [vite — Why Vite](https://vite.dev/guide/why)
- [vite — Rolldown Integration (v7)](https://v7.vite.dev/guide/rolldown)
- [vite — Migration from v7 (v8)](https://vite.dev/guide/migration)
- [tsup 공식 문서](https://tsup.egoist.dev/)
- [tsdown 공식 문서](https://tsdown.dev/)
- [webpack — ECMAScript Modules](https://webpack.js.org/guides/ecma-script-modules/)
