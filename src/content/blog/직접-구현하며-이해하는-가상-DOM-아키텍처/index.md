---
title: "직접 구현하며 이해하는 가상 DOM 아키텍처"
summary: "직접 구현하며 이해하는 Virtual DOM의 원리와 실제 코드 구조"
date: "07 17 2025"
draft: false
tags:
  - Journal
---

직접 `가상 DOM(Virtual DOM)` 시스템을 구현하며 느낀 점과, 실제로 동작하는 구조를 정리해봅니다.

실제 라이브러리(`React`, `Vue` 등)와 100% 동일하진 않지만, 핵심 원리와 `CleanCode`, 선언형 프로그래밍의 본질을 체험할 수 있었습니다. 아래는 그 과정과 깨달음을 정리한 글입니다.

---

## 1. `가상 DOM(Virtual DOM)`이란?

- `가상 DOM`은 실제 `DOM`을 직접 조작하지 않고, 메모리 상의 가벼운 객체 트리(`vNode`)로 UI 상태를 관리하는 방식입니다.
- 변경이 발생하면, 이전 `vNode`와 새로운 `vNode`를 비교(`diff`)하여, 실제 `DOM`에는 최소한의 변경만 반영합니다.
- 이로써 성능 최적화와 선언적 UI 작성이 동시에 가능합니다.

---

## 2. 각 컴포넌트별 핵심 개념 및 코드 예시

### 1) createVNode

JSX 문법을 `가상 DOM 객체(vNode)`로 변환합니다.

```js
// src/lib/createVNode.js
export function createVNode(type, props, ...children) {
  const flatChildren = children.flat(Infinity);
  const filteredChildren = flatChildren.filter(
    (child) =>
      !(
        child === null ||
        child === undefined ||
        child === false ||
        child === true
      ),
  );
  return { type, props, children: filteredChildren };
}
```

- `type`(태그명/컴포넌트), `props`, `children`(자식) 구조로 평탄화하여 반환합니다.
- 선언형 UI의 출발점입니다.

---

### 2) normalizeVNode

다양한 입력을 일관된 `vNode` 구조로 정규화합니다.

```js
// src/lib/normalizeVNode.js
export function normalizeVNode(vNode) {
  if (
    vNode === null ||
    vNode === undefined ||
    vNode === false ||
    vNode === true
  )
    return "";
  if (typeof vNode === "string" || typeof vNode === "number")
    return vNode.toString();
  if (typeof vNode.type === "function") {
    const props = vNode.props || {};
    if (vNode.children) props.children = vNode.children;
    return normalizeVNode(vNode.type(props));
  }
  if (typeof vNode === "object" && vNode !== null && "type" in vNode) {
    let children = Array.isArray(vNode.children)
      ? vNode.children
          .map(normalizeVNode)
          .filter(
            (child) =>
              child !== "" &&
              child !== null &&
              child !== undefined &&
              child !== false &&
              child !== true,
          )
      : [];
    if (!Array.isArray(vNode.children) && vNode.children != null) {
      const normalized = normalizeVNode(vNode.children);
      children = normalized === "" ? [] : [normalized];
    }
    return { ...vNode, children };
  }
  return "";
}
```

- `null`, `undefined`, `true`, `false` 등은 빈 문자열로, 숫자/문자열은 string으로 변환합니다.
- 내부적으로 실행 결과를 재귀적으로 정규화합니다.

---

### 3) createElement

`vNode`를 실제 `DOM 요소`로 변환합니다.

```js
// src/lib/createElement.js
export function createElement(vNode) {
  if (
    vNode === null ||
    vNode === undefined ||
    vNode === false ||
    vNode === true
  )
    return document.createTextNode("");
  if (typeof vNode === "string" || typeof vNode === "number")
    return document.createTextNode(vNode.toString());
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => fragment.appendChild(createElement(child)));
    return fragment;
  }
  if (typeof vNode === "object" && vNode !== null && "type" in vNode) {
    if (typeof vNode.type === "function")
      throw new Error(
        "컴포넌트는 반드시 normalizeVNode로 정규화 후 createElement로 변환해야 합니다.",
      );
    const $el = document.createElement(vNode.type);
    updateAttributes($el, vNode.props);
    (vNode.children || []).forEach((child) =>
      $el.appendChild(createElement(child)),
    );
    return $el;
  }
  return document.createTextNode("");
}
```

- `type`이 문자열이면 `HTMLElement`, 배열이면 `DocumentFragment`, 텍스트면 `TextNode`로 생성합니다.
- `props`, `attribute`, `boolean prop`, `이벤트 핸들러` 등은 상황에 맞게 세밀하게 처리합니다.

---

### 4) renderElement

최초 렌더링과 업데이트(`diff`)를 구분하여 동작합니다.

