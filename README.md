# 오늘과 너의 타로

생년월일 기반으로 사용자의 탄생카드 프로필을 읽고, 78장 타로 덱에서 직접 카드를 골라 오늘의 운세를 확인하는 모바일 우선 웹 서비스입니다.  
계산 결과를 단순 숫자로 보여주기보다, 탄생카드·페르소나 카드·연도 흐름과 오늘의 카드를 하나의 타로 리딩처럼 읽게 만드는 방향으로 구성되어 있습니다.

저장소: <https://github.com/KYBee/tarot>

## 현재 상태

- 문서화 완료
- 정적 웹 MVP + 78장 오늘의 운세 구현 완료
- 입력 -> 계산 -> 결과 카드 -> 연도 흐름 -> 공유까지 동작
- 랜딩에서 `탄생카드 보기`와 `오늘의 운세`(78장 뒷면 스프레드에서 1장 직접 선택) 지원
- 78장 전체(메이저 22장 `img/` + 마이너 56장 `img/minor/`) 1909 Rider-Waite-Smith 퍼블릭 도메인 스캔 이미지 세트 반영
- 카카오 공유 및 카카오 애드핏(Kakao AdFit) 배너 슬롯 연동 코드 구현됨 (Vercel 환경변수 설정 시 자동 활성화)

## 예시 화면

![랜딩 화면 예시](docs/screenshots/landing.png)

## 주요 기능

- 생년월일 입력 기반 탄생카드 / 페르소나 카드 / 작년·올해·내년 연도 카드 계산
- 계산된 페르소나가 있을 때만 두 번째 프로필 카드 표시
- 78장 전체 덱(메이저 22 + 마이너 56, 정방향)을 셔플해 카드 뒷면에서 1장을 직접 고르는 '오늘의 운세'
- 오늘 뽑은 카드를 브라우저 `localStorage`에 당일(`YYYY-MM-DD`) 고정 (브라우저 데이터 삭제·시크릿 모드·타 기기 접속 시 초기화)
- 그림 속 상징, 상징 해석, 역할별 프로필, 연도 흐름, 오늘의 메시지·한 줄 조언 표시
- 카카오 공유 (실패 시 Web Share API -> 클립보드 복사 fallback)

## 기술 구성

- `index.html`
  화면 구조
- `style.css`
  서비스 스타일과 레이아웃
- `script.js`
  계산 로직, 78장 덱/셔플/일일 고정, 렌더링, 이벤트 바인딩
- `data/card-content.js`
  메이저 아르카나 22장 콘텐츠와 공통 카피
- `data/minor-arcana-content.js`
  마이너 아르카나 56장 콘텐츠
- `img/`, `img/minor/`
  메이저 22장 및 마이너 56장 카드 이미지 세트
- `docs/`
  서비스/기획/계산/UI/기술 문서
- `tests/script.test.js`
  핵심 계산 로직 및 78장 덱/공유 테스트

## 로컬 실행

정적 파일 서버로 바로 실행할 수 있습니다.

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:4175` 로 접속합니다.

## Vercel 설정

Vercel 배포에서는 빌드 시 `config.js`를 자동 생성합니다.

- Project Settings > Environment Variables 에 아래 값을 추가합니다.
- `KAKAO_JS_KEY`
- `SHARE_BASE_URL`
- `COUPANG_PARTNERS_LINK` (쿠팡 파트너스 상품 단축 링크, 예: `https://link.coupang.com/a/XXXXXX`)
- `COUPANG_PARTNERS_TITLE` (선택, 행운 아이템 카드 안내 문구)
- `COUPANG_PARTNERS_BANNER_SRC` (선택, 쿠팡 다이나믹 배너 iframe `src` URL)
- `KAKAO_ADFIT_UNIT` (선택, 카카오 애드핏 광고 단위 ID)

현재 기본 공유 URL은 `https://tarot-zeta-two.vercel.app/` 이며, `SHARE_BASE_URL`을 비워두면 이 값을 사용합니다.
배포 시 `config.js`가 생성되고, 앱은 이 값을 이용해 Kakao SDK, 쿠팡 파트너스 행운 아이템 슬롯, 애드핏 배너를 초기화합니다. 상세 절차는 [docs/coupang-partners-integration.md](docs/coupang-partners-integration.md)를 참고하세요.

로컬에서 같은 구성을 테스트하려면:

```bash
KAKAO_JS_KEY=your_key SHARE_BASE_URL=https://tarot-zeta-two.vercel.app/ node scripts/generate-config.js
python3 -m http.server 4175 --bind 127.0.0.1
```

실제 키 파일인 `config.js`는 git에 올리지 않고, 예시는 `config.example.js`를 참고합니다.

## 검증 명령

```bash
node --test tests/script.test.js tests/generate-config.test.js
node --check script.js
node --check data/card-content.js
```

## 문서

먼저 아래 순서로 읽는 것을 권장합니다.

1. `docs/product-overview.md`
2. `docs/requirements.md`
3. `docs/calculation-rules.md`
4. `docs/content-model.md`
5. `docs/content-writing-guide.md`
6. `docs/ui-ux-spec.md`
7. `docs/technical-plan.md`
8. `docs/kakao-share-integration.md`
9. `docs/content-cards.md`
10. `docs/implementation-checklist.md`

## 남은 작업

- 운영 환경에서 Kakao 공유 실제 동작 확인
- 결과 공유용 고정 URL 설계
- 모바일 시각 QA와 추가 polish
- 계산/렌더링 회귀 테스트 보강

## 작업 원칙

- 현재 구조 `index.html / script.js / style.css`는 유지합니다.
- 디자인 방향은 기존 우주적 무드와 카드형 결과 흐름을 존중합니다.
- 필요한 부분만 수정하고, 과장된 문서/과한 추상화는 피합니다.
- 이 저장소의 상세 작업 규칙은 `AGENTS.md`를 우선합니다.
