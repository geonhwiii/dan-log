---
title: 'React Native (Expo) testflight CI/CD 적용하기'
summary: 'React Native (Expo) 프로젝트 ios testflight CI/CD 적용하기'
date: '05 27 2025'
draft: false
tags:
  - React Native
---

React Native (Expo) 프로젝트에서 iOS TestFlight 배포를 자동화하는 CI/CD 파이프라인을 구축해보겠습니다.

매번 수동으로 빌드하고 업로드하는 번거로움을 해결하고, 코드 푸시만으로 자동으로 TestFlight에 배포되도록 설정해보겠습니다.

제로부터 세팅하는 것은 처음이라 설명에서 생략된 부분이 많지만, `fastlane`문서와 함께 참고해서 도움이 되시길 바랍니다 :)

## 1. 사전 준비사항

### Apple Developer 계정 설정

먼저 Apple Developer 계정에서 필요한 설정들을 준비해야 합니다.

- **App Store Connect API Key**: 자동화된 업로드를 위한 API 키
- **Apple Team ID**: 개발자 팀 식별자
- **App Identifier**: 앱의 Bundle ID

테스트용 번들명은 `com.dan.app` 이라고 가정하겠습니다.

### Bitrise 계정 설정

CI/CD 플랫폼으로 Bitrise를 사용합니다. GitHub 저장소와 연결하고 프로젝트를 생성해주세요.

Github App으로 React Native 프로젝트 레포를 연결하면 손쉽게 접근 권한도 연동할 수 있습니다.

## 2. Fastlane 설정

### Fastfile 작성

프로젝트 루트에 `fastlane` 폴더를 생성하고 `Fastfile`을 작성합니다.

원래는 프로젝트 내 ios 디렉토리 내에 생성해도 되지만,

저는 bitrise에서 prebuild를 진행하기 때문에, 루트 디렉토리에서 `fastlane` 폴더를 관리하였습니다.

```ruby
# fastlane/Fastfile

desc "1. ios - AppStore Connect API Key 인증"
private_lane :authorize_api_key do |options|
  app_store_connect_api_key(
    key_id: ENV['APPLE_API_KEY_ID'],
    issuer_id: ENV['APPLE_API_KEY_ISSUER_ID'],
    key_filepath: options[:api_key_path]
  )
end

desc "2. ios - Update CodeSign & 앱 빌드"
private_lane :build_for_store do |options|
  match(
    type: "appstore",
    readonly: false,
    app_identifier: options[:app_identifier]
  )

  # 프로비저닝 프로필 이름 설정
  profile_name = ENV['sigh_com.dan.app_appstore_profile-name']

  puts "profile_name: #{profile_name}"

  # 코드 사이닝 설정 업데이트
  update_code_signing_settings(
    use_automatic_signing: false,
    path: "./ios/App.xcodeproj",
    team_id: ENV['APPLE_TEAM_ID'],
    profile_name: profile_name,
    code_sign_identity: "iPhone Distribution",
    build_configurations: ["Release"]
  )

  # 앱 빌드
  build_app(
    export_method: "app-store",
    scheme: "App",
    workspace: "./ios/App.xcworkspace",
    include_bitcode: false
  )
end

desc "3. 프로젝트 빌드 넘버 및 TestFlight 빌드 넘버 확인"
lane :export_new_build_number do |options|
  authorize_api_key(api_key_path: options[:api_key_path])

  # 현재 버전 가져오기
  version = get_version_number(
    xcodeproj: "./ios/App.xcodeproj",
    target: "App"
  )

  # TestFlight의 최신 빌드 번호 확인
  latest_testflight_build_number(
    app_identifier: options[:app_identifier],
    version: version,
    initial_build_number: 0
  )

  # 새로운 빌드 번호 생성
  new_build_number = lane_context[SharedValues::LATEST_TESTFLIGHT_BUILD_NUMBER] + 1
  system("envman add --key CURRENT_VERSION --value '#{version}'")
  system("envman add --key NEW_BUILD_NUMBER --value '#{new_build_number}'")
end

desc "4. ios - 빌드 및 TestFlight 업로드"
lane :ios_upload_testflight do |options|
  authorize_api_key(api_key_path: options[:api_key_path])

  # 프로젝트 팀 설정
  update_project_team(
    path: "./ios/App.xcodeproj",
    teamid: ENV['APPLE_TEAM_ID']
  )

  # 빌드 번호 증가
  increment_build_number(
    xcodeproj: "./ios/App.xcodeproj",
    build_number: ENV['NEW_BUILD_NUMBER']
  )
  
  # 앱 빌드
  build_for_store(options)

  # 변경 로그 설정
  changelog = "#{ENV['LAST_COMMIT_MESSAGE']}"
  puts "changelog: #{changelog}"

  # TestFlight 업로드
  upload_to_testflight(
    skip_submission: true,
    username: "gunw.dan@gmail.com",
    skip_waiting_for_build_processing: true,
    itc_provider: ENV['APPLE_TEAM_ID'],
    changelog: changelog,
    distribute_external: options[:distribute_external],
    notify_external_testers: options[:distribute_external],
    beta_app_feedback_email: "gunw.dan@gmail.com",
    beta_app_description: changelog,
    groups: ["External"]
  )
end
```

