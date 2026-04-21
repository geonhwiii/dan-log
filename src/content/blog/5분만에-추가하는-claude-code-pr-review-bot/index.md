---
title: '5분만에 추가하는 Claude Code PR Review Bot'
summary: 'Claude Code Github Actions를 활용해 5분만에 PR Review Bot을 설정하는 방법을 소개합니다.'
date: '04 21 2026'
image: 'https://i.imgur.com/DpujWbM.png'
draft: false
tags:
  - AI
---

![](https://i.imgur.com/DpujWbM.png)

오늘은 **Claude Code Actions**를 활용해 **PR Review Bot**을 만들어보겠습니다.

복잡한 설정 없이 **5분 안에** 바로 적용할 수 있는 방법을 소개합니다.

## 설정

가장 빠른 방법은 터미널의 **Claude Code** 내에서 `/install-github-app` 명령을 실행하면 됩니다.

1. 안내에 따라 [**Claude Github App**](https://github.com/apps/claude)을 설치하고,

2. `ANTHROPIC_API_KEY`를 저장소 시크릿에 추가합니다.

   구독형으로 사용하고 싶다면 OAuth 키를 발급받아 사용할 수도 있습니다.

3. 이후 **Claude Code**가 `.github/workflows/**.yml` 파일로 구성된 **Github Actions PR**을 자동으로 생성해줍니다.

수동으로 설정하는 경우에는 위 과정을 직접 진행하면 됩니다.

**Claude Github App**만 추가하면 기존 **Github Actions**를 추가하는 방법과 동일합니다.

## 코드 및 실제 동작

아래는 제가 사용한 워크플로우 예시입니다.

`track_progress`를 `true`로 설정하면 진행 현황을 실시간으로 확인할 수 있습니다.

> 주의: **인라인 코멘트 관련 설명**과 **claude_args**를 추가하지 않으면 코멘트가 달리지 않을 수 있습니다.

```yml
# .github/workflows/claude-pr-review.yml
name: Claude Auto Review with Tracking
on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 1

      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          track_progress: true # ✨ track_progress를 추가하면 진행 현황을 실시간으로 알려줍니다.
          prompt: |
            REPO: ${{ github.repository }}
            PR NUMBER: ${{ github.event.pull_request.number }}

            이 PR을 한국어로 리뷰해주세요. 다음 항목에 집중해주세요:

            $ 여기에 본인의 코드 퀄리티 기준, 제약사항 등을 추가 $

            특정 이슈에 대해 인라인 코멘트로 상세한 피드백을 제공하세요.

          claude_args: |
            --allowedTools "mcp__github_inline_comment__create_inline_comment,Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*)"
```

아래 이미지처럼 체크박스가 실시간으로 업데이트되며, `claude.md`를 참고할 수 있어 `skills`와 함께 사용하면 더 높은 품질의 리뷰를 구현할 수 있습니다.

추가적인 사용법과 코드 예시는 하단 참고 링크에서 확인할 수 있습니다.

![](https://i.imgur.com/MkMEY5R.png)

---

## 🔗 참고 링크

1. [**Claude Code Github Actions**](https://code.claude.com/docs/ko/github-actions)

2. [**Claude Code Actions - Usage**](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md)

3. [**Claude Code Actions - Example**](https://github.com/anthropics/claude-code-action/tree/main/examples)
