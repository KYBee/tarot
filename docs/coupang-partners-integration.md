# 쿠팡 파트너스 (Coupang Partners) 연동 가이드

관련 문서: [README.md](../README.md), [kakao-adfit-integration.md](./kakao-adfit-integration.md)

## 1. 왜 쿠팡 파트너스부터 시작하나요?

- 카카오 애드핏은 사전 제휴 인증코드 방식이고, 구글 애드센스는 개인 도메인(`.com` 등)과 다수의 텍스트 페이지 심사가 필요하다.
- 반면 **쿠팡 파트너스**는 개인이 즉시 무료 가입할 수 있고, 기본 `vercel.app` 주소에서도 오늘 바로 링크나 배너를 달아 수익화를 시작할 수 있다.
- 서비스의 딥 퍼플·골드 무드를 해치지 않도록 **`✦ 오늘의 타로 행운 아이템` 추천 카드** 형태로 디자인되어 있으며, 공정거래위원회 필수 문구(*"이 콘텐츠는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."*)가 자동으로 함께 표시된다.

## 2. 쿠팡 파트너스 가입 및 링크 발급 (3분 완료)

1. [쿠팡 파트너스](https://partners.coupang.com/)에 접속해 기존 쿠팡 계정으로 가입한다.
   - 가입 시 **웹사이트 목록**에 `https://tarot-zeta-two.vercel.app/` (및 홍보할 인스타그램 프로필 주소)를 등록한다.
2. 상단 메뉴 **링크 생성 > 상품 링크**에서 타로 유저들이 관심 가질 만한 키워드를 검색한다.
   - 추천 상품 예시: `라이더 웨이트 타로카드`, `타로 스프레드 천`, `인센스 스틱`, `천연 원석 팔찌`, `무드등`
3. 마음에 드는 상품의 **링크 생성**을 눌러 단축 URL(`https://link.coupang.com/a/XXXXXX`)을 복사한다.
   - *(선택)* 단일 상품 대신 회전 배너를 쓰고 싶다면 **링크 생성 > 다이나믹 배너 > 배너 생성**에서 모바일 크기(`320x100`)로 만든 뒤 `iframe`의 `src` 주소(`https://ads-partners.coupang.com/widgets.html?...`)를 복사해도 된다.

## 3. Vercel 환경변수 등록 (코드 수정 없이 활성화)

Vercel 대시보드의 **Project Settings > Environment Variables**에 아래 값을 추가하고 **Redeploy**를 누르면 사이트 하단에 행운 아이템 카드가 즉시 나타난다.

| 환경변수 이름 | 필수 여부 | 설명 및 예시 값 |
|---|---|---|
| `COUPANG_PARTNERS_LINK` | 권장 (또는 아래 배너 사용) | 복사한 단축 링크 (예: `https://link.coupang.com/a/XXXXXX`) |
| `COUPANG_PARTNERS_TITLE` | 선택 | 카드에 표시할 문구 (생략 시 기본값: `나만의 라이더 웨이트 타로 덱 & 행운의 인센스·원석 구경하기`) |
| `COUPANG_PARTNERS_BANNER_SRC` | 선택 | 다이나믹 배너 `iframe`의 `src` URL (`https://ads-partners.coupang.com/widgets.html?...`) |
| `COUPANG_PARTNERS_WIDTH` | 선택 | 배너 가로 크기 (기본값 `320`) |
| `COUPANG_PARTNERS_HEIGHT` | 선택 | 배너 세로 크기 (기본값 `100`) |

> `COUPANG_PARTNERS_LINK`와 `COUPANG_PARTNERS_BANNER_SRC`가 모두 비어 있으면 `#coupang-container`는 자동으로 숨겨진다(`hidden`).
