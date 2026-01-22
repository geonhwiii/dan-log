---
title: "Cursor로 rusky와 react-native-svg-preview 만들기"
summary: "Rust 언어를 모르는 상태에서 rusky를 만들고, vsCode 익스텐션 react-native-svg-preview 개발하기"
date: "05 27 2025"
draft: false
tags:
  - React Native
---

최근에 `Cursor`를 사용해서 두 가지 프로젝트를 만들어보았습니다.

첫 번째는 `rust`로 만든 `husky` 라이브러리인 `rusky`이고,
두 번째는 `vscode` 익스텐션인 `react-native-svg-preview`입니다.

`rust` 언어에 대한 지식이 전혀 없었지만, `Cursor`의 도움으로 성공적으로 프로젝트를 완성할 수 있었습니다 :)

## 1. rusky - Rust로 만든 husky

### 프로젝트 시작

회사에서 `husky`를 사용하고 있었는데, `Rust`로 만들면 어떤 점이 개선될까? 라는 상상을 자주 했습니다.
`Node.js` 기반의 `husky` 보다 속도나 사용성이 좋을지 궁금했는데요, 어떨까요?

### Rust 언어 학습 없이 개발하기

`Rust` 언어를 전혀 모르는 상태에서 시작했지만, 결론은 1시간도 안걸려 npm 배포까지 완료하였습니다!

지속적으로 라이브러리를 관리하기 위해 `memorybank`를 활용했는데요.

간단하게 설명하면, 작업하려는 내용, 과정 등을 저장해두고, 다음 개발에 cursor가 알 수 있도록 하는 것입니다.

사용해보고 싶으신 분들은 아래 링크의 docs를 사용하고 cursor에게 태그하고 시작하시면 됩니다.

[`memorybank 링크`](https://github.com/vanzan01/cursor-memory-bank)

### 진행과정

원하는 명세를 분명하게 정하고 작업을 진행해야 합니다.

저는 성능, 간단한 기본 기능, rust에 집중을 하고 작업을 했습니다.

아래는 `memorybank`의 `projectbrief.md` 의 일부입니다.

```md
# Project Brief: rusky

## 프로젝트 개요

**rusky**는 Rust로 작성된 고성능 Git hooks 관리 도구로, 기존의 husky를 대체하는 것을 목표로 합니다.

## 핵심 목표

1. **성능 우선**: husky보다 뛰어한 성능 제공
2. **Rust 기반**: 메모리 안전성과 성능 최적화
3. **npm 배포**: 기존 Node.js 생태계와의 호환성
4. **기본 기능 구현**: 복잡한 기능보다는 husky의 핵심 기능에 집중
```

위 사항을 토대로 기능 및 테스크 코드까지 모두 통과된 뒤에 배포를 진행하였습니다.

`cursor`를 사용해 벤치마크를 생성하고, husky와 비교해본 결과는 다음과 같습니다.

- 실행 속도: rusky가 0.8% 더 빠름
- 메모리 사용량: husky가 53.1% 더 적은 메모리 사용

심지어 용량 측면에서는 gzip을 사용해 압축하여 `husky`가 압도적으로 적습니다.

직접 만들어서 사용성이 더 좋은 부분이야 있겠지만, 결과적으로는 완패입니다! 🤣

하지만 rust 언어 지식 없이 빠르게 구현할 수 있었다는 값진 경험이 있었습니다.

이를 바탕으로 더 다양한 라이브러리를 만들어 보고 싶습니다 :)

## 2. react-native-svg-preview - vscode 익스텐션

### 문제 상황

회사에서 `React Native` 개발을 하면서 `SVG` 파일을 미리볼 수 있는 익스텐션이 없어서 불편했습니다.

`rusky`를 만들었던 경험으로, "빠르게 만들 수 있지 않을까?" 라는 생각에 진행하였습니다.

### 30분 만에 만든 익스텐션

놀랍게도 30분이면 가능했습니다.

기본적인 기능은 대화로 구현하고, 세부적인 `typescript`코드 일부만 수정해주었습니다.

`rusky`와는 다르게 버전을 꾸준히 관리하고 싶어 0.1.0부터 차근차근 업데이트를 할 예정입니다.

오히려 어려웠던 것은 `vscode`및 `cursor`에 등록하는 것이었습니다.

`vscode extension`으로 등록하기 위해 MS계정 발급 및 `publisher`등록이 필요했고,

`cursor extension`은 자동으로 올라오지 않고, `open-vsx`에 별도로 등록해야했습니다.

안내를 따라 진행하면 되지만, `cursor`에 extension이 얼마 없는 것이 이해가 가는 정도의 번거로움이었습니다... :(

## 3. 결론

`Cursor`와 같은 AI 코딩 도구는 새로운 언어나 프레임워크를 빠르게 학습하고 프로젝트에 적용할 수 있게 해줍니다.

특히 `Rust`처럼 학습 곡선이 높은 언어에서도 AI의 도움으로 실용적인 프로젝트를 완성할 수 있었고,
팀의 개발 효율성을 높이는 도구를 빠르게 만들어낼 수 있었습니다.

앞으로도 AI 도구를 활용해서 재미있는 라이브러리를 개발해볼 생각입니다! 🚀

---

**참고 링크:**

- [rusky GitHub](https://github.com/geonhwiii/rusky)
- [react-native-svg-preview VSCode Marketplace](https://github.com/geonhwiii/react-native-svg-preview)
