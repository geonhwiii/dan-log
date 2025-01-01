---
title: 'monorepo로 expo 앱 개발하기'
summary: 'monorepo로 expo 앱 개발하기'
date: '12 30 2024'
draft: false
tags:
  - react native
  - expo
  - monorepo
---

모바일 앱을 개인프로젝트로 `expo`로 혼자서 개발하고 있던 중,

회사에서 새로운 프로젝트를 모바일 앱으로 개발하게 되었습니다.

기존에 개발했던 컴포넌트와 유틸을 같이 사용하기 위해 모노레포로 전환하였고,

그 내용들을 공유합니다.

(의외로 `expo` 앱을 2개로 관리하는 예시 프로젝트는 없더라구요...?)


## 1. 기본 구조

구조는 일반적인 모노레포 프로젝트와 동일합니다.

패키지매니저는 `yarn, pnpm, bun` 중 즐겨 사용하는 라이브러리를 사용해 주세요.

`yarn berry(v3, v4)`는 `expo eas`에서 `workspace`를 지원하지 않으니 주의해 주세요...!

저는 `bun v1.1.25` 로 진행하였습니다.  

```shell
# 프로젝트 구조
- package.json
- bun.lockb
- biome.json
- apps
  - mobile1
  - mobile2
- packages
	- core
	- utils
```

먼저 `package.json` 을 살펴보면

`workspaces` 로 원하는 모노레포 구조의 폴더를 적어주세요.

`bun workspace`는 `--filter` 기능을 지원하므로 하위 프로젝트의 `script`를 루트에서 실행할 수 있어요.

```json
{
	"name": "expo-monorepo-example",
	"private": true,
	"scripts": {
		"start:1": "bun run --filter @example/mobile1 start",
		"start:2": "bun run --filter @example/mobile2 start"
	},
	"workspaces": ["apps/*", "packages/*"]
}
```


## 2. 앱 세팅

`apps/mobile1`과 `apps/mobile2` 는 `expo cli`로 생성해줍니다.

```shell
# 1. apps 폴더에서
npx create-expo-app@latest

... What is your app named? › mobile1

# 2. apps 폴더에서
npx create-expo-app@latest

... What is your app named? › mobile2
...

```

이후, 앱 내 `package.json` 의 이름을 변경해줍니다.

`@example/core`, `@example/utils` 도 필요한 구조로 세팅 후  (과정은 생략)

아래와 같이 `workspace:*`로 설정해줍니다. 

```json
{
	"name": "@example/mobile1",
	...,
	"dependencies": {
		"@example/core": "workspace:*",
		"@example/utils": "workspace:*",
		...
	}
}

{
	"name": "@example/mobile2",
	...,
	"dependencies": {
		"@example/core": "workspace:*",
		"@example/utils": "workspace:*",
		...
	}
}
```

이제 기본적인 모노레포 세팅은 완료되었고, `expo` 파일들을 수정해볼게요.

먼저, `metro.config.js` 입니다. 

(* 만약 없다면 파일을 생성 해주세요. 파일 생성 시 `customize`로 적용됩니다.)

```tsx
// apps/mobile1/metro.config.js

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const path = require('path');  

// 1. 프로젝트 파일 위치를 찾습니다.
const projectRoot = __dirname;

// 2. 모노레포의 루트 파일 위치를 찾습니다.
const monorepoRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);  

// 3. 모노레포의 모든 폴더를 watch하는 설정입니다.
config.watchFolders = [monorepoRoot];

// 4. 각 프로젝트의 node_modules를 metro에게 알려줍니다.
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, 'node_modules'),
	path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

// 5. nativewind를 사용한다면, 아래와 같이 withNativeWind를 감싸주세요.
module.exports = withNativeWind(config, { input: './styles/global.css' });
```


이제 거의 다 왔습니다.

별 것 없지만 가장 중요한데, `script` 에서 캐시를 꺼주는 것입니다.

```json
// apps/mobile1/package.json
{
	...,
	"scripts": {
		"start": "expo start -c",
		...
	}
}
```

시뮬레이터 앱인 `expo go` 의 버그로, 모노레포 앱 전환 시 캐시가 남아있어,

이전 앱의 라우팅이 적용되는 오류가 있습니다.

따라서, 조금 느리더라도 `-c` 옵션으로 캐시를 삭제하고 시작하면 됩니다.

빌드 시에는 문제가 없으니 그대로 사용해주셔도 괜찮습니다.

---

추가적으로 세팅에 어려움이 있다면 `expo`의 모노레포 `docs`를 확인해 주세요 :)

https://docs.expo.dev/guides/monorepos/


