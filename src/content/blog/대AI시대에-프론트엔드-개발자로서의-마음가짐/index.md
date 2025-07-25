---
title: 대 AI시대에 프론트엔드 개발자로서의 마음가짐
summary: AI의 빠른 발전 속에서 프론트엔드 개발자로서의 생각을 정리해보아요
date: 07 14 2025
draft: false
tags:
  - AI
---

요새 업무도 바쁘고, 하는 일도 많아서 정신이 없습니다.

하지만 이런 상황에서 생각을 정리해놓아야, 앞으로 더 단단하게 나아갈 수 있습니다..!

최근에 보고 배운 것들과 느낀 생각들을 함께 정리하여,

**AI 시대에 프론트엔드 개발자**로서 가져야 할 **마음가짐**을 적어봅니다.

( ⭐ 개인적인 생각 + 멋진 동료 개발자들의 여러 생각들을 함께 담았습니다 - (feat. 감사합니다!) )

---

## 1. 바이브 코딩?

언제부터였을까요? 기점을 생각해보면 **`claude 4`**의 출시였던 것 같습니다.

단순히 `Cursor Tab`만을 통해 내가 작성하는 코드의 속도를 올려주는 것에서,

이제는 **AI가 먼저 작업**을 하고, **사람이 보조하는(?) 상황**이 되었습니다.

유튜브에는 `"바이브 코딩"`, `"코딩 없이 누구나 만들 수 있다"` 등 자극적인 제목의 유튜브 영상들이 올라오고,

실제로도 **별도의 코딩 지식없이도** 그럴듯한 작업물을 만들 수 있습니다.

특히, 지금의 AI는 프론트엔드, 그 중에서도 **웹에 특화**되어 있습니다. (물론 금방 더 확장되겠죠...?!)

![](https://i.imgur.com/qpNRFip.png)

앞으로 점점 AI 가 발전하면 `프론트엔드 개발자` 의 **직무**는 완전히 대체되어 버리는 걸까요? 🥶

## 2. 프론트엔드 생태계

제가 개발을 시작할 때는 `javascript`가 주를 이루고, `typescript`가 점차 퍼져나가고 있었습니다.

프레임워크로는 `jQuery`, `Augular`, `Vue`, `React` 가 혼재된 시기였습니다.

그리고 요즘엔 `React`의 성능에 답답해하던 개발자들이 `Solid`, `Svelte`로 넘어가고 있습니다.

이들이 가지는 **공통점**은 무엇이고, 해결하고자 하는 것은 무엇일까요?

### 해결하고자 하는 것

개발자들은 복잡한 사용자 인터페이스를 작은 단위로 나누어 관리하고, 재사용할 수 있는 컴포넌트로 구조화함으로써 생산성과 유지보수성을 높이고자 했습니다.

또한 최근 등장하거나 각광받고 있는 프레임워크들은 **성능 향상**과 **개발자 경험(DX)** 개선을 핵심 목표로 삼고 있습니다.

단순히 화면을 구성하는 수준이 아니라, 어떻게 하면 **더 적은 코드**로 **빠르고 효율적인** 사용자 경험을 제공할 수 있을지를 고민합니다.

`React`, `Vue`, `Svelte`, `Solid` 등 다양한 프레임워크가 존재하지만, 사실 이들이 접근 방식은 달라도 **결국 해결하고자 하는 핵심 과제는 다섯 가지로 요약됩니다.**

바로 `state`, `computed`, `effect`, `handler`, `render`입니다.

- **state**: 사용자의 입력이나 앱 내부에서 계속 바뀌는 값
- **computed**: 상태 변화에 따라 계산되는 값
- **effect**: 상태 변화에 따라 발생하는 외부 작업
- **handler**: 사용자 이벤트에 반응하는 함수
- **render**: 위 요소들을 바탕으로 실제 화면에 UI를 그리는 과정

이 다섯 가지 요소는 프론트엔드에서 어떤 프레임워크를 사용하든 반드시 마주치게 되는 개념입니다.

프레임워크들은 결국 이 다섯 가지를 **얼마나 직관적으로, 효율적으로 구성할 수 있게 도와주느냐**에 초점을 맞추고 진화해왔습니다.

### 좋은 프레임워크란

결국 **좋은 프레임워크**란, 이 **다섯 가지 오의**(?)를 **명확히 분리하면서도 자연스럽게 연결**해주는 도구입니다.

이 요소들이 섞이기 시작하면 코드가 복잡해지고, 버그를 만들거나 추적이 어려워집니다.

그래서 프레임워크의 진화는 **이 오의의 흐름을 얼마나 예측 가능하고 단순하게 유지할 수 있느냐**로 평가될 수 있습니다.

## 3. AI가 알려주는 나아갈 방향

최근 프론트엔드 기술의 흐름을 살펴보면, 단순한 트렌드를 넘어서는 **의미 있는 공통점**이 보입니다.

그것은 바로, **AI가 실제로 활용하고 있는 기술들이 우리가 집중해야 할 기술이라는 점**입니다.

예를 들어 `ChatGPT`나 `Claude`에게 개발을 맡겨보면, 아래와 같은 공통된 특징을 쉽게 발견할 수 있습니다.

- **TypeScript 중심의 개발 환경**
- **React 및 이를 활용한 Next.js, Vite 기반의 프로젝트**
- **Tailwind CSS 기반의 shadcn 스타일링**
- **tanstack/query, react-hook-form 등으로 구성된 상태 및 폼 관리**
- **함수형 스타일의 선언적 프로그래밍 방식**

이것은 단순한 우연이 아닙니다.

AI는 수많은 사용자, 다양한 상황, 복잡한 프로젝트에 대응하기 위해

**가장 유용하고 검증된 라이브러리들**을 선택해 사용합니다.

마치 함께 일하는 동료의 기술 스택을 이해하듯,

**AI라는 새로운 동료의 기술 스택을 이해하고 활용하는 것**이 중요합니다.

그래야 함께 효율적으로 협업할 수 있고, 더 나은 결과를 만들 수 있습니다.

---

지금 이 글을 쓰는 시점에서는 이런 생각들이 들지만,

앞으로 더 발전된 AI가 등장하면 우리의 생각도 또 바뀔 수 있습니다.

그럼에도 불구하고 중요한 것은,

**변화 속에서도 어떤 태도를 가져야 할지를 고민하며**,

**똑똑한 동료(AI)와 함께 앞으로 나아가는 것**입니다 :)
