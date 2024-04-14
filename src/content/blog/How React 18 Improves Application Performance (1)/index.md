---
title: '[번역] How React 18 Improves Application Performance (1)'
summary: 'React 18은 어떻게 앱 성능을 향상시킬까? (1)'
date: '02 02 2024'
draft: false
tags:
  - 번역
  - React
  - Performance
---

React 18은 React 애플리케이션을 렌더링하는 방식을 근본적으로 바꾸는 동시성 기능을 도입했습니다. 이 최신 기능들이 애플리케이션의 성능에 어떤 영향을 미치고 개선하는지 살펴보겠습니다.

먼저, 긴 작업의 기본 사항과 그에 따른 성능 측정을 이해하기 위해 한 걸음 뒤로 물러나 보겠습니다.

## 메인 스레드 및 긴 작업

브라우저에서 자바스크립트를 실행하면 자바스크립트 엔진은 단일 스레드 환경에서 코드를 실행하는데, 이를 흔히 `메인 스레드`라고 합니다. `메인 스레드`는 자바스크립트 코드 실행과 함께 클릭 및 키 입력과 같은 사용자 상호작용 관리, 네트워크 이벤트, 타이머 처리, 애니메이션 업데이트, 브라우저 리플로우 및 다시 칠하기 관리 등 다른 작업도 처리합니다.

![](https://i.imgur.com/rG797Cx.png)

한 작업이 처리되는 동안 다른 모든 작업은 기다려야 합니다. 작은 작업은 브라우저에서 원활하게 실행되어 원활한 사용자 경험을 제공할 수 있지만, 긴 작업은 다른 작업이 처리되는 것을 차단할 수 있으므로 문제가 될 수 있습니다.

실행에 50ms 이상 걸리는 모든 작업은 "[긴 작업](https://web.dev/long-tasks-devtools/#what-are-long-tasks)"으로 간주됩니다.

![](https://i.imgur.com/uoj1vfp.png)

이 50ms 벤치마크는 원활한 시각적 경험을 유지하기 위해 디바이스가 16ms(60fps)마다 새 프레임을 생성해야 한다는 사실에 근거합니다. 하지만 디바이스는 사용자 입력에 응답하고 JavaScript를 실행하는 등의 다른 작업도 수행해야 합니다.

50ms 벤치마크는 기기가 프레임을 렌더링하고 다른 작업을 수행하는 데 리소스를 할당할 수 있도록 하며, 원활한 시각적 경험을 유지하면서 다른 작업을 수행할 수 있도록 최대 33.33ms의 추가 시간을 제공합니다. 50ms 벤치마크에 대한 자세한 내용은 RAIL 모델을 다루는 [이 블로그 게시물](https://web.dev/rail/#response-process-events-in-under-50ms) 에서 확인할 수 있습니다.

---

최적의 성능을 유지하려면 긴 작업의 수를 최소화하는 것이 중요합니다. 웹사이트의 성능을 측정하기 위해 긴 작업이 애플리케이션의 성능에 미치는 영향을 측정하는 두 가지 지표가 있습니다: `Total Blocking Time` 및 `Interaction to Next Paint`입니다.

[Total Blocking Time (TBT)](https://vercel.com/docs/concepts/speed-insights#total-blocking-time-tbt) 은 [First Contentful Paint (FCP)](https://web.dev/fcp/) 과 [Time to Interactive (TTI)](https://web.dev/tti/) 사이의 시간을 측정하는 중요한 지표입니다. `TBT`는 작업을 실행하는 데 50ms 이상 걸린 시간의 합계로, 사용자 경험에 큰 영향을 미칠 수 있습니다.

![](https://i.imgur.com/Lm6UVCp.png)

새로운 핵심 웹 바이탈 지표인 [INP(Interaction to Next Paint)](https://web.dev/inp/) 는 사용자가 페이지와 처음 상호작용(예: 버튼 클릭)을 한 후 이 상호작용이 화면에 표시되는 시점, 즉 다음 페인트까지 걸리는 시간을 측정합니다. 이 지표는 이커머스 사이트나 소셜 미디어 플랫폼과 같이 사용자 상호 작용이 많은 페이지에서 특히 중요합니다. 이 지표는 사용자의 현재 방문 기간 동안의 모든 INP 측정값을 합산하여 가장 낮은 점수를 반환하는 방식으로 측정됩니다

![](https://i.imgur.com/QVcG0RN.png)

새로운 React 업데이트가 이러한 측정값을 어떻게 최적화하여 사용자 경험을 개선하는지 이해하려면 먼저 기존 React가 어떻게 작동하는지 이해하는 것이 중요합니다.
