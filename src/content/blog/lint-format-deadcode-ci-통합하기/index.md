---
title: 'AI 시대, knip으로 Dead Code 말끔히 정리하기'
summary: 'AI가 코드를 쏟아내는 만큼 Dead Code도 빠르게 쌓입니다. 프로젝트에 knip을 도입하고 CI에 통합하는 과정을 설명합니다'
date: '05 29 2026'
draft: false
image: 'https://knip.dev/og/docs.webp'
tags:
  - Frontend
  - CI
---

![](https://knip.dev/og/docs.webp)

최근에 AI로 코드를 많이 작성하면서, 코드의 이해와 퀄리티에 대한 이슈가 많이 부각되고 있습니다.

생성 속도가 빨라진만큼, 코드가 방대해지고 기획도 자주 바뀌면서 **dead code**(사용하지 않는 코드)가 빠르게 쌓입니다.

이번에는 knip을 사용해 사용하지 않는 코드를 정리하고, 이를 린트와 함께 CI에 적용하여서 프로젝트 관리하는 방법을 알아봅니다.

실제 회사의 모노레포 프로젝트에 knip을 도입하고, biome·knip·테스트를 GitHub Actions에 적용하여 **158개 파일, 8,443라인, 16개 의존성**을 걷어냈고, 매 PR에 적용되도록 자동화하였습니다.

## 1. knip

[knip](https://knip.dev/)은 프로젝트 안에서 **사용하지 않는 파일·export·의존성**을 찾아주는 데드코드 분석 도구입니다. 단순히 문자열을 검색하는 것이 아니라, 프레임워크와 도구 설정을 바탕으로 진입점부터 import 그래프를 따라가며 실제로 도달 가능한 코드와 그렇지 않은 코드를 구분합니다.

knip을 도입하는 이유를 다음과 같이 설명합니다.

- **유지보수가 쉬워집니다.** 사용 여부가 불분명한 파일과 의존성이 줄어들수록 수정해야 할 범위가 명확해집니다.
- **온보딩이 쉬워집니다.** 새로 합류한 사람이 "이 파일을 지워도 되는가?"를 매번 추측하지 않아도 됩니다.
- **회귀를 막을 수 있습니다.** TypeScript·린터·포맷터가 코드 품질을 지키듯, Knip은 미사용 파일·export·의존성이 다시 쌓이지 않도록 CI에서 검증할 수 있습니다.
- **자동화할 수 있습니다.** 사람이 수동으로 죽은 코드를 찾는 일은 오래 걸리고 놓치기 쉽습니다. Knip은 이 반복 작업을 도구와 CI에 맡길 수 있게 해줍니다.

## 2. lint + format + knip

프로젝트에 `knip`를 cli로 바로 적용해서, `dead code`를 지우는 것도 물론 괜찮습니다.

하지만 지속적으로 관리하지 않으면 계속 쌓이기 때문에, 린트와 포맷과 함께 CI에 통합하는 것을 권장합니다.

이 글에서는 다음의 도구를 사용합니다.

| 역할          | 도구                       | 한 줄 요약                                          |
| ------------- | -------------------------- | --------------------------------------------------- |
| format + lint | Biome                      | Prettier + ESLint를 하나로. Rust 기반이라 매우 빠름 |
| dead code     | Knip                       | 미사용 파일·export·의존성을 그래프로 추적           |
| 실행기 / CI   | Turborepo · GitHub Actions | 모노레포 태스크 위임 + 자동 검증                    |

> 도구 선택은 자유입니다. Biome 대신 ESLint + Prettier, oxc, 그리고 turbo 대신 vp도 그대로 적용할 수 있습니다.

## 3. Biome 설정 (lint & format)

설치하고 설정 파일을 만듭니다. `Biome`은 단일 `biome.json`으로 포맷·린트를 함께 다룹니다.

```bash title="Biome 설치"
npm install -D @biomejs/biome
npx @biomejs/biome init
```

init 이후에 크게 설정할 건 없고, **formatter** 규칙을 추가해줍니다.

**주의할 부분**은 `tailwindcss v4`의 경우 Biome 버전을 v2.3 이후로 업데이트 후,

아래와 같이 `tailwindDirectives` 옵션을 적용해주어야 `@theme`, `@utility`등에서 린트 오류가 발생하지 않습니다.

```json title="biome.json"
{
  "root": false,
  "$schema": "https://biomejs.dev/schemas/2.4.16/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": ["**", "!node_modules", "!.next", "!dist", "!build"]
  },
  "formatter": {
    ...
  },
  "linter": {
    "enabled": true,
    "rules": {
      ...,
      "recommended": true
    },
    "domains": {
      "next": "recommended",
      "react": "recommended"
    }
  },
  "javascript": {
    "formatter": {
      ...
    }
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "css": {
    "parser": {
      // tailwindcss v4: @theme, @utility, @apply 문법 적용
      "tailwindDirectives": true
    }
  }
}
```

## 4. knip 설정

**knip**은 `entry`에서 시작해 import 그래프를 따라가며, **도달하지 못하는** 파일·export·의존성을 보고합니다.

```bash title="knip 및 MCP 설치"
npm install -D knip
npx @knip/mcp
```

제공하는 MCP를 설치하여 LLM으로 적용하는 것을 권장드립니다.

제가 적용한 `knip.config.ts`중 주요 내용만 살펴보겠습니다.

```ts title="knip.config.ts"
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/main.tsx',
    'sentry.server.config.ts',
    'e2e/**/*.ts', // 테스트 진입점
  ],
  project: ['src/**/*.{ts,tsx}'],
  // 설정에 문자열로만 등장해 그래프에 안 잡히는 의존성
  ignoreDependencies: ['tailwindcss', '@storybook/addon-a11y'],
  // 분석 대상에서 제외 (API 타입 생성 파일 등)
  ignore: ['src/types/*-service.ts'],
};

export default config;
```

디자인 시스템과 같은 사용하지 않더라도 의도적으로 내보내는 케이스는 `ignoreIssues`로 설정합니다.

```ts title="knip.config.ts · ignoreIssues" {3}
{
  ignoreIssues: {
    // 디자인 시스템은 미사용 export도 의도적으로 유지
    'packages/ui/src/**': ['exports'],
  }
}
```

모노레포의 경우 다음과 같이 `workspaces`에 경로 및 설정을 추가해야 합니다.

```ts title="knip.config.ts
workspaces: {
    '.': {
      entry: ['turbo.json!'],
      project: ['*.{ts,js,mjs,cjs}'],
      ignoreDependencies: [
        'husky',
      ],
    },
    'apps/web': {
      project: ['src/**/*.{ts,tsx}', '*.config.{ts,mts}', '.storybook/**/*.ts'],
      ...
    },
    'apps/docs': {
      entry: ['e2e/**/*.ts'],
      project: ['src/**/*.{ts,tsx}', 'e2e/**/*.ts', '*.config.{ts,mts,mjs}'],
      ...
    },
    'packages/ui': {
      project: ['src/**/*.{ts,tsx}'],
      ignoreDependencies: ['tailwindcss', '@teo/tailwind-config'],
    },
    'packages/tailwind-config': {
      // exports 맵으로 앱에 제공되는 설정 파일이 진입점
      entry: ['src/postcss.config.js'],
      project: ['src/**/*.{ts,js,cjs,mjs}'],
      ignoreDependencies: ['postcss', 'tailwindcss'],
    },
  },
```

## 5. Scripts 설정

`package.json`에 **scripts**를 추가하여, CI에 적용할 준비를 합니다.

```json title="package.json · scripts"
{
  "scripts": {
    "check:types": "turbo run check-types",
    "check:knip": "knip",
    "fix:lint": "turbo run lint",
    "fix:format": "turbo run format"
  }
}
```

## 6. pre-commit 훅 적용

`nano-staged`(또는 `lint-staged`) + `husky` 를 사용하여, CI 적용 전에 먼저 검사를 합니다.

```json title="package.json · nano-staged"
{
  "nano-staged": {
    "*.{js,ts,tsx}": "biome check --write --no-errors-on-unmatched"
  }
}
```

## 7. CI 통합 (GitHub Actions)

본인의 환경에 맞추어 `.github/workflows/ci.yml`을 작성합니다.

```yaml title=".github/workflows/ci.yml" {22}
name: CI
on:
  pull_request:
    branches: [develop]
  push:
    branches: [develop]

jobs:
  knip:
    name: knip
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: oven-sh/setup-bun@v2
        with: { bun-version: '1.3.5' }
      - uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
      - run: bun install --frozen-lockfile
      - name: knip 실행
        run: bun run knip --include files,exports,dependencies,unlisted --reporter compact
```

기존 코드베이스에 knip을 처음 도입하면 보고가 수백 건 쏟아집니다. 전부를 CI 실패 조건으로 걸면 PR이 영원히 못 통과합니다.

초기에는 `--include`로 범위를 좁히고, 점진적으로 적용해야합니다.

| 옵션           | 목적                                      |
| -------------- | ----------------------------------------- |
| `files`        | 도달 불가능한 파일                        |
| `exports`      | 안 쓰는 export                            |
| `dependencies` | 설치됐지만 안 쓰는 패키지                 |
| `unlisted`     | import하지만 `package.json`에 없는 패키지 |

```bash title="CI 강제 범위 vs 로컬 전체 점검"
# CI에서 강제하는 범위: 가장 명확한 회귀만 차단
knip --include files,exports,dependencies,unlisted

# 로컬 전체 점검(참고용) — types 등 정리 대상까지 모두 표시
knip
```

> 처음부터 전체를 점검하면 상당히 부담스러울 수 있습니다. 옵션을 조정하며 적용할 것을 권장드립니다.

## 8. 결과

다음은 제가 프로젝트에 적용한 결과입니다.

| 지표          |              값 | 비고                            |
| ------------- | --------------: | ------------------------------- |
| 삭제된 파일   |       **158개** | `knip.config.ts` 1개만 추가됨   |
| 순 파일 감소  |      **−157개** | 전체 파일의 약 **9.5%**         |
| 삭제된 코드   |  **9,136 라인** |                                 |
| 순 코드 감소  | **−8,443 라인** | 전체 코드의 약 **11%**          |
| 제거된 의존성 | **16개 패키지** | `recharts` 등 미사용 라이브러리 |

---

AI 시대에 코드를 생산하는 것도 중요하지만, 방대한 코드를 어떻게 제어하고 관리하느냐도 중요해졌습니다. 자동화된 코드 관리와 품질 유지는 더 이상 선택이 아니라 필수가 되었고, 이러한 도구들을 적절히 도입하는 것이 프로젝트를 건강한 방향으로 이끌 수 있습니다.