### 주요 Lane 설명

1. **authorize_api_key**: App Store Connect API 키로 인증
2. **build_for_store**: 코드 사이닝 설정 후 앱 빌드
3. **export_new_build_number**: 자동으로 빌드 번호 증가
4. **ios_upload_testflight**: TestFlight에 업로드

## 3. Bitrise 워크플로우 설정

### bitrise.yml 작성

```yaml
# bitrise.yml
format_version: "23"
default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git
project_type: react-native

workflows:
  ios-testflight:
    steps:
    - git-clone@8:
        title: 'Git : Clone Repository'
    
    - restore-npm-cache@2:
        title: 'NPM : Restore NPM Cache'
    
    - nvm@1: {}
    
    - script@1:
        inputs:
        - content: |-
            #!/usr/bin/env bash
            set -e
            set -o pipefail
            set -x

            node -v
            npm i -g bun
            bun -v
            bun install
        title: 'Script : Install node lts & Install Bun'
    
    - save-npm-cache@1:
        title: 'NPM : Save NPM Cache'
    
    - script@1:
        inputs:
        - content: |-
            #!/usr/bin/env bash
            set -e
            set -o pipefail
            set -x

            bun expo prebuild --platform ios --clean
        title: 'Script : Expo Prebuild'
    
    - script@1:
        inputs:
        - content: |-
            #!/usr/bin/env bash
            set -e
            set -o pipefail
            set -x

            export LAST_COMMIT_MESSAGE="$(git log -1 --pretty=%B)"
        title: 'Script : Collect Commit Message'
    
    - file-downloader@1:
        inputs:
        - source: $BITRISEIO_APPLE_AUTH_KEY_URL
        - destination: ./fastlane/apple_auth_key.p8
        title: Download Apple Auth Key
    
    - fastlane@3:
        inputs:
        - lane: export_new_build_number api_key_path:./fastlane/apple_auth_key.p8 app_identifier:$APP_IDENTIFIER
        - connection: "off"
        - verbose_log: "yes"
        title: 'Fastlane : Export New Build Number'
    
    - fastlane@3:
        inputs:
        - lane: ios_upload_testflight readonly:$READONLY api_key_path:./fastlane/apple_auth_key.p8 distribute_external:true app_identifier:$APP_IDENTIFIER
        - connection: "off"
        - verbose_log: "yes"
        title: 'Fastlane : Build iOS and Upload to Testflight'
    
    - deploy-to-bitrise-io@2:
        title: 'Bitrise : Build Artifacts, Test Reports, and Pipeline intermediate files'

    envs:
    - APP_IDENTIFIER: com.dan.app
      opts:
        is_expand: false

meta:
  bitrise.io:
    stack: osx-xcode-16.2.x
    machine_type_id: g2-m1.4core

app:
  envs:
  - APPLE_API_KEY_ID: *********
    opts:
      is_expand: false
  - APPLE_API_KEY_ISSUER_ID: *********
    opts:
      is_expand: false
  - APPLE_TEAM_ID: *********
    opts:
      is_expand: false
```

### 워크플로우 단계 설명

1. **Git Clone**: 저장소 클론
2. **NPM Cache**: 의존성 캐시 복원/저장
3. **Node & Bun 설치**: 빌드 환경 설정
4. **Expo Prebuild**: iOS 네이티브 프로젝트 생성
5. **Commit Message 수집**: 변경 로그용 커밋 메시지 수집
6. **Apple Auth Key 다운로드**: API 키 파일 다운로드
7. **Fastlane 실행**: 빌드 번호 생성 및 TestFlight 업로드

## 4. 환경 변수 설정

Bitrise에서 다음 환경 변수들을 설정해야 합니다:

### App 레벨 환경 변수
- `APPLE_API_KEY_ID`: Apple API 키 ID
- `APPLE_API_KEY_ISSUER_ID`: Apple API 발급자 ID  
- `APPLE_TEAM_ID`: Apple 팀 ID

### Workflow 레벨 환경 변수
- `APP_IDENTIFIER`: 앱 Bundle ID
- `EXPO_PUBLIC_API_URL`: API 서버 URL (필요시)

### Secret 파일들
- `BITRISEIO_APPLE_AUTH_KEY_URL`: Apple API 키 파일 (.p8)

## 5. 트리거 설정

특정 브랜치에 푸시될 때 자동으로 빌드가 실행되도록 트리거를 설정합니다.

`Bitrise`에서 GUI로 간편하게 설정할 수 있습니다.

## 6. 실행 및 확인

이제 설정한 브랜치에 코드를 푸시하면:

1. Bitrise에서 자동으로 워크플로우가 실행됩니다
2. Expo 프로젝트가 prebuild되어 네이티브 iOS 프로젝트가 생성됩니다
3. Fastlane이 자동으로 빌드 번호를 증가시킵니다
4. 앱이 빌드되고 TestFlight에 업로드됩니다
5. 외부 테스터들에게 자동으로 알림이 전송됩니다

---


