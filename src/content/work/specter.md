---
company: 'Specter'
role: 'Frontend Developer'
dateStart: '03/06/2023'
dateEnd: '재직중'
---

- 장고 기반 웹 페이지에서 nextjs 웹 페이지로 리뉴얼 작업
- next, react-hook-form, react-query, tailwindcss, zustand, radix-ui, typescript, ts-pattern, zod
- Jira, Confluence를 이용한 협업 및 업무 진행
- next-i18next 도입으로 locale 국제화 작업
  - Intl용 컴포넌트를 만들어 국제화 및 Rich Text를 간편하게 처리
  - <a href="https://gist.github.com/geonhwiii/bc2306ded62c2ce803589ce987934816" target="_blank">Rich-Text-Intl-Message.tsx</a>
- pnpm 및 turbo를 이용한 monorepo 도입을 통한 모듈 분리 및 추가 플랫폼을 빠르게 개발
  - 프로젝트 사이즈가 커지면서 분리할 필요성이 생김
  - 플랫폼, core, ui, config, i18n, utils, constants 등을 분리하여 개발 진행
  - API 상품용 웹뷰어를 모노레포를 통해 단기간에 적은 리소스로 추가 개발할 수 있었음
  - 관련 링크드인 포스팅 -> <a href="https://www.linkedin.com/feed/update/urn:li:activity:7238479113898876928/" target="_blank">두 배로 늘어난 프로젝트를 2명의 개발자가 관리하는 방법
</a>
- 빌드 및 배포 시스템 개선
  - aws cli 기반 script 배포에서 github action을 통한 docker 빌드 및 배포 자동화
  - 이후 배포시스템 통합을 위해 현재는 jenkins로 전환
- GPT4를 이용한 평판 요약 정보 기획 및 개발
  - openai api를 이용한 <a href="https://team-specter.atlassian.net/wiki/external/OTJiMjczZDViMGNhNGM0YWE3NGFkMjRjMTUyZWVmY2Y" target="_blank">아이디어</a>를 먼저 TechScrum에서 제시하고, 이후 실제 서비스에 도입
  - 이후 ai 활용에 대한 인식이 바뀌어 TEO 와 같은 실시간 ai 채팅 시스템도 개발 진행 -> <a href="https://www.specter.co.kr/blog/AITEO240702" target="_blank">관련 기사</a>
  - 관련해서 개발을 진행하고 배운 기술 중 하나인 Server Sent Event를 다룬 <a href="/blog/nextjs-server-sent-event-with-api-routes" target="_blank">블로그</a> 포스팅
- 복잡한 formData 관리를 위해 context api와 zustand, react-hook-form을 결합하여 사용
  - context api와 zustand를 이용해 provider 내부의 상태를 손쉽게 관리
  - react-hook-form을 이용해 제출할 formData를 관리
  - context provider, form provider, form 컴포넌트의 분리를 통해 코드관리가 매우 단순해짐
  - <a href="https://gist.github.com/geonhwiii/d4a8c27701ea8774055e7ec0567a7aae" target="_blank">Context-Provider-Form 패턴</a>
  - 이후 평판 질문 데이터를 클라이언트가 아닌 서버에서 관리하여 확장성 및 유지보수에 용이하도록 개발
  - 위와 관련해서 블로그 포스팅 -> <a href="/blog/서버에서-관리하는-formdata" target="_blank">서버에서 관리하는 FormData</a>
- Mobile Application의 필요성을 느껴 개인프로젝트로 React Native App 개발 진행
  - 초안을 작업하여 앱의 필요성을 알리고 추후에 진행할 수 개발을 있도록 기반을 마련
  - Monorepo로 진행하여 core 및 ui 모듈을 분리하여 개발 진행
  - 이후 면접봇 프로젝트가 진행되어 모노레포 내에서 추가 프로젝트로 작업을 진행할 수 있도록 보조
