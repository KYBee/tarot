# 콘텐츠 모델

관련 문서: [content-writing-guide.md](./content-writing-guide.md), [content-cards.md](./content-cards.md), [ui-ux-spec.md](./ui-ux-spec.md)

## 1. 목적

- 카드 설명 데이터를 UI에서 일관되게 렌더링하기 위한 구조를 정의한다.
- 탄생/페르소나/날개 카드 공통 데이터와 연도 카드 전용 해석을 분리한다.
- 현재 정적 웹 구조에서도 바로 사용할 수 있어야 하며, 추후 데이터 파일 분리 시 그대로 옮길 수 있어야 한다.

## 2. 권장 데이터 구조

```js
{
  canonicalNumber: 8,
  displayNumber: "8",
  name: "힘",
  englishName: "Strength",
  keywords: ["인내", "내면의 힘", "조절", "회복력"],
  symbolismDescription: "사자를 힘으로 누르지 않고 부드럽게 다루는 이미지의 카드다...",
  profileDescription: "이 카드를 가진 사람은 겉보다 속이 더 강한 편이고...",
  yearFlowDescription: "올해는 인내와 감정 조절, 회복력이 큰 힘이 되는 흐름이다..."
}
```

## 3. 필드 설명

- `canonicalNumber`
  내부 저장 기준 번호. 바보 카드는 `0`.
- `displayNumber`
  UI 노출용 문자열. 바보 카드는 `0/22`, 그 외는 일반 숫자 문자열.
- `name`
  한국어 카드명.
- `englishName`
  카드의 보조 영어명. UI에서 필수는 아니지만 공유 문구나 추후 SEO에 활용 가능하다.
- `keywords`
  카드 기본 의미에 사용하는 짧은 키워드 배열.
- `symbolismDescription`
  Rider-Waite 이미지 상징 설명. 탄생/페르소나/날개 카드에서 공통 사용한다.
- `profileDescription`
  "이 카드를 가진 사람은" 섹션에서 사용하는 성향 설명.
- `yearFlowDescription`
  연도 카드 영역에서 사용하는 별도 흐름 해석.

## 4. 카드 타입 설명 데이터

카드 콘텐츠와 별도로 타입 설명은 별도 객체로 관리한다.

```js
{
  birth: {
    title: "탄생카드",
    summary: "탄생카드는 내가 타고난 중심 성향을 의미합니다."
  },
  persona: {
    title: "페르소나 카드",
    summary: "페르소나 카드는 사회 속에서 드러나는 나의 얼굴을 의미합니다."
  },
  wing: {
    title: "날개 카드",
    summary: "날개 카드는 내가 내 카드답게 살지 못할 때 기울어지는 방향을 의미합니다."
  }
}
```

이 방식이 필요한 이유:

- `typeDefinition`은 카드마다 달라지지 않으므로 중복 저장을 피할 수 있다.
- 같은 카드 데이터가 탄생/페르소나/날개 중 어디에 들어와도 같은 원본을 재사용할 수 있다.

## 5. 렌더링용 합성 모델

실제 UI 렌더링 시에는 카드 데이터와 타입 데이터를 합쳐 아래 형태로 사용한다.

```js
{
  sectionType: "birth",
  typeTitle: "탄생카드",
  typeDefinition: "탄생카드는 내가 타고난 중심 성향을 의미합니다.",
  card: {
    canonicalNumber: 8,
    displayNumber: "8",
    name: "힘",
    englishName: "Strength",
    keywords: ["인내", "내면의 힘", "조절", "회복력"],
    symbolismDescription: "...",
    profileDescription: "...",
    yearFlowDescription: "..."
  }
}
```

## 6. 실제 렌더링 위치 매핑

### 결과 스와이프 카드

- 카드 번호: `displayNumber`
- 카드명: `name`
- 카드 타입 설명: `typeDefinition`
- 기본 의미: `keywords.join(', ')`
- 카드 설명: `symbolismDescription`
- 이 카드를 가진 사람은: `profileDescription`

### 연도별 흐름

- 카드명: `name`
- 해석 문장: `yearFlowDescription`
- 강조 연도 여부: 현재 연도 카드만 별도 스타일링

## 7. 빈 상태 모델

페르소나 카드가 없을 때는 카드 데이터 대신 아래 구조를 사용한다.

```js
{
  sectionType: "persona",
  isEmpty: true,
  typeTitle: "페르소나 카드",
  typeDefinition: "페르소나 카드는 사회 속에서 드러나는 나의 얼굴을 의미합니다.",
  emptyTitle: "단일 카드 타입",
  emptyDescription: "이번 계산에서는 별도 페르소나 카드가 나오지 않았어요. 바깥으로 드러나는 모습도 탄생카드의 결을 크게 공유합니다."
}
```

## 8. 데이터 파일 분리 권장안

- 콘텐츠 양이 많으므로 구현 단계에서는 카드 데이터를 `script.js` 밖으로 분리하는 것이 바람직하다.
- 정적 사이트 유지 원칙을 고려해 다음 중 하나를 추천한다.
  - `data/card-content.js`에 전역 객체 선언
  - `data/card-content.json` + fetch 로딩

초기 버전은 로딩 단순성을 위해 `data/card-content.js`가 더 안전하다.

