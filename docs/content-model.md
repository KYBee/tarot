# 콘텐츠 모델

관련 문서: [content-writing-guide.md](./content-writing-guide.md), [content-cards.md](./content-cards.md), [ui-ux-spec.md](./ui-ux-spec.md)

## 1. 목적

- 카드 설명 데이터를 UI에서 일관되게 렌더링하기 위한 구조를 정의한다.
- 탄생/페르소나 카드의 공통 상징과 역할별 프로필 설명을 분리한다.
- 일반 카드 해석과 연도 카드 전용 흐름 해석을 분리한다.
- 현재 정적 웹 구조에서도 바로 사용할 수 있어야 한다.

## 2. 카드 데이터 구조

```js
{
  canonicalNumber: 8,
  displayNumber: "8",
  name: "힘",
  englishName: "Strength",
  keywords: ["인내", "내면의 힘", "조절", "회복력"],
  symbolismDescription: "그림에서 직접 확인되는 장면 설명",
  symbolismInterpretation: "그 장면이 카드 의미로 이어지는 이유",
  profileDescription: "역할별 문구가 없을 때 사용할 공통 설명",
  roleDescriptions: {
    birth: "내 중심 성향으로 읽는 설명",
    persona: "사회적 인상으로 읽는 설명"
  },
  yearFlowDescription: "연도 카드에서만 사용하는 흐름 해석"
}
```

## 3. 필드 설명

- `canonicalNumber`: 내부 저장 기준 번호. 바보 카드는 `0`.
- `displayNumber`: UI 노출 문자열. 바보 카드는 `0/22`.
- `name`, `englishName`: 한국어 카드명과 보조 영어명.
- `keywords`: 기본 의미에 사용하는 짧은 키워드 3~5개.
- `symbolismDescription`: Rider-Waite-Smith 계열 이미지에서 실제로 확인되는 주요 장면과 요소.
- `symbolismInterpretation`: 앞의 요소가 카드 의미와 성향 해석으로 이어지는 이유.
- `profileDescription`: 이전 데이터 호환과 예외 상황을 위한 공통 fallback.
- `roleDescriptions.birth`: 탄생카드로 읽을 때의 중심 욕구, 강점, 균형점. 탄생카드 범위인 1~9에 제공한다.
- `roleDescriptions.persona`: 사회적 인상, 맡기 쉬운 역할, 그 이미지의 부담. 통합형을 포함해 0~21 전체에 제공한다.
- `yearFlowDescription`: 작년/올해/내년 영역에서만 사용하는 흐름형 해석.

## 4. 카드 타입 설명

```js
{
  birth: {
    title: "탄생카드",
    definition: "탄생카드는 내가 타고난 중심 성향을 의미합니다."
  },
  persona: {
    title: "페르소나 카드",
    definition: "페르소나 카드는 사회 속에서 드러나는 나의 얼굴을 의미합니다."
  },
  personaIntegrated: {
    label: "탄생·페르소나 통합형",
    trace: "중간 축약 과정에서 별도의 두 자리 카드가 나오지 않아 탄생카드와 같은 카드로 읽습니다."
  }
}
```

## 5. 프로필 합성 모델

```js
{
  birthCard,
  personaCard,
  personaNumber,
  hasDistinctPersona,
  years
}
```

- 별도 페르소나가 있으면 `personaCard`는 해당 카드이고 `hasDistinctPersona`는 `true`다.
- 별도 페르소나가 없으면 계산 결과인 `personaNumber`는 `null`로 유지한다.
- 이때 `personaCard`는 `birthCard`, `hasDistinctPersona`는 `false`다.
- UI는 이를 결손이나 빈 상태가 아니라 `탄생·페르소나 통합형`으로 보여준다.

## 6. 실제 렌더링 위치

### 결과 스와이프 카드

- 카드 번호: `displayNumber`
- 카드명: `name`
- 카드 타입 설명: `APP_COPY.birth/persona.definition`
- 기본 의미: `keywords.join(', ')`
- 그림 속 상징: `symbolismDescription`
- 왜 이렇게 읽을까요?: `symbolismInterpretation`
- 내 중심에서 나타나는 모습: `roleDescriptions.birth`
- 다른 사람에게 보이는 모습: `roleDescriptions.persona`

### 연도별 흐름

- 카드명: `name`
- 해석 문장: `yearFlowDescription`
- 현재 연도 카드만 별도 스타일링

## 7. 데이터 관리 원칙

- 런타임 single source of truth는 `data/card-content.js`다.
- 사람이 검토하는 원문은 `docs/content-cards.md`와 함께 유지한다.
- 카드 텍스트를 바꾸면 두 파일을 같은 변경에서 동기화한다.
- 정적 사이트이므로 번들러나 fetch 없이 전역 객체와 CommonJS 호환 형태를 유지한다.
