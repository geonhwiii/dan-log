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

### ✨ 주요 기능

- **🎨 미니 SVG 프리뷰**: Explorer 패널 하단에 작은 SVG 미리보기 박스
- **🔄 실시간 업데이트**: 코드 편집 시 자동으로 미리보기 업데이트
- **📱 전체 미리보기**: 새 탭에서 상세한 SVG 미리보기
- **🌍 다국어 지원**: 한국어/영어 자동 지원
- **🎭 테마 연동**: VSCode 테마 색상과 완벽 연동

### 🎯 지원하는 SVG 컴포넌트

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

### 📋 사용법

#### 미니 프리뷰 (새로운 기능!)
1. React Native 프로젝트에서 `.tsx` 파일을 엽니다
2. **Explorer 패널 하단**에 "SVG Preview" 박스가 자동으로 나타납니다
3. SVG 컴포넌트가 있는 파일을 편집하면 실시간으로 업데이트됩니다

#### 전체 미리보기
1. 파일 탐색기에서 파일을 우클릭하거나 편집기에서 우클릭합니다
2. "Preview SVG" 메뉴를 선택합니다
3. 새 패널에서 SVG 컴포넌트들의 상세 미리보기를 확인합니다

### 🚀 설치 및 개발

```bash
# 의존성 설치
npm install

# TypeScript 컴파일
npm run compile

# Watch 모드로 컴파일
npm run watch

# 패키징
npm run package
```

### 📋 요구사항

- VSCode 1.74.0 이상
- React Native SVG 라이브러리를 사용하는 프로젝트
