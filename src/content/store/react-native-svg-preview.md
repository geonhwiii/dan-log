---
title: "React Native Svg Preview"
description: "React Native TSX 파일에서 SVG 컴포넌트를 미리보기할 수 있는 VSCode 확장 프로그램"
image: "https://gunwww.gallerycdn.vsassets.io/extensions/gunwww/react-native-svg-preview/0.1.1/1750506651022/Microsoft.VisualStudio.Services.Icons.Default"
github: "https://github.com/geonhwiii/react-native-svg-preview"
link: "https://open-vsx.org/extension/geonhwiii/react-native-svg-preview"
tech: ["vscode", "react native"]
date: 2025-06-21
---

# React Native SVG Preview

React Native TSX 파일에서 SVG 컴포넌트를 미리보기할 수 있는 VSCode 확장 프로그램입니다.

## 기능

- TSX 파일에서 React Native SVG 컴포넌트 자동 감지
- 우클릭 컨텍스트 메뉴를 통한 SVG 미리보기
- 실시간 SVG 렌더링 및 속성 표시
- VSCode 테마와 일치하는 UI

## 지원하는 SVG 컴포넌트

- `Svg` - 기본 SVG 컨테이너
- `Circle` - 원형
- `Rect` - 사각형
- `Path` - 경로
- `Ellipse` - 타원
- `Line` - 직선
- `Polygon` - 다각형
- `Polyline` - 폴리라인
- `Text` - 텍스트
- `G` - 그룹
- 기타 React Native SVG 컴포넌트들

## 사용법

1. React Native 프로젝트에서 `.tsx` 파일을 엽니다
2. 파일 탐색기에서 파일을 우클릭하거나 편집기에서 우클릭합니다
3. "Preview SVG" 메뉴를 선택합니다
4. 새 패널에서 SVG 컴포넌트들의 미리보기를 확인합니다

## 설치

1. 이 저장소를 클론합니다
2. `npm install`을 실행하여 의존성을 설치합니다
3. `npm run compile`을 실행하여 TypeScript를 컴파일합니다
4. F5를 눌러 확장 프로그램을 디버그 모드로 실행합니다

## 개발

```bash
# 의존성 설치
npm install

# TypeScript 컴파일
npm run compile

# Watch 모드로 컴파일
npm run watch
```

## 요구사항

- VSCode 1.74.0 이상
- React Native SVG 라이브러리를 사용하는 프로젝트

## 라이선스

MIT 