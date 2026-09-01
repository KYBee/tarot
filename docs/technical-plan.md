# 기술 계획

관련 문서: [requirements.md](./requirements.md), [calculation-rules.md](./calculation-rules.md), [kakao-share-integration.md](./kakao-share-integration.md)

## 1. 기본 방향

- 현재 정적 웹 구조인 [`index.html`](/Users/kybee/dev/projects/tarot/index.html), [`script.js`](/Users/kybee/dev/projects/tarot/script.js), [`style.css`](/Users/kybee/dev/projects/tarot/style.css)를 유지한다.
- 다만 콘텐츠 양이 많기 때문에 데이터는 분리 가능한 형태로 설계한다.
- 구현은 "계산 로직 정리 -> 콘텐츠 데이터 연결 -> UI 개선 -> 공유 연동" 순으로 진행한다.

## 2. 현재 구조의 문제점

### 2.1 script.js

- 카드 데이터, 계산 로직, 렌더링 로직, 이벤트 로직이 한 파일에 섞여 있다.
- 탄생카드 계산 규칙이 문서 기준과 다르다.
- 별도 페르소나 카드가 없을 때는 탄생카드를 재사용하는 통합형 상태를 만든다.
- 연도 카드가 공통 카드 설명 데이터를 그대로 재활용하지 못한다.

### 2.2 index.html

- 섹션 골격은 좋지만, 카드 타입 설명/카드 설명/프로필 설명 영역이 완전히 분리되어 있지 않다.
- 접근성 속성과 상태 class 설계가 부족하다.

### 2.3 style.css

- 전체 분위기와 레이아웃 방향은 적절하다.
- 하지만 텍스트량이 늘어나면 카드 높이와 여백 체계가 다시 필요하다.
- `prefers-reduced-motion` 대응과 버튼 상태 스타일이 부족하다.

## 3. 데이터 분리 전략

### 권장안

초기 구현부터 카드 콘텐츠는 별도 파일로 분리한다.

권장 파일:

- `data/card-content.js`
- `data/card-content.js` 내부 `APP_COPY`

이유:

- `content-cards.md`의 22개 카드 내용을 `script.js`에 그대로 넣으면 유지보수가 어려워진다.
- 카드 데이터와 UI 문구를 분리하면 계산/렌더링 로직이 단순해진다.
- 정적 사이트이므로 번들러 없는 환경에서 JSON fetch보다 JS 전역 객체가 더 단순하다.

### 데이터 파일 예시 책임

- `data/card-content.js`
  0~21 카드 콘텐츠, 연도 해석, 번호/표시값
- `APP_COPY`
  카드 타입 설명, 통합형 문구, 버튼 문구, 오류 문구

## 4. 파일 구조 제안

초기 리팩터링 후 권장 구조:

```text
tarot/
  cards/
    21.png
  data/
    card-content.js
  docs/
    ...
  bg.png
  index.html
  script.js
  style.css
```

선택 확장:

```text
tarot/
  data/
    card-content.js
  lib/
    tarot-calculator.js
```

단, 초기 구현은 파일 수를 과도하게 늘리지 않기 위해 `script.js` 내부 함수 분리까지만 해도 충분하다.

## 5. 구현 순서

### 1단계. 계산 로직 정리

- 입력 파싱 함수 분리
- 유효한 날짜 검사 추가
- 탄생/페르소나/연도 카드 계산 함수 재작성
- 계산 trace 문자열 생성 함수 추가

### 2단계. 데이터 연결

- 카드 콘텐츠 데이터 파일 생성
- 카드 타입 설명 및 통합형 문구 연결
- `script.js`에서 기존 하드코딩 텍스트 제거

### 3단계. 결과 렌더링 개선

- 탄생카드 섹션에 타입 설명과 카드 설명 영역 추가
- 페르소나 통합형 상태 지원
- 그림 속 상징과 해석 근거 연결
- 연도별 흐름을 카드 설명과 분리된 카피로 교체

### 4단계. UI 다듬기

- 카드 내부 간격 재정렬
- 긴 텍스트 대응 레이아웃 조정
- 스와이프 힌트/도트 개선
- 접근성 속성 보강

### 5단계. 카카오 공유 준비

- Kakao SDK 로더와 설정값 연결
- 앱키 없을 때 fallback UX 제공
- 공유용 제목/설명/썸네일 정책 반영

## 6. 리팩터링 포인트

- `script.js`는 아래 순서로 섹션화한다.
  - 설정/상수
  - 유틸
  - 입력 검증
  - 계산
  - 데이터 조회
  - 렌더링
  - 이벤트 바인딩

- 렌더링 함수는 최소한 아래 단위로 나눈다.
  - `renderBirthCard`
  - `renderPersonaCard`
  - `renderYearFlow`
  - `renderShareState`

## 7. 구현 시 주의점

- 현재 루트에는 `bg.png`, `cards/21.png`만 존재한다.
- 카드 이미지가 없더라도 서비스는 텍스트 중심으로 완성되어야 한다.
- Kakao 앱키는 정적 저장소에 직접 하드코딩하지 않는 방식을 우선 검토한다.

## 8. 향후 확장 포인트

- 음력 입력 지원
- 결과 URL 생성 및 공유 링크 고정
- 결과 저장 또는 최근 조회
- SEO용 결과 페이지 메타데이터
- 카드 이미지 전체 세트 적용
- 다국어 또는 영어 카드명 병기
- Web Share API와 카카오 공유 동시 지원

## 9. 현재 문서 기준 결론

- 대규모 프레임워크 전환은 필요 없다.
- 문서 기준 첫 구현은 기존 3파일 구조를 유지하면서 데이터만 최소 분리하는 방식이 가장 적절하다.
- 계산 규칙 수정과 데이터 구조 정리가 이번 구현의 핵심 선행 작업이다.
