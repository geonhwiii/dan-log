---
title: "프론트엔드 아키텍처: FSD로 관리하는 React 프로젝트"
summary: "Feature-Sliced Design을 활용한 확장 가능한 프론트엔드 아키텍처 설계"
date: "08 23 2025"
draft: false
tags:
  - react
---

최근 프론트엔드 개발을 하다보면, 많은 개발자들이 공통적으로 겪는 고민이 있습니다.

프로젝트가 커질수록 "어디에 컴포넌트를 만들어야 할까?", "폴더 구조를 어떻게 잡아야 할까?",

"컴포넌트 간 의존성은 어떻게 관리해야 할까?" 같은 질문들이 늘어납니다.

이런 공통적인 고민들을 해결하는 방법론 중 하나인 **Feature-Sliced Design(FSD)** 아키텍처에 대해 정리해봤습니다.

## 1. 왜 아키텍처가 필요할까?

프론트엔드 프로젝트에서 자주 마주치는 문제들은 다음과 같습니다:

- 컴포넌트 간 순환 의존성 발생
- 재사용 가능한 컴포넌트와 페이지 전용 컴포넌트의 구분 어려움
- 서버 상태 관리 로직의 중복과 분산
- 새로운 기능 추가 시 어디에 코드를 작성해야 할지 애매함
- 프로젝트가 커질수록 폴더 구조가 복잡해짐

FSD는 이런 문제들을 **레이어 기반 아키텍처**와 **명확한 의존성 규칙**으로 해결하는 방법론입니다.

## 2. 레이어 구조와 책임

FSD의 핵심은 각 레이어가 명확한 책임을 가지는 것입니다.

여기서 modules는 widgets로 대체할 수 있습니다.

```
shared → entities → features → modules → pages → app
```

### shared: 디자인 시스템과 유틸리티

도메인 지식이 전혀 없는 순수한 UI 컴포넌트와 유틸 함수들입니다.

```tsx
// shared/ui/Button.tsx
export const Button = ({ children, ...props }) => {
  return (
    <button className="btn" {...props}>
      {children}
    </button>
  );
};

// shared/lib/highlightText.tsx
export const highlightText = (text: string, query: string) => {
  // 하이라이트 로직
};
```

### entities: 도메인 모델의 단일 진실 공급원

비즈니스 도메인의 핵심 타입과 모델 유틸을 정의합니다.

```tsx
// entities/Post/model/types.ts
export interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
}

// entities/Post/model/utils.ts
export const addCommentsOfPost = (post: Post, comments: Comment[]) => {
  return { ...post, comments: [...post.comments, ...comments] };
};
```

### features: 사용자 행동 단위

실제 사용자가 수행하는 액션들을 담당합니다.

```tsx
// features/post/ui/PostButtonDelete.tsx
export const PostButtonDelete = ({ postId }: { postId: number }) => {
  const deleteMutation = useMutationDeletePost();

  return <Button onClick={() => deleteMutation.mutate(postId)}>삭제</Button>;
};
```

### modules: 복합 UI 단위 (커스텀 레이어)

여러 feature와 entity를 조합해서 재사용 가능한 기능 블록을 만듭니다.

저희 프로젝트에서는 표준 FSD의 `widgets` 대신 `modules`라는 이름을 사용했어요.

```tsx
// modules/PostsTable/ui/PostsTable.tsx
export const PostsTable = () => {
  return (
    <div>
      <PostsTableHeader />
      <PostsTableBody />
      <PostsPagination />
    </div>
  );
};
```

### pages: 라우트 단위 화면

페이지는 단순히 모듈들을 조립하는 역할만 합니다.

```tsx
// pages/PostsManager/PostsManager.tsx
export const PostsManager = () => {
  return (
    <Layout>
      <PostsTable />
      <PostDialog />
    </Layout>
  );
};
```

### app: 전역 초기화와 구성

라우터, Provider, 전역 설정 등을 관리합니다.

