---
title: 'Javascript heap out of memory & V8 메모리 구조'
summary: 'Javascript heap out of memory & V8 메모리 구조'
date: '06 23 2024'
draft: false
tags:
  - Javascript
  - Memory
  - GC
---

## Heap Out Of Memory?

요즘 들어 회사에서 Next 프로젝트를 배포하다보면, 빌드할 때 아래와 같은 오류가 발생할 때가 있습니다.

`FATAL ERROR: Ineffective ... Javascript heap out of memory`

구글링을 해보면 메모리 누수 문제거나, 노드의 메모리 부족 문제로 추측하며

아래와 같이 해결방법을 제시합니다.

```json
// package.json
"scripts": {
	...
	"build": "NODE_OPTIONS=\"--max-old-space-size=4096\" next build",
	...
}
```

놀랍게도 자연스럽게 빌드가 됩니다.

그렇다면, 여기서 `--max-old-space-size=4096`는 어떤 동작이길래 메모리 부족 현상이 해결될까요?

---

## V8 엔진 메모리 구조

먼저, `V8 엔진`의 메모리 구조에 대해서 간략하게 알아볼 필요가 있습니다.

자바스크립트는 인터프리터 언어기 때문에 코드를 해석하고 실행하는 엔진이 필요합니다.

`V8 엔진`은 이 자바스크립트를 해석하고 컴파일하여 기계어로 변환합니다.

![](https://i.imgur.com/UpLgi07.png)
(\* 출처 : https://deepu.tech/memory-management-in-v8/)

### 1. Heap Memory

V8 엔진의 메모리 구조에서 가장 큰 부분을 차지하며, 모든 객체와 함수가 저장되는 공간입니다.

힙 메모리 영역의 Young, Old Space 에서만 션(GC)가 발생합니다.

- Young Space: `Young Generation`이라고도 하며, 새로 생성된 객체가 저장되는 영역입니다. 객체가 자주 생성되고 삭제되는 애플리케이션의 특성을 반영하여, 빠르고 효율적인 가비지 컬렉션이 가능하도록 설계되었습니다. `New Space`의 크기는 `--min_semi_space_size`(초기값)와 `--max_semi_space_size`(최대값) V8 엔진의 플래그 값을 사용해 조정할 수 있습니다.

- Old Space: `Old Generation`이라고도 하며, `Young Space`에서 살아남은 오래된 객체가 저장되는 영역입니다. 이 영역의 객체들은 비교적 수명이 길며, `Young Space`보다 덜 빈번하게 가비지 컬렉션이 수행됩니다. `Old Space`의 크기는 `--initial_old_space_size`(초기값)와 `max_old_space_size`(최대값)을 사용해 조정할 수 있습니다.

### 2. Stack

스택은 메서드와 함수 프레임, 원시 값, 객체 포인터를 포함한 정적 데이터가 저장되는 곳입니다.

스택은 각 함수 호출 시마다 새로운 프레임이 추가되며, 함수가 종료되면 해당 프레임이 제거됩니다.

메모리 할당과 해제가 매우 빠르며, 주로 짧은 수명의 데이터가 저장됩니다.

### 3. 가비지 컬렉션 (GC)

프로그램이 사용가능한 것보다 더 많은 메모리를 힙 메모리에 할당하면 메모리 부족 오류가 발생합니다.

V8 엔진은 가비지 컬렉션을 사용해 힙 메모리를 관리합니다. 가비지 컬렉션은 참조가 없는 객체들이 사용하는 메모리를 비워서 새로운 객체를 생성하기 위한 공간을 만드는 역할을 합니다.

`Young Space`에서는 주로 `Scavenge` 방식이 사용됩니다. 이 방식은 `Young Space`를 두 개의 반으로 나누어 하나는 활성 영역, 다른 하나는 비활성 영역으로 사용합니다. 가비지 컬렉션 시 활성 영역의 객체를 비활성 영역으로 복사하며, 이 과정에서 살아있는 객체만 복사되고 나머지는 해제됩니다.

`Old Space`에서는 앞서 설명한 `Mark and Sweep` 방식이 사용됩니다. 이 방식은 더 큰 메모리 영역을 다루며, 상대적으로 빈번하게 가비지 컬렉션이 발생하지 않습니다.

### 4. Mark And Sweep

앞서, script에서 `max_old_space_size=4096`과 같이 옵션을 주었었는데,

이는 힙 메모리의 `Old Space`의 크기를 조정하는 값이라는 것을 알게 되었습니다.

이제 `Old Space`의 가비지 컬렉션 방식인 `Mark and Sweep`방식은 뭘까요?

간단히 말해서, 사용하는 것은 `마크(Mark)`하고, 사용하지 않는 것은 `치워(Sweep)`버리는 것입니다.

원시타입이 아닌 객체(Object, Array, Function)는 힙 메모리에 할당을 받습니다.

가비지 컬렉터(GC)는 반복적으로 루트로부터 확인하며 사용하지 않는 객체를 `Sweep`하여 메모리를 확보합니다.

### 5. --max-old-space-size

가비지 컬렉션이 동작하면서 `Young Space` 를 살아남은 `Old Space`의 객체들이 많아지면

앞서 발생한 `heap out of memory` 오류가 발생합니다.

`--max-old-space-size`로 `Old Space` 사이즈를 키워서 힙메모리 영역을 키워서 해결한 것이므로,

단기적으로는 해결할 수 있는 방식이지만, 장기적으로는 메모리 누수가 있는 부분을 확인하고,

코드를 개선해 나가는 것이 중요합니다.

---

> 추가로 보면 좋은 문서 및 영상
>
> - https://ui.toast.com/weekly-pick/ko_20200228
> - https://fe-developers.kakaoent.com/2022/220519-garbage-collection/
> - https://www.youtube.com/watch?v=P3C7fzMqIYg&t=1020s
