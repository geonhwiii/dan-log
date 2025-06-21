---
title: "rusky"
description: "Simple Git hooks manager written in Rust"
image: "https://i.imgur.com/pBVrZy3.png"
github: "https://github.com/geonhwiii/rusky#readme"
tech: ["rust"]
date: 2025-06-20
status: "완료"
---

## 🐺 rusky란?

**Rust로 작성된 간단한 Git hooks 관리자** - husky의 의존성 없는 대안

rusky는 Git hooks를 관리하기 위한 도구로, 기존의 husky와 동일한 사용법을 제공하면서도 런타임 의존성이 전혀 없는 것이 특징입니다. Rust로 작성되어 컴파일 타임 안전성과 크로스 플랫폼 지원을 제공합니다.

## ✨ 주요 특징

- 🚀 **드롭인 교체**: husky와 정확히 동일하게 작동 - 학습 곡선 없음
- 🔧 **간단한 설정**: 시작하기 위해 명령어 하나만 필요
- 📦 **런타임 의존성 제로**: 관리할 Node.js 의존성 없음
- 🎯 **Git 통합**: Git hooks와 원활한 통합
- 🛡️ **타입 안전**: Rust의 컴파일 타임 안전성 보장
- 🌍 **크로스 플랫폼**: macOS, Linux, Windows에서 작동

## 📦 설치

```bash
npm install --save-dev @gunw.dan/rusky
```

이게 전부입니다! 추가 의존성이나 복잡한 설정 없이, rusky는 husky와 정확히 동일하게 작동하지만 런타임 의존성은 전혀 없습니다.

## 🚀 빠른 시작

1. 프로젝트에서 rusky 초기화:
```bash
npx @gunw.dan/rusky init
```

2. Git hook 추가:
```bash
npx @gunw.dan/rusky add pre-commit "npm test"
```

3. 필요에 따라 더 많은 hook 추가:
```bash
npx @gunw.dan/rusky add pre-push "npm run lint"
npx @gunw.dan/rusky add commit-msg "npx commitlint --edit $1"
```

## 📚 명령어

### `rusky init`
프로젝트에서 rusky를 초기화합니다. `.rusky` 디렉토리를 생성하고 git hooks 디렉토리를 설정합니다.

### `rusky add <hook> <command>`
지정된 명령어로 Git hook을 추가합니다.

### `rusky remove <hook>`
Git hook을 제거합니다.

### `rusky list`
설정된 모든 hook을 나열합니다.

### `rusky install`
설정된 모든 Git hook을 설치합니다.

### `rusky uninstall`
rusky가 관리하는 모든 Git hook을 제거합니다.

## 🎯 지원하는 Git Hooks

rusky는 모든 표준 Git hook을 지원합니다:

- `pre-commit` - 커밋 전
- `prepare-commit-msg` - 커밋 메시지 에디터 전
- `commit-msg` - 커밋 메시지 후
- `post-commit` - 커밋 후
- `pre-rebase` - 리베이스 전
- `post-checkout` - 체크아웃 후
- `post-merge` - 머지 후
- `pre-push` - 푸시 전
- 기타 서버 사이드 hook들

## 🔧 설정

rusky는 `.rusky/config.json`에 설정을 저장합니다:

```json
{
  "hooks": {
    "pre-commit": "npm test",
    "pre-push": "npm run lint"
  },
  "version": "0.1.0"
}
```

## 🛠️ 개발

### 사전 요구사항
- Rust 1.70+
- Node.js 14+

### 소스에서 빌드

```bash
# 저장소 클론
git clone https://github.com/geonhwiii/rusky.git
cd rusky

# 프로젝트 빌드
cargo build --release

# 테스트 실행
cargo test

# 로컬 설치
npm install
```

### 테스트 실행

rusky는 포괄적인 테스트 커버리지를 포함합니다:

- **단위 테스트**: 개별 함수와 모듈 테스트
- **통합 테스트**: CLI 명령어의 엔드투엔드 테스트
- **테스트 기능**: 임시 디렉토리를 사용한 격리된 테스트 환경, Git 저장소 시뮬레이션, 포괄적인 오류 시나리오 커버리지

## 🔗 관련 프로젝트

- [husky](https://github.com/typicode/husky) - 원본 Git hooks 관리자
- [pre-commit](https://pre-commit.com/) - pre-commit hook 관리 프레임워크
- [commitlint](https://commitlint.js.org/) - 커밋 메시지 린트


