---
title: 'firebase auth로 간단하게 로그인 구현하기'
summary: 'firebase auth 로그인'
date: '12 26 2023'
draft: false
tags:
  - React
  - firebase
---

![](https://i.imgur.com/8ARBbAx.png)

1~2년 전에 사용하던 `firebase`보다 훨씬 더 많이 편해진 것 같습니다.
간단하게 사용방법만 정리해둡니다.

## 1. Create App

![](https://i.imgur.com/akhcLtU.png)

위처럼 웹 앱에 firebase를 추가하고, 이름을 설정합니다.
이후 `firebase SDK` 추가 섹션에 나온 내용을 `.env`에 저장합니다.

```shell
# .env
REACT_APP_API_KEY=******************
REACT_APP_AUTH_DOMAIN=******************
REACT_APP_PROJECT_ID=**************
REACT_APP_STORAGE_BUCKET=******************.appspot.com
REACT_APP_MESSAGING_SENDER_ID=****************
REACT_APP_APP_ID=1:************:web:***********
```

## 2. firebase config 설정

`firebase.ts` 파일을 생성하고 아래와 같이 설정합니다.

`getApp('app')`으로 이미 `firebase`가 설정되어있다면 `app`에 저장하고, 아닐 경우 `initialize`합니다.

```ts
// @/lib/firebase.ts
import { initializeApp, FirebaseApp, getApp } from 'firebase/app';
import 'firebase/auth';

export let app: FirebaseApp;

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

try {
  app = getApp('app');
} catch (err) {
  app = initializeApp(firebaseConfig, 'app');
}

export const firebase = initializeApp(firebaseConfig);
```

## 3. onAuthStateChanged 로 auth핸들링

`onAuthStateChanged`로 `auth`가 변할 때 `user`상태를 저장합니다.

```tsx
import { useEffect, useState } from 'react';
import { app } from '@/lib/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

function App() {
	const auth = getAuth(app);
	const [user, setUser] = useState<User | null>(auth?.currentUser);

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			setUser(user)
		});
	}, [auth]);

	...
}
```

## 4. 회원가입

`createUserWithEmailAndPassword`를 사용해 로그인을 하고, 성공 시 `toast`를 출력해 확인합니다.

```tsx
const onSignUp = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  try {
    const auth = getAuth(app);
    await createUserWithEmailAndPassword(auth, email, password);
    toast.success('회원가입에 성공했습니다.');
  } catch (err) {
    console.log(err);
    toast.error('회원가입에 실패하였습니다.');
  }
};
```

## 5. 로그인

`signInWithEmailAndPassword`를 사용해 로그인을 하고, 성공 시 `toast`를 출력해 확인합니다.

```tsx
import { app } from '@/lib/firebase';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// @/pages/login/index.tsx
const onSignIn = () => {
  const auth = getAuth(app);
  await signInWithEmailAndPassword(auth, email, password);
  toast.success('로그인에 성공하였습니다.');
};
```

## 6. 로그아웃

`createUserWithEmailAndPassword`를 사용해 로그인을 하고, 성공 시 `toast`를 출력해 확인합니다.

```tsx
const onSignOut = async () => {
  try {
    const auth = getAuth(app);
    await signOut(auth);
    toast.success('로그아웃되었습니다.');
  } catch (err) {
    console.log(err);
    toast.error('로그아웃에 실패하였습니다.');
  }
};
```
