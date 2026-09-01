# 너의 타로는?

생년월일 기반으로 사용자의 타로 프로필을 보여주는 모바일 우선 웹 서비스입니다.  
계산 결과를 단순 숫자로 보여주기보다, 탄생카드, 페르소나 카드, 연도 흐름을 하나의 프로필처럼 읽게 만드는 방향으로 작업 중입니다.

저장소: <https://github.com/KYBee/tarot>

## 현재 상태

- 문서화 완료
- 정적 웹 MVP 구현 완료
- 입력 -> 계산 -> 결과 카드 -> 연도 흐름 -> 공유 fallback까지 동작
- 메이저 아르카나 0~21 이미지 세트 반영
- 카카오 공유는 아직 실제 SDK 연동 전 단계

## 예시 화면

![랜딩 화면 예시](docs/screenshots/landing.png)

## 주요 기능

- 생년월일 입력
- 탄생카드 계산
- 페르소나 카드 계산
- 별도 페르소나가 없는 경우 탄생카드와 같은 카드로 이어지는 통합형 표시
- 작년 / 올해 / 내년 연도 카드 계산
- 그림 속 상징, 상징 해석, 역할별 프로필, 연도 흐름 해석 표시
- 카카오 공유 fallback

## 기술 구성

- `index.html`
  화면 구조
- `style.css`
  서비스 스타일과 레이아웃
- `script.js`
  계산 로직, 렌더링, 이벤트 바인딩
- `data/card-content.js`
  카드 콘텐츠와 공통 카피
- `img/`
  카드 이미지 세트
- `docs/`
  서비스/기획/계산/UI/기술 문서
- `tests/script.test.js`
  핵심 계산 로직 테스트

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

현재 기본 공유 URL은 `https://tarot-zeta-two.vercel.app/` 이며, `SHARE_BASE_URL`을 비워두면 이 값을 사용합니다.
배포 시 `config.js`가 생성되고, 앱은 이 값을 이용해 Kakao SDK를 초기화합니다.

로컬에서 같은 구성을 테스트하려면:

```bash
KAKAO_JS_KEY=your_key SHARE_BASE_URL=https://tarot-zeta-two.vercel.app/ node scripts/generate-config.js
python3 -m http.server 4175 --bind 127.0.0.1
```

실제 키 파일인 `config.js`는 git에 올리지 않고, 예시는 `config.example.js`를 참고합니다.

## 검증 명령

```bash
node --test tests/script.test.js
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

- Kakao JavaScript SDK 실제 연동
- 결과 공유용 고정 URL 설계
- 모바일 시각 QA와 추가 polish
- 계산/렌더링 회귀 테스트 보강

## 작업 원칙

- 현재 구조 `index.html / script.js / style.css`는 유지합니다.
- 디자인 방향은 기존 우주적 무드와 카드형 결과 흐름을 존중합니다.
- 필요한 부분만 수정하고, 과장된 문서/과한 추상화는 피합니다.
- 이 저장소의 상세 작업 규칙은 `AGENTS.md`를 우선합니다.
