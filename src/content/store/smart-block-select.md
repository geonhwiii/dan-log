---
title: "Smart Block Select"
description: "블록 안에 커서를 위치시킨 후 [Shift+Alt+S]를 누르세요"
image: "https://i.imgur.com/LZO9LjD.png"
github: "https://github.com/geonhwiii/smart-block-select"
tech: ["vscode"]
date: 2026-03-18
---

# Smart Block Select

단 하나의 단축키로 커서가 위치한 가장 가까운 논리 블록 — 함수, 화살표 함수, if/else, 반복문, JSX 요소 — 을 즉시 선택합니다.

## 사용법

블록 안에 커서를 위치시킨 후 아래 단축키를 누르세요:

| 플랫폼          | 단축키        |
| --------------- | ------------- |
| Windows / Linux | `Shift+Alt+S` |
| macOS           | `Shift+Alt+S` |

커서를 감싸는 전체 블록이 선택됩니다. 다시 누르면 한 단계 바깥쪽 블록으로 확장됩니다.

## 지원 블록 유형

- `function` 선언 및 표현식
- 화살표 함수 (`const fn = () => {}` — 전체 `const` 구문 선택)
- `if` / `else if` / `else` 체인
- `for`, `for...in`, `for...of` 반복문
- `while` 및 `do...while` 반복문
- JSX 요소, 자기 닫힘 요소, 프래그먼트 (`<>...</>`)
- `return` 구문

## 지원 언어

- TypeScript (`.ts`)
- TypeScript + JSX (`.tsx`)
- JavaScript (`.js`)
- JavaScript + JSX (`.jsx`)

## 동작 원리

Smart Block Select는 TypeScript 컴파일러 API를 사용해 파일을 AST(추상 구문 트리)로 파싱하고, 커서를 포함하는 가장 안쪽의 지원 블록 노드를 찾습니다. 언어 서버가 필요 없으며 어떤 파일에서도 즉시 동작합니다.

## 명령어

| 명령어                             | 설명                    |
| ---------------------------------- | ----------------------- |
| `Smart Block Select: Select Block` | 커서가 위치한 블록 선택 |

## 확장 설정

이 확장은 별도의 설정 항목이 없습니다.

## 라이선스

MIT