```js
// src/lib/renderElement.js
export function renderElement(vNode, container) {
  const normalized = normalizeVNode(vNode);
  if (container.firstChild && container._vNode) {
    updateElement(container, normalized, container._vNode, 0);
  } else {
    container.innerHTML = "";
    const $el = createElement(normalized);
    container.appendChild($el);
  }
  container._vNode = normalized;
  setupEventListeners(container);
}
```

- `container._vNode`에 이전 `vNode`를 저장하여, 다음 업데이트 시 비교에 활용합니다.
- 이벤트 위임(`setupEventListeners`)도 한 번만 등록합니다.

---

### 5) updateElement

기존 `DOM`과 새로운 `vNode`를 비교(`diff`)하여 최소 변경만 반영합니다.

```js
// src/lib/updateElement.js
export function updateElement(parentElement, newVNode, oldVNode, index = 0) {
  const childNodes = parentElement.childNodes;
  const $el = childNodes[index];
  if (!oldVNode && newVNode) {
    parentElement.appendChild(createElement(newVNode));
    return;
  }
  if (oldVNode && !newVNode) {
    if ($el) parentElement.removeChild($el);
    return;
  }
  if (
    typeof newVNode !== typeof oldVNode ||
    (typeof newVNode === "string" && newVNode !== oldVNode) ||
    (newVNode && oldVNode && newVNode.type !== oldVNode.type)
  ) {
    const newEl = createElement(newVNode);
    if ($el) parentElement.replaceChild(newEl, $el);
    else parentElement.appendChild(newEl);
    return;
  }
  if (typeof newVNode === "string" || typeof newVNode === "number") {
    if ($el && $el.nodeType === Node.TEXT_NODE) {
      if ($el.textContent !== newVNode.toString()) {
        $el.textContent = newVNode.toString();
      }
    }
    return;
  }
  if (newVNode && typeof newVNode === "object") {
    updateAttributes($el, newVNode.props, oldVNode.props);
    const newChildren = newVNode.children || [];
    const oldChildren = oldVNode.children || [];
    const maxLength = Math.max(newChildren.length, oldChildren.length);
    for (let i = 0; i < maxLength; i++) {
      updateElement($el, newChildren[i], oldChildren[i], i);
    }
    if (oldChildren.length > newChildren.length) {
      for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
        const childToRemove = $el.childNodes[i];
        if (childToRemove) {
          $el.removeChild(childToRemove);
        }
      }
    }
  }
}
```

- `type`, `props`, `attribute`, `boolean prop`, `children` 등 다양한 변경 상황을 최소한의 `DOM` 조작으로 처리합니다.
- 초과하는 자식은 역순으로 제거하여 `DOM` 인덱스 오류를 방지합니다.

---

### 6) eventManager

이벤트 위임 및 효율적 이벤트 관리를 담당합니다.

```js
// src/lib/eventManager.js
const eventStore = new WeakMap();

export function addEvent(element, eventType, handler) {
  if (!eventStore.has(element)) {
    eventStore.set(element, new Map());
  }
  const typeMap = eventStore.get(element);
  if (!typeMap.has(eventType)) {
    typeMap.set(eventType, new Set());
  }
  typeMap.get(eventType).add(handler);
}

export function removeEvent(element, eventType, handler) {
  const typeMap = eventStore.get(element);
  if (!typeMap) return;
  const handlers = typeMap.get(eventType);
  if (!handlers) return;
  handlers.delete(handler);
  if (handlers.size === 0) {
    typeMap.delete(eventType);
  }
  if (typeMap.size === 0) {
    eventStore.delete(element);
  }
}

export function setupEventListeners(root) {
  if (root.__eventDelegationSetup) return;
  root.__eventDelegationSetup = true;
  const eventTypes = [
    "click",
    "input",
    "change",
    "focus",
    "blur",
    "keydown",
    "keyup",
    "mouseover",
    "mouseout",
  ];
  eventTypes.forEach((eventType) => {
    root.addEventListener(
      eventType,
      (event) => {
        let target = event.target;
        while (target && target !== root) {
          const typeMap = eventStore.get(target);
          if (typeMap && typeMap.has(eventType)) {
            typeMap.get(eventType).forEach((handler) => {
              handler.call(target, event);
            });
          }
          if (event.cancelBubble) break;
          target = target.parentElement;
        }
      },
      false,
    );
  });
}
```

- `addEvent`, `removeEvent`, `setupEventListeners`로 구성되어 있습니다.
- 이벤트 위임을 `버블 단계`에서 처리하며, `stopPropagation`도 지원합니다.
- 동적으로 추가/제거되는 요소에도 일관된 이벤트 처리가 가능합니다.

---

## 3. 직접 구현하며 느낀 점

- "불변성"과 "최소 변경(diff)"의 원리가 실제로 얼마나 강력한지, 직접 구현하며 깨달았습니다.
- `boolean prop`, 이벤트 위임 등 세부 구현에서 실제 라이브러리와의 차이와 이유를 이해할 수 있었습니다.

---
