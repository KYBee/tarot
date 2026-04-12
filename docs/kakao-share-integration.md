# 카카오 공유 연동

관련 문서: [requirements.md](./requirements.md), [ui-ux-spec.md](./ui-ux-spec.md), [technical-plan.md](./technical-plan.md)

## 1. 목적

- 결과 화면에서 카카오톡 공유 버튼을 제공한다.
- 초기 문서 단계에서는 버튼 UI와 연동 정책을 먼저 고정한다.
- 실제 연동은 Kakao JavaScript SDK 기준으로 진행한다.

## 2. 적용 방식

권장 방식:

- SDK 로드 후 `Kakao.Share.sendDefault()`를 호출하는 버튼 핸들러 구성
- 또는 버튼 DOM에 직접 연결하는 `Kakao.Share.createDefaultButton()` 사용

초기 버전 권장:

- 앱 상태와 결과 데이터가 동적으로 바뀌므로 `sendDefault()` 방식이 더 유연하다.

## 3. 사전 준비사항

- Kakao Developers 애플리케이션 생성
- JavaScript 키 확보
- 사이트 도메인 등록
- 제품 링크 관리 설정
- 공유 시 연결될 기본 URL 결정

## 4. 정적 사이트용 설정 전략

빌드 도구가 없는 정적 사이트이므로 일반적인 환경변수 대신 아래 방식을 권장한다.

### 권장 파일

- `config.example.js`
- `config.js` 또는 `config.local.js` gitignore 처리

Vercel 배포에서는 환경변수에서 `config.js`를 생성하는 방식을 권장한다.

- `KAKAO_JS_KEY`
- `SHARE_BASE_URL`

예시:

```js
window.APP_CONFIG = {
  kakaoJavaScriptKey: "YOUR_KAKAO_JS_KEY",
  shareBaseUrl: "https://example.com/tarot/"
};
```

## 5. 목업 단계와 실제 연동 단계 구분

### 목업 단계

- 버튼은 결과 화면에 노출
- 앱키가 없으면 fallback 메시지 또는 복사 기능 제공
- 공유 데이터 포맷과 UI 위치만 고정

### 실제 연동 단계

- Kakao SDK 스크립트 삽입
- `Kakao.init(APP_CONFIG.kakaoJavaScriptKey)`
- `Kakao.isInitialized()` 체크
- 결과 데이터 기반 공유 payload 구성
- 정적 배포 환경에서는 Vercel env로 `config.js`를 생성해 위 값을 주입

## 6. 버튼 UI 요구사항

- 결과 화면 하단의 1차 CTA로 배치
- 카카오 브랜드 식별성은 살리되, 서비스의 퍼플/골드 무드와 충돌하지 않게 조정
- 라벨 예시:
  - `카카오톡으로 내 타로 공유하기`
  - `탄생카드 카카오로 공유하기`

## 7. 공유 payload 권장 구조

- 제목: `너의 타로는? | 나의 탄생카드는 힘`
- 설명: 카드명 + 짧은 요약 + 서비스명
- 이미지:
  - 초기에는 공통 썸네일 또는 카드 프레임 이미지 사용
  - 카드별 이미지 세트 확보 전까지는 텍스트형 썸네일을 허용
- 링크:
  - 모바일 웹 URL
  - 웹 URL

## 8. 실패 시 fallback UX

### SDK 로드 실패

- 버튼 클릭 시 "공유 기능을 준비 중이에요. 링크 복사로 대신 공유해보세요." 안내
- 가능한 경우 URL 복사 수행

### 앱키 미설정

- 개발 환경에서는 콘솔 경고 + 버튼 fallback
- 운영 환경에서는 사용자에게 오류를 직접 노출하지 않고 대체 공유로 유도

### 카카오 브라우저 외 환경

- 정상 동작해야 함
- 실패 시 Web Share API 또는 클립보드 복사로 대체

## 9. 구현 체크 포인트

- SDK가 한 번만 초기화되는지 확인
- 결과 생성 후 공유 클릭 시 최신 카드명이 반영되는지 확인
- 링크가 없더라도 최소한 텍스트 공유 fallback이 가능한지 확인

## 10. 보안 및 운영 메모

- JavaScript 키는 완전한 비밀키가 아니지만, 저장소에 무분별하게 하드코딩하지 않는 편이 좋다.
- 실제 배포 도메인과 Kakao 등록 도메인이 정확히 일치해야 한다.
- 추후 결과 URL 기능이 들어가면 공유 효율이 크게 좋아진다.
