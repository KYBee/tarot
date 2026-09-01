# docs 안내

`너의 타로는?`의 기획, 계산 규칙, 콘텐츠 구조, UI/UX, 기술 방향을 먼저 고정하기 위한 문서 모음이다. 이 디렉터리의 문서는 현재 mock UI인 [`index.html`](/Users/kybee/dev/projects/tarot/index.html), [`script.js`](/Users/kybee/dev/projects/tarot/script.js), [`style.css`](/Users/kybee/dev/projects/tarot/style.css)를 유지하면서 점진적으로 개선하는 것을 전제로 한다.

## 권장 읽기 순서

1. [product-overview.md](./product-overview.md)
2. [requirements.md](./requirements.md)
3. [calculation-rules.md](./calculation-rules.md)
4. [content-model.md](./content-model.md)
5. [content-writing-guide.md](./content-writing-guide.md)
6. [ui-ux-spec.md](./ui-ux-spec.md)
7. [technical-plan.md](./technical-plan.md)
8. [kakao-share-integration.md](./kakao-share-integration.md)
9. [content-cards.md](./content-cards.md)
10. [implementation-checklist.md](./implementation-checklist.md)

## 문서 목록

- [product-overview.md](./product-overview.md)
  서비스 목적, 문제 정의, 사용자 경험 목표, 톤앤매너, 핵심 화면을 정리한다.
- [requirements.md](./requirements.md)
  기능 요구사항, 입력/출력, 예외 처리, 비기능 요구사항을 정리한다.
- [calculation-rules.md](./calculation-rules.md)
  탄생카드, 페르소나 카드, 통합형 표시, 연도 카드 계산과 표기 정책을 정리한다.
- [content-model.md](./content-model.md)
  카드 콘텐츠 데이터 구조와 렌더링 연결 방식을 정의한다.
- [content-writing-guide.md](./content-writing-guide.md)
  카드 해석 문체, 금지 표현, 샘플 카피 원칙을 정리한다.
- [ui-ux-spec.md](./ui-ux-spec.md)
  현재 mock 구조 분석과 모바일 우선 UI/UX 가이드를 정리한다.
- [technical-plan.md](./technical-plan.md)
  현 파일 구조를 유지하면서 구현을 어떻게 진행할지 단계별로 정리한다.
- [kakao-share-integration.md](./kakao-share-integration.md)
  Kakao JavaScript SDK 적용 절차와 설정/실패 대응을 정리한다.
- [content-cards.md](./content-cards.md)
  메이저 아르카나 0~21 전체 카드 초안과 연도 흐름 문구를 정리한다.
- [implementation-checklist.md](./implementation-checklist.md)
  구현 전후 검토에 사용할 Must / Should / Nice-to-have 체크리스트다.

## 문서 사용 원칙

- 계산 규칙은 항상 [calculation-rules.md](./calculation-rules.md)를 기준으로 한다.
- 카드 텍스트 구조는 [content-model.md](./content-model.md)와 [content-writing-guide.md](./content-writing-guide.md)를 함께 본다.
- UI 문구와 섹션 순서는 [ui-ux-spec.md](./ui-ux-spec.md)를 우선한다.
- 실제 구현 단계의 파일 분리와 리팩터링 범위는 [technical-plan.md](./technical-plan.md)를 따른다.