```tsx
// app/config/tanstack.query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
});
```

## 3. 의존성 규칙: 핵심 중의 핵심

FSD의 가장 중요한 규칙은 **상위 레이어가 하위 레이어를 참조하는 것은 금지**라는 점입니다.

```tsx
// ❌ 잘못된 예: entities에서 features 참조
// entities/Post/model/utils.ts
import { useQueryPosts } from "@/features/posts/api/useQueryPosts"; // 금지!

// ✅ 올바른 예: features에서 entities 참조
// features/posts/api/useQueryPosts.ts
import { Post } from "@/entities/Post"; // 허용
```

이 규칙 덕분에:

- 순환 의존성이 원천 차단됩니다
- 하위 레이어의 변경이 상위 레이어에 영향을 주지 않습니다
- 테스트와 재사용이 쉬워집니다

## 4. 서버 상태 관리 전략

모든 서버 상태는 **TanStack Query**로 통일했습니다.

```tsx
// features/posts/api/useQueryPosts.ts
export const useQueryPosts = (params: PostsParams) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => fetchPosts(params),
  });
};

// features/posts/api/useMutationCreatePost.ts
export const useMutationCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
```

**중요한 원칙들:**

- `fetch`나 `useState`를 직접 사용하지 않습니다
- 쿼리 키는 도메인 기준으로 명시적으로 관리합니다
- 낙관적 업데이트는 entities의 모델 유틸을 사용합니다

## 5. FSD 아키텍처의 장점과 고려사항

### 예상되는 장점들

**명확한 코드 위치**: "이 기능을 어디에 작성해야 할까?" 하는 고민을 줄일 수 있습니다.

**안전한 리팩토링**: 의존성 규칙 덕분에 하위 레이어 변경 시 영향 범위를 쉽게 파악할 수 있어요.

**재사용성 향상**: modules 레이어 덕분에 페이지에 종속되지 않는 기능 블록을 만들 수 있습니다.

**팀 협업 개선**: 일관된 구조로 인해 코드 리뷰와 협업이 수월해질 것으로 예상됩니다.

### 고려해야 할 점들

**초기 학습 비용**: FSD 개념을 익히고 팀원들과 공유하는데 시간이 필요할 것 같습니다.

**과도한 추상화**: 작은 프로젝트에서는 오히려 복잡도가 증가할 수 있어요.

**레이어 구분의 애매함**: "이게 feature인지 module인지" 구분하는 기준을 명확히 해야 합니다.

## 6. 네이밍과 구조 규칙

일관성 있는 네이밍이 정말 중요했습니다.

```
features/
  post/
    api/
      useQueryPost.ts
      useMutationCreatePost.ts
    ui/
      PostButtonDelete.tsx
      PostFormCreate.tsx
    model/
      usePostForm.ts

modules/
  PostDialog/
    ui/
      PostDialogAdd.tsx
      PostDialogEdit.tsx
```

**경로는 반드시 절대경로**를 사용합니다:

```tsx
// ✅ 올바른 import
import { Post } from "@/entities/Post";
import { PostButtonDelete } from "@/features/post/ui/PostButtonDelete";

// ❌ 상대경로 사용 금지
import { Post } from "../../../entities/Post";
```

## 7. 새 기능 추가 절차

댓글 기능을 추가한다면 이런 순서로 진행합니다:

1. `entities/Comment`에 타입과 모델 유틸 정의
2. `features/comment`에 쿼리/뮤테이션 훅과 UI 컴포넌트 추가
3. 필요하다면 `modules/CommentList` 같은 복합 컴포넌트 생성
4. `pages`에서 필요한 모듈들을 조립

이 순서를 따르면 자연스럽게 의존성 규칙을 지키게 됩니다.

---

완벽한 해결책은 아니겠지만, 체계적인 구조와 명확한 규칙을 제시한다는 점에서

프로젝트 규모가 커질수록 고민되는 부분들을 어느 정도 해결해줄 수 있을 것 같습니다.
