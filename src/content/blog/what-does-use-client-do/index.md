---
title: '[번역] What Does "use client" Do?'
summary: 'An article about the explanation of "use client".'
date: '04 27 2025'
draft: false
image: 'https://overreacted.io/what-does-use-client-do/opengraph-image'
tags:
  - 번역
  - React
---

![](https://overreacted.io/what-does-use-client-do/opengraph-image)

> 원문 : https://overreacted.io/what-does-use-client-do/

React Server Components는 (악명 높게도) 별도의 API 표면을 가지고 있지 않습니다. 이는 사실상 두 가지 지시어에서 비롯된 새로운 프로그래밍 패러다임이라고 할 수 있습니다:

- `'use client'`
- `'use server'`

저는 이 지시어들의 발명이 `구조적 프로그래밍(if/while)`, `일급 함수(first-class functions)`, `async/await` 같은 혁신과 같은 반열에 올라야 한다고 감히 주장하고 싶습니다. 즉, 이 개념들은 React를 넘어 앞으로 `‘상식’`처럼 자리잡을 것이라 기대합니다.

서버는 클라이언트로 코드를 전송해야 합니다 (`<script>`를 보내는 방식으로). 클라이언트는 다시 서버로 통신해야 합니다 (`fetch`를 수행하는 방식으로). `'use client'`와 `'use server'` 지시어는 이 과정을 추상화하여, 코드베이스의 다른 컴퓨터에 있는 코드 조각으로 제어를 넘기는 작업을 일급 객체처럼, 타입이 보장되고, 정적 분석이 가능한 방식으로 처리할 수 있게 해줍니다.

- `'use client'`는 타입이 지정된 `<script>`입니다.
- `'use server'`는 타입이 지정된 `fetch()`입니다.


이 두 가지 지시어는 모듈 시스템 안에서 클라이언트와 서버 간 경계를 표현할 수 있게 해줍니다.
이를 통해 클라이언트/서버 애플리케이션을 두 대의 머신에 걸쳐 하나의 프로그램처럼 모델링할 수 있으며, 네트워크와 직렬화(serialization) 간극이라는 현실을 간과하지 않게 해줍니다.
그리고 이로 인해 [네트워크를 넘나드는 매끄러운 컴포지션](https://overreacted.io/impossible-components/)이 가능해집니다.

비록 여러분이 `React Server Components`를 실제로 사용할 계획이 없더라도, 이 지시어들과 그 동작 방식에 대해서는 꼭 배워야 한다고 생각합니다.
이 지시어들은 사실 React에 대한 것이 아닙니다.

이것들은 모듈 시스템에 관한 것입니다.

---

## 'use server'

먼저 `'use server'`에 대해 알아보겠습니다.

몇 가지 API 경로가 있는 백엔드 서버를 작성한다고 가정합니다.

```ts
async function likePost(postId) {
  const userId = getCurrentUser();
  await db.likes.create({ postId, userId });
  const count = await db.likes.count({ where: { postId } });
  return { likes: count };
}
 
async function unlikePost(postId) {
  const userId = getCurrentUser();
  await db.likes.destroy({ where: { postId, userId } });
  const count = await db.likes.count({ where: { postId } });
  return { likes: count };
}
 
// 좋아요
app.post('/api/like', async (req, res) => {
  const { postId } = req.body;
  const json = await likePost(postId);
  res.json(json);
});

// 좋아요 해제
app.post('/api/unlike', async (req, res) => {
  const { postId } = req.body;
  const json = await unlikePost(postId);
  res.json(json);
});
```

그런 다음 이러한 API 경로를 호출하는 프론트엔드 코드가 있습니다.

```ts
document.getElementById('likeButton').onclick = async function() {
  const postId = this.dataset.postId;
  if (this.classList.contains('liked')) {
    // 좋아요 해제 호출
    const response = await fetch('/api/unlike', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    });
    const { likes } = await response.json();
    this.classList.remove('liked');
    this.textContent = likes + ' Likes';
  } else {
    // 좋아요 호출
    const response = await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, userId })
    });
    const { likes } = await response.json();
    this.classList.add('liked');
    this.textContent = likes + ' Likes';
  }
});
```

(단순화를 위해, 이 예제는 경쟁 상태(race condition)나 오류 처리를 다루지 않습니다.)

이 코드는 겉보기에는 깔끔하고 괜찮아 보이지만, 사실 [`"문자열 기반(stringly-typed)"`](https://www.hanselman.com/blog/stringly-typed-vs-strongly-typed)입니다.
우리가 하려는 것은 다른 컴퓨터에 있는 함수를 호출하는 일입니다.
하지만 백엔드와 프론트엔드는 서로 다른 별개의 프로그램이기 때문에, 이를 표현할 수 있는 방법은 결국 `fetch` 같은 호출뿐입니다.

이제, 프론트엔드와 백엔드를 “두 대의 머신에 걸쳐 분리된 하나의 프로그램”으로 생각한다고 가정해봅시다.
이럴 때, 코드의 한 부분이 다른 부분을 호출하고 싶다는 사실을 어떻게 가장 직접적으로 표현할 수 있을까요?

백엔드와 프론트엔드는 “당연히 이렇게 만들어야 한다”는 기존의 고정관념을 잠시 내려놓고 보면,
사실 우리가 정말 하고 싶은 말은, 프론트엔드 코드에서 `likePost`와 `unlikePost`를 호출하고 싶다는 것뿐입니다.

```ts
import { likePost, unlikePost } from './backend'; // 이것은 동작하지 않아요 :(
 
document.getElementById('likeButton').onclick = async function() {
  const postId = this.dataset.postId;
  if (this.classList.contains('liked')) {
    const { likes } = await unlikePost(postId);
    this.classList.remove('liked');
    this.textContent = likes + ' Likes';
  } else {
    const { likes } = await likePost(postId);
    this.classList.add('liked');
    this.textContent = likes + ' Likes';
  }
};
```

물론 문제는, `likePost`와 `unlikePost`가 실제로는 프론트엔드에서 실행될 수 없다는 점입니다.
이 함수들의 구현을 프론트엔드로 그대로 가져와 사용할 수는 없습니다.
프론트엔드에서 백엔드를 직접 임포트하는 것은, 정의상 의미가 없는 일입니다.

하지만 만약 `likePost`와 `unlikePost` 함수를 모듈 수준에서 서버로부터 내보낸(exported) 함수라고 표시(annotate)할 수 있는 방법이 있다고 가정해봅시다.

```ts
'use server'; // 모든 export를 프론트엔드에서 “호출 가능한(callable)” 것으로 표시하기
 
export async function likePost(postId) {
  const userId = getCurrentUser();
  await db.likes.create({ postId, userId });
  const count = await db.likes.count({ where: { postId } });
  return { likes: count };
}
 
export async function unlikePost(postId) {
  const userId = getCurrentUser();
  await db.likes.destroy({ where: { postId, userId } });
  const count = await db.likes.count({ where: { postId } });
  return { likes: count };
}
```

이렇게 하면, HTTP 엔드포인트를 백그라운드에서 자동으로 설정할 수 있을 것입니다.
그리고 네트워크를 통해 함수를 내보내기 위한 옵트인(opt-in) 문법이 생겼으니, 프론트엔드 코드에서 이러한 함수들을 임포트하는 행위에 새로운 의미를 부여할 수 있습니다 —
프론트엔드에서 임포트하면, 실제로는 해당 HTTP 호출을 수행하는 비동기 함수(async function)를 가져오는 것처럼 동작하게 만들 수 있습니다.

```ts
import { likePost, unlikePost } from './backend';
 
document.getElementById('likeButton').onclick = async function() {
  const postId = this.dataset.postId;
  if (this.classList.contains('liked')) {
    const { likes } = await unlikePost(postId); // HTTP call
    this.classList.remove('liked');
    this.textContent = likes + ' Likes';
  } else {
    const { likes } = await likePost(postId); // HTTP call
    this.classList.add('liked');
    this.textContent = likes + ' Likes';
  }
};
```

이것이 바로 `'use server'` 지시어가 하는 일입니다.

사실 이것은 새로운 아이디어가 아닙니다 — [RPC(Remote Procedure Call)](https://en.wikipedia.org/wiki/Remote_procedure_call)는 수십 년 전부터 존재해왔습니다.
이것은 단지 클라이언트-서버 애플리케이션을 위한, 특정한 형태의 RPC일 뿐입니다.
서버 코드에서는 일부 함수를 `“server export”('use server')`로 지정할 수 있고,
프론트엔드 코드에서 `likePost`를 임포트하면 일반적인 `import`처럼 보이지만, 실제로는 HTTP 호출을 수행하는 `비동기 함수(async function)`를 가져오게 됩니다.

다음 파일 쌍을 다시 살펴보세요.

```ts
'use server'; // 모든 export를 프론트엔드에서 “호출 가능한(callable)” 것으로 표시하기
 
export async function likePost(postId) {
  const userId = getCurrentUser();
  await db.likes.create({ postId, userId });
  const count = await db.likes.count({ where: { postId } });
  return { likes: count };
}
 
export async function unlikePost(postId) {
  const userId = getCurrentUser();
  await db.likes.destroy({ where: { postId, userId } });
  const count = await db.likes.count({ where: { postId } });
  return { likes: count };
}
```
```ts
import { likePost, unlikePost } from './backend';
 
document.getElementById('likeButton').onclick = async function() {
  const postId = this.dataset.postId;
  if (this.classList.contains('liked')) {
    const { likes } = await unlikePost(postId); // HTTP call
    this.classList.remove('liked');
    this.textContent = likes + ' Likes';
  } else {
    const { likes } = await likePost(postId); // HTTP call
    this.classList.add('liked');
    this.textContent = likes + ' Likes';
  }
};
```

아마 반론이 있을 수도 있습니다 —
네, 같은 코드베이스 안에 있지 않으면 API의 여러 소비자를 허용할 수 없습니다.
네, 버전 관리와 배포에 대해 신경 써야 합니다.
네, 직접 `fetch`를 작성하는 것보다 암묵적입니다.

하지만 백엔드와 프론트엔드를 “두 대의 컴퓨터에 걸쳐 분리된 하나의 프로그램”으로 바라보기 시작하면, 이제 이 관점을 쉽게 잊을 수 없습니다.
두 모듈 간에는 직접적이고 본질적인 연결이 생깁니다.
여기에 타입을 추가하여 두 모듈 간의 계약을 좁힐 수 있고(그리고 타입이 직렬화 가능한지 강제할 수 있습니다),
`“모든 참조 찾기(Find All References)”` 기능을 통해 서버에서 내보낸 함수가 클라이언트 어디에서 사용되는지 추적할 수 있습니다.
사용되지 않는 엔드포인트는 자동으로 감지되거나(dead code analysis를 통해) 제거될 수 있습니다.

가장 중요한 점은, 이제 양쪽(프론트엔드와 백엔드)을 모두 완전히 캡슐화하는 자급자족형 추상화를 만들 수 있다는 것입니다.
즉, 하나의 “프론트엔드” 코드가 그에 상응하는 “백엔드” 조각에 직접 연결됩니다.
API 라우트가 무분별하게 늘어나는 문제를 걱정할 필요가 없습니다 —
서버/클라이언트 분리는 여러분이 만든 추상화만큼 모듈화될 수 있습니다.
글로벌 네이밍 스킴(global naming scheme)도 필요 없습니다; 필요한 곳에서 export와 import를 사용해 코드를 조직하면 됩니다.

`'use server'` 지시어는 서버와 클라이언트 간의 연결을 `문법적(syntactic)`으로 만들어줍니다.
이제 그것은 단순한 `관례(convention)`가 아니라, 모듈 시스템의 일부가 된 것입니다.

이것은 서버로 가는 문을 열어줍니다.

---

## 'use client'

이제 백엔드에서 프론트엔드 코드로 정보를 전달하고 싶다고 가정해봅시다.
예를 들어, `<script>`를 이용해 일부 HTML을 렌더링할 수도 있겠죠:

```tsx
app.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const userId = getCurrentUser();
  const likeCount = await db.likes.count({ where: { postId } });
  const isLiked = await db.likes.count({ where: { postId, userId } }) > 0;
  const html = `<html>
    <body>
      <button
        id="likeButton"
        className="${isLiked ? 'liked' : ''}"
        data-postid="${Number(postId)}">
        ${likeCount} Likes
      </button>
      <script src="./frontend.js></script>
    </body>
  </html>`;
  res.text(html);
});
```

브라우저는 해당 `<script>`를 로드하고, 이를 통해 인터랙티브 로직이 연결될 것입니다.

```ts
document.getElementById('likeButton').onclick = async function() {
  const postId = this.dataset.postId;
  if (this.classList.contains('liked')) {
    // ...
  } else {
    // ...
  }
};
```

이 방식도 동작은 하지만, 몇 가지 아쉬운 점이 남습니다.

우선, 프론트엔드 로직이 `"전역"`으로 동작하는 것은 바람직하지 않을 수 있습니다 —
이상적으로는, 각각의 데이터를 받아서 자체적인 로컬 상태를 유지하는 여러 개의 좋아요 버튼을 렌더링할 수 있어야 합니다.
또한 HTML 템플릿과 인터랙티브한 JavaScript 이벤트 핸들러 사이의 표시 로직(display logic)을 통합할 수 있다면 훨씬 좋을 것입니다.

이 문제를 해결하는 방법은 이미 알고 있습니다. 바로 컴포넌트 라이브러리가 그 역할을 합니다!
이제 프론트엔드 로직을 선언형(Declarative)인 `LikeButton` 컴포넌트로 다시 구현해봅시다:

```tsx
function LikeButton({ postId, likeCount, isLiked }) {
  function handleClick() {
    // ...
  }
 
  return (
    <button className={isLiked ? 'liked' : ''}>
      {likeCount} Likes
    </button>
  );
}
```

단순화를 위해, 잠시 순수 클라이언트 사이드 렌더링 방식으로 내려가 봅시다.
순수 클라이언트 사이드 렌더링에서는 서버 코드의 역할이 단지 초기 props를 전달하는 것에 불과합니다.

```tsx
app.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const userId = getCurrentUser();
  const likeCount = await db.likes.count({ where: { postId } });
  const isLiked = await db.likes.count({ where: { postId, userId } }) > 0;
  const html = `<html>
    <body>
      <script src="./frontend.js></script>
      <script>
        const output = LikeButton(${JSON.stringify({
          postId,
          likeCount,
          isLiked
        })});
        render(document.body, output);
      </script>
    </body>
  </html>`;
  res.text(html);
});
```

그러면 `LikeButton`은 이 props를 가지고 페이지에 나타날 수 있습니다.

```tsx
function LikeButton({ postId, likeCount, isLiked }) {
  function handleClick() {
    // ...
  }
 
  return (
    <button className={isLiked ? 'liked' : ''}>
      {likeCount} Likes
    </button>
  );
}
```

이 방식은 일리가 있으며, 사실 클라이언트 사이드 라우팅이 등장하기 전에는 서버 렌더링 애플리케이션에서 React를 통합하는 전형적인 방법이었습니다.
페이지에 클라이언트 사이드 코드를 담은 `<script>`를 작성하고, 그 코드가 필요로 하는 인라인 데이터(즉, 초기 props)를 담은 또 다른 `<script>`를 작성해야 했습니다.

이 코드 형태에 대해 조금 더 생각해봅시다. 여기서 흥미로운 일이 벌어지고 있습니다:
백엔드 코드는 분명히 프론트엔드 코드로 정보를 전달하고 싶어합니다.
그런데 정보를 전달하는 과정이 다시 `문자열 기반(stringly-typed)`으로 이뤄지고 있다는 점입니다!

여기서 무슨 일이 벌어지고 있는 걸까요?

```tsx
app.get('/posts/:postId', async (req, res) => {
  // ...
  const html = `<html>
    <body>
      <script src="./frontend.js></script>
      <script>
        const output = LikeButton(${JSON.stringify({
          postId,
          likeCount,
          isLiked
        })});
        render(document.body, output);
      </script>
    </body>
  </html>`;
  res.text(html);
});
```

우리가 지금 말하고 있는 것은 결국 이렇습니다:
브라우저가 `frontend.js` 파일을 로드한 다음, 그 안에서 `LikeButton` 함수를 찾아서, 이 JSON을 해당 함수에 전달하라는 것입니다.

그렇다면, 그냥 그렇게 직접 표현할 수 있다면 어떨까요?

```tsx
import { LikeButton } from './frontend';
 
app.get('/posts/:postId', async (req, res) => {
  // ...
  const jsx = (
    <html>
      <body>
        <LikeButton
          postId={postId}
          likeCount={likeCount}
          isLiked={isLiked}
        />
      </body>
    </html>
  );
  // ...
});

```

```tsx
'use client'; // 모든 exports가 백엔드로부터 "renderable"한 것으로 표기
 
export function LikeButton({ postId, likeCount, isLiked }) {
  function handleClick() {
    // ...
  }
 
  return (
    <button className={isLiked ? 'liked' : ''}>
      {likeCount} Likes
    </button>
  );
}
```

여기서 우리는 하나의 개념적 도약을 하고 있지만, 조금만 더 따라와 주세요.
우리가 말하고자 하는 것은, 백엔드와 프론트엔드는 여전히 별개의 런타임 환경이라는 점입니다.
하지만 이 둘을 별개의 프로그램이 아니라, 하나의 프로그램처럼 바라보고 있다는 것입니다.

바로 그렇기 때문에, 정보를 전달하는 쪽(백엔드)과 그 정보를 받아야 하는 함수(프론트엔드) 사이에 문법적인 연결(syntactic connection) 을 설정하려는 것입니다.
그리고 그 연결을 표현하는 가장 자연스러운 방법은, 역시 단순한 `import`입니다.

여기서도 주목해야 할 점은,
백엔드에서 `'use client'`로 표시된 파일을 `import`할 때, 실제 `LikeButton` 함수 자체를 가져오는 것이 아니라는 것입니다.
대신, 나중에 내부적으로 `<script>` 태그로 변환할 수 있는 `클라이언트 참조(client reference)` 를 얻게 됩니다.

이제 이것이 실제로 어떻게 동작하는지 살펴봅시다.

이 JSX 코드를 보세요:

```tsx
import { LikeButton } from './frontend'; // "/src/frontend.js#LikeButton"
 
// ...
<html>
  <body>
    <LikeButton
      postId={42}
      likeCount={8}
      isLiked={true}
    />
  </body>
</html>
```

JSON을 생성합니다.

```json
{
  type: "html",
  props: {
    children: {
      type: "body",
      props: {
        children: {
          type: "/src/frontend.js#LikeButton", // A client reference!
          props: {
            postId: 42
            likeCount: 8
            isLiked: true
          }
        }
      }
    }
  }
}
```

그리고 이 정보—즉, 이 클라이언트 참조를 통해 우리는 올바른 파일에서 코드를 로드하고, 내부적으로 올바른 함수를 호출하는 `<script>` 태그를 생성할 수 있게 됩니다.

```tsx
<script src="./frontend.js"></script>
<script>
  const output = LikeButton({
    postId: 42,
    likeCount: 8,
    isLiked: true
  });
  // ...
</script>
```

사실 우리는, 클라이언트 렌더링 방식에서는 잃어버렸던
초기 HTML을 서버에서 미리 생성(pregenerate)하기 위해
같은 함수를 서버에서도 실행할 수 있을 만큼 충분한 정보를 가지고 있습니다.

```tsx
<!-- Optional: Initial HTML -->
<button class="liked">
  8 Likes
</button>
 
<!-- Interactivity -->
<script src="./frontend.js"></script>
<script>
  const output = LikeButton({
    postId: 42,
    likeCount: 8,
    isLiked: true
  });
  // ...
</script>
```

초기 HTML을 프리렌더링하는 것은 선택 사항이지만,
이 역시 같은 원시(primitives)를 사용하여 작동합니다.

이제 이 동작 방식을 이해했으니, 이 코드를 한 번 더 살펴보세요:

```tsx
import { LikeButton } from './frontend'; // "/src/frontend.js#LikeButton"
 
app.get('/posts/:postId', async (req, res) => {
  // ...
  const jsx = (
    <html>
      <body>
        <LikeButton
          postId={postId}
          likeCount={likeCount}
          isLiked={isLiked}
        />
      </body>
    </html>
  );
  // ...
});
```
```tsx
'use client'; // Mark all exports as "renderable" from the backend
 
export function LikeButton({ postId, likeCount, isLiked }) {
  function handleClick() {
    // ...
  }
 
  return (
    <button className={isLiked ? 'liked' : ''}>
      {likeCount} Likes
    </button>
  );
}
```

백엔드와 프론트엔드 코드가 어떻게 상호작용해야 하는지에 대한 기존의 고정관념을 잠시 떼어놓고 생각해보면, 여기서 뭔가 특별한 일이 일어나고 있음을 알 수 있습니다.

백엔드 코드는 `'use client'`와 함께 `import`를 사용하여 프론트엔드 코드를 참조합니다.
즉, 프로그램에서 `<script>`를 보내는 부분과 그 `<script>` 안에서 동작하는 부분 간의 모듈 시스템 내의 직접적인 연결을 표현하는 것입니다.
직접적인 연결이 있기 때문에, 타입 체크가 가능하고, `“모든 참조 찾기(Find All References)”` 기능을 사용할 수 있으며, 모든 도구가 이를 인식할 수 있습니다.

`'use server'`와 마찬가지로, `'use client'`도 서버와 클라이언트 간의 연결을 문법적으로 만들어줍니다.
`'use server'`가 클라이언트에서 서버로 가는 문을 열어준다면, `'use client'`는 서버에서 클라이언트로 가는 문을 열어줍니다.

마치 두 개의 세상 사이에 두 개의 문이 있는 것과 같습니다.

---

## 두 개의 세상, 두 개의 문

이것이 바로 `'use client'`와 `'use server'`가 단순히 코드를 “클라이언트”나 “서버”로 “표시”하는 방식으로 이해되어서는 안 되는 이유입니다. 그것이 그들의 역할이 아닙니다.

오히려, 이들은 한 환경에서 다른 환경으로 가는 문을 여는 역할을 합니다:

- `'use client'`는 클라이언트 함수를 서버로 내보냅니다. 내부적으로, 백엔드 코드는 이를 `/src/frontend.js#LikeButton`과 같은 참조로 처리합니다. 이들은 JSX 태그로 렌더링될 수 있으며, 궁극적으로 `<script>` 태그로 변환됩니다. (선택적으로, 이 스크립트들을 서버에서 미리 실행하여 초기 HTML을 얻을 수 있습니다.)

- `'use server'`는 서버 함수를 클라이언트로 내보냅니다. 내부적으로, 프론트엔드는 이를 HTTP를 통해 백엔드를 호출하는 비동기 함수로 처리합니다.

이 지시어들은 모듈 시스템 내에서 네트워크 간격을 표현합니다.
이를 통해 클라이언트/서버 애플리케이션을 두 환경에 걸쳐 있는 하나의 프로그램으로 묘사할 수 있게 됩니다.

이들은 이 환경들이 어떤 실행 컨텍스트도 공유하지 않는다는 사실을 인정하고 완전히 수용합니다—그래서 어떤 import도 실제로 코드를 실행하지 않습니다. 대신, 각 환경은 다른 환경의 코드를 참조할 수 있게 해주고, 그에게 정보를 전달할 수 있게 합니다.

이 두 지시어는 함께 프로그램의 두 부분을 `“엮어”` [양쪽에서의 로직을 포함하는 재사용 가능한 추상화](https://overreacted.io/impossible-components/)를 만들고 구성할 수 있게 해줍니다. 하지만 저는 이 패턴이 React를 넘어, JavaScript를 넘어 확장될 수 있다고 생각합니다. 사실, 이는 모듈 시스템 수준에서의 RPC(Remote Procedure Call) 이며, 클라이언트로 더 많은 코드를 보내기 위한 거울 같은 쌍을 가지고 있는 것입니다.

서버와 클라이언트는 하나의 프로그램의 두 부분입니다. 그들은 시간과 공간에 의해 분리되어 있기 때문에 실행 컨텍스트를 공유하거나 서로를 직접 `import`할 수 없습니다. 하지만 이 지시어들은 시간과 공간을 넘어서 “문을 열어” 줍니다: 서버는 클라이언트를 `<script>`로 렌더링할 수 있고, 클라이언트는 `fetch()`를 통해 서버와 상호작용할 수 있습니다. 그러나 `import`가 그 표현을 가장 직접적으로 할 수 있는 방법이므로, 이 지시어들은 그것을 사용할 수 있게 해줍니다.

이해가 되시죠?
