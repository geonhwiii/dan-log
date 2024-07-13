---
title: Nextjs Server-Sent Event with api routes
summary: nextjs에서 api routes로 SSE 연결
date: 07 01 2024
draft: false
tags:
  - nextjs
  - sse
---

이번 회사 프로젝트에서 `nextjs`에서 `openai`와 같은 `stream api`를 연동을 하게 되었습니다.

`Spring`으로 래핑된 `assistant api`를 `Server-Sent Events (SSE)`를 이용해서 개발하게 되었고,

`nextjs`에서 어떻게 `SSE`를 개발했는지 기록해 둡니다.

---

## 1. Server-sent events

`Server-Sent Events (SSE)`는 클라이언트-서버 간의 일방향 통신을 가능하게 하는 기술로, 서버가 클라이언트로 지속적으로 데이터를 `push`할 수 있도록 합니다.

SSE는 HTTP 프로토콜 위에서 동작하며, 클라이언트는 서버와 지속적인 연결을 유지하면서 데이터를 수신할 수 있습니다.

주로 실시간 채팅, 실시간 대시보드, 주식 시세 등에 활용됩니다.

주요 특징은 다음과 같습니다.

1. **단방향 통신**: 서버에서 클라이언트로만 데이터가 전송됩니다. 클라이언트에서 서버로의 데이터 전송은 일반적인 HTTP 요청을 통해 이루어집니다.

2. **간편한 구현**: `SSE`는 `WebSocket`보다 구현이 간단하고, HTTP/1.1 이상의 프로토콜을 사용하는 모든 최신 브라우저에서 지원됩니다.

3. **자동 재연결**: 클라이언트는 연결이 끊어지면 자동으로 다시 연결하려 시도합니다.

---

## 2. Server - api routes 생성

api폴더에 `stream.ts`를 생성하고 아래와 같이 작성합니다.

`axios`의 `responseType`으로 `stream`을 전달하게 되면 응답을 `chunk data`로 받게 됩니다.

해당 응답을 문자열로 변환시켜준 후 `client`로 즉시 전달합니다.

만약 서버에서 `[DONE]`이라는 값이 올 경우 (협의해서), `stream`을 종료하도록 설정합니다.

```ts
// /api/stream.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const Authorization = req.headers.authorization ?? '';
  const params = req.query;

  // 스트리밍 응답을 위한 헤더 설정
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'Cache-Control': 'no-cache, no-transform',
    'Content-Type': 'text/event-stream',
  });

  // axios로 API 요청
  const response = await axios.post(
    `{process.env.NEXT_API_URL}/...`,
    { ...params },
    {
      headers: { Authorization, Accept: 'text/event-stream' },
      responseType: 'stream',
    }
  );

  // API 응답 스트림에서 데이터 수신
  response.data.on('data', (chunk: Buffer) => {
    const data = chunk.toString();
    // 데이터가 [DONE]일 경우 스트림 종료
    if (data === 'data:[DONE]') {
      res.end();
    } else {
      res.write(chunk);
    }
  });

  // 클라이언트 요청이 닫힐 경우 stream 종료
  req.on('close', () => {
    res.end();
  });
};
```

## 3. Client - EventSource

저는 connectEventSource 함수를 생성하여 각 이벤트에 필요 함수를 전달받는 식으로 구현하였습니다.

onopen, onmessage, onerror 일 때, 각각 함수를 전달받아 채팅과 같은 서비스를 구현할 수 있습니다.

api를 만들때와 마찬가지로, "[DONE]" 메세지를 받으면 `eventSource`를 `close` 해줘야합니다.

```ts
// /lib/event-souce.ts
import { Event as ErrorEvent, EventSourcePolyfill, EventSourcePolyfillInit, MessageEvent } from 'event-source-polyfill';

type EventSourceParams = {
  url: string;
  options?: EventSourcePolyfillInit;
};

export const getEventSource = ({ url, options }: EventSourceParams) => new EventSourcePolyfill(url, options);

export const connectEventSource = ({
  url,
  options,
  onConnectOpen = noop,
  onReceivedMessage = noop,
  onConnectClosed = noop,
  onError = noop,
}: ConnectEventSourceParams): Promise<EventSourcePolyfill> => {
  const eventSource = getEventSource({ url, options });
  return new Promise((resolve, reject) => {
    eventSource.onopen = () => {
      onConnectOpen();
    };
    eventSource.onmessage = (event: MessageEvent) => {
      if (event.data === '[DONE]') {
        eventSource.close();
        onConnectClosed();
        resolve(event.data);
      } else if (event.data) {
        const result = JSON.parse(event.data);
        const message = result?.value ?? '';
        onReceivedMessage(message);
        resolve(message);
      }
    };
    eventSource.onerror = (error: EventSourceErrorEvent) => {
      if (error.data) {
        const err = JSON.parse(error.data);
        onError(err);
        reject(err);
      }
      eventSource.close();
    };
  });
};
```

## 4. Client - connectEventSource 활용

간단한 활용예시로는 아래와 같습니다.

채팅 메세지를 보낼 때 `eventSource`를 연결하고, 각 함수에 전달해주면 됩니다.

```tsx
const onSendMessage = async () => {
  await connectEventSource({
    url: `/api/stream`,
    onReceivedMessage: (message: string) => {
      // message를 화면에 보여주기 위한 동작
      appendToLastMessageAnswer(message);
      scrollToBottom();
    },
    onConnectClosed: () => {
      // 연결이 종료되었을 떄 동작
    },
    onError: (err) => {
      // 에러가 발생했을 경우 동작
    },
  });
};
```

---

## 5. 예외 케이스

`openai`에서 전달하는 `stream data`가 항상 일정하게 오는 것은 아니었습니다.

`data: ... \n\n` 과 같이 일정하게 오면 stream이 잘 오지만,

`data:\n ... \n\n` 처럼 `\n` 이 뜬금없이 들어오는 경우, 그 외의 경우도 있었습니다.

특히 위처럼 `data:\n`으로 들어올 경우에는 `[DONE]`을 전달받지 못해서

영원히 `eventSource`가 끝나지 않는 경우가 있으므로, 해당 케이스는 아래처럼 `replace` 해주었습니다.

```ts
// /api/stream.ts
...

response.data.on('data', (chunk: Buffer) => {
	const data = chunk.toString().replace(/^data:(\n)?/, 'data:');
	if (data === 'data:[DONE]') {
		res.end();
	} else {
		res.write(data);
	}
});

...

```

에러케이스를 잘 만들어, 운영을 해 나가면서 계속 모니터링하면 좋을 것 같습니다.
