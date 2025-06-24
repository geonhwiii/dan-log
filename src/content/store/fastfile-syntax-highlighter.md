---
title: "Fastfile Syntax Highlighter"
description: "React Native와 iOS 프로젝트에서 Fastfile을 위한 문법 강조 및 자동완성 기능을 제공하는 VSCode 확장 프로그램"
image: "https://i.imgur.com/v2gplDg.png"
github: "https://github.com/geonhwiii/fastfile-syntax-highlighter"
link: "https://open-vsx.org/extension/geonhwiii/fastfile-syntax-highlighter"
tech: ["vscode", "fastlane"]
date: 2025-06-25
---

# Fastfile Syntax Highlighter

React Native와 iOS 프로젝트에서 Fastfile을 위한 문법 강조 및 자동완성 기능을 제공하는 VSCode 확장 프로그램입니다.

## 기능

- **문법 강조**: Fastfile의 주요 함수들과 키워드에 대한 컬러 하이라이팅
- **자동완성**: 주요 fastlane 함수들에 대한 IntelliSense 지원
- **코드 스니펫**: 자주 사용되는 패턴들을 위한 코드 스니펫
- **호버 도움말**: 함수 위에 마우스를 올리면 설명과 예제 코드 표시

## 지원하는 함수들

### iOS 관련

- `build_app`, `gym`, `cert`, `sigh`, `match`
- `produce`, `deliver`, `pilot`, `pem`
- `increment_build_number`, `increment_version_number`
- `upload_to_testflight`, `upload_to_app_store`

### Android 관련

- `build_android_app`, `gradle`, `supply`
- `increment_version_code`, `increment_version_name`

### 공통 함수

- `scan`, `cocoapods`, `carthage`, `slack`
- `git_add`, `git_commit`, `git_push`
- `firebase_app_distribution`, `crashlytics`

## 사용법

1. Fastfile을 열면 자동으로 문법 강조가 적용됩니다
2. 함수 이름을 입력하면 자동완성 목록이 나타납니다
3. 함수 위에 마우스를 올리면 도움말이 표시됩니다
4. 스니펫을 사용하려면 `lane`, `platform`, `build_app` 등을 입력하고 Tab을 누르세요

## 설치 방법

1. VSCode 확장 프로그램 마켓플레이스에서 "Fastfile Syntax Highlighter" 검색
2. 설치 버튼 클릭
3. Fastfile을 열어서 기능 확인

## 개발

```bash
# 의존성 설치
bun install

# 컴파일
bun run compile

# 감시 모드로 컴파일
bun run watch
```

## 라이선스

MIT License
