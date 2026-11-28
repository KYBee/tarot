# 카카오 애드핏 (Kakao AdFit) 연동 가이드

관련 문서: [README.md](../README.md), [kakao-share-integration.md](./kakao-share-integration.md)

## 1. 현재 구현 상태

- `index.html` 하단에 `<aside id="adfit-container" hidden>` 및 `<ins class="kakao_ad_area" id="kakao-adfit-ins">` 슬롯이 준비되어 있다.
- `scripts/generate-config.js`가 Vercel 환경변수 `KAKAO_ADFIT_UNIT`, `KAKAO_ADFIT_WIDTH`(기본 `320`), `KAKAO_ADFIT_HEIGHT`(기본 `100`)를 읽어 `config.js`의 `window.APP_CONFIG`에 주입한다.
- `KAKAO_ADFIT_UNIT`이 설정되어 있으면 앱 초기화 시(`initKakaoAdfit()`) 광고 영역을 활성화하고 `https://t1.daumcdn.net/kas/static/ba.min.js` 스크립트를 자동으로 로드한다.
- `KAKAO_ADFIT_UNIT`이 비어 있으면 광고 영역은 `hidden` 상태로 유지되어 레이아웃에 빈 공간이 생기지 않는다.

## 2. 애드핏 광고 단위 발급 및 연결 순서

1. [카카오 애드핏 관리 페이지](https://adfit.kakao.com/)에 로그인한다.
2. **광고관리 > 새 매체 등록**에서 매체명(`오늘과 너의 타로`)과 사이트 주소(`https://tarot-zeta-two.vercel.app` 또는 연결한 개인 도메인)를 등록한다.
3. **광고단위 생성**에서 모바일 배너 규격(`320x100` 또는 `320x50`)을 선택해 광고 단위 ID(`DAN-XXXXXXXXXXXXXXXX`)를 발급받는다.
4. Vercel 프로젝트의 **Settings > Environment Variables**에 아래 환경변수를 추가하고 **Redeploy**한다.
   - `KAKAO_ADFIT_UNIT`: 발급받은 `DAN-XXXXXXXXXXXXXXXX`
   - `KAKAO_ADFIT_WIDTH`: `320` (생략 시 기본값 `320`)
   - `KAKAO_ADFIT_HEIGHT`: `100` (`320x50` 사용 시 `50`)
5. 배포가 반영되면 카카오 애드핏에서 매체 심사가 자동으로 진행되며, 승인 후 실제 광고가 송출된다.
