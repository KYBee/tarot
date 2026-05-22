# Tarot Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the existing `너의 타로는?` MVP from working prototype to deployment-ready completion with result URLs, verified share behavior, stronger tests, accessibility, and mobile QA.

**Architecture:** Keep the current static structure: `index.html`, `script.js`, `style.css`, `data/card-content.js`. Add only small pure functions and minimal DOM behavior inside `script.js`; do not introduce a framework or build step. Runtime configuration remains `config.js` generated from Vercel env via `scripts/generate-config.js`.

**Tech Stack:** Plain HTML/CSS/JavaScript, Node built-in test runner, Kakao JavaScript SDK, static Vercel deployment.

---

## File Structure

- Modify `script.js`: add result URL serialization/parsing, URL hydration on load, better share payload, dot navigation behavior, and exported pure functions for tests.
- Modify `index.html`: add semantic button behavior to swiper dots, optional result-region accessibility attributes, and share metadata anchors only if needed.
- Modify `style.css`: style dot buttons, focus-visible states, compact mobile polish, and fallback empty card visuals.
- Modify `tests/script.test.js`: add regression tests for `22 -> 0/22`, result URL serialization, hydration helpers, persona empty behavior, share payload, and year card edge cases.
- Modify `README.md`: update current status and local/production verification checklist.
- Modify `docs/implementation-checklist.md`: mark completed items and leave only real remaining work unchecked.

Do not modify card image filenames or `CARD_IMAGE_FILES` unless a test proves a path mismatch.

---

### Task 1: Add Result URL Encoding Helpers

**Files:**
- Modify: `script.js`
- Test: `tests/script.test.js`

- [ ] **Step 1: Write failing tests for result URL helpers**

Add these tests to `tests/script.test.js`:

```js
test('serializeBirthDateForUrl creates stable YYYY-MM-DD value', () => {
  assert.equal(typeof tarot.serializeBirthDateForUrl, 'function');
  assert.equal(
    tarot.serializeBirthDateForUrl({ year: 1997, month: 1, day: 5 }),
    '1997-01-05'
  );
});

test('parseBirthDateFromUrlParam accepts stable shared result value', () => {
  assert.equal(typeof tarot.parseBirthDateFromUrlParam, 'function');
  assert.deepEqual(tarot.parseBirthDateFromUrlParam('1997-01-05'), {
    year: 1997,
    month: 1,
    day: 5
  });
});

test('parseBirthDateFromUrlParam rejects malformed shared result value', () => {
  assert.throws(() => tarot.parseBirthDateFromUrlParam('1997-99-99'));
  assert.throws(() => tarot.parseBirthDateFromUrlParam('hello'));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test tests/script.test.js
```

Expected: FAIL because `serializeBirthDateForUrl` and `parseBirthDateFromUrlParam` are not exported yet.

- [ ] **Step 3: Add minimal pure helpers**

Add near the input/date helpers in `script.js`:

```js
function padTwoDigits(value) {
  return String(value).padStart(2, '0');
}

function serializeBirthDateForUrl(parsedDate) {
  return [
    parsedDate.year,
    padTwoDigits(parsedDate.month),
    padTwoDigits(parsedDate.day)
  ].join('-');
}

function parseBirthDateFromUrlParam(value, now = new Date()) {
  const normalized = String(value || '').trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    throw new Error(APP_COPY.messages?.invalidDate || '생년월일 형식이 올바르지 않습니다.');
  }

  return parseBirthDate(`${match[1]}.${match[2]}.${match[3]}`, now);
}
```

Export them in the `exported` object:

```js
serializeBirthDateForUrl,
parseBirthDateFromUrlParam,
```

- [ ] **Step 4: Run tests to verify pass**

Run:

```bash
node --test tests/script.test.js
node --check script.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add script.js tests/script.test.js
git commit -m "feat: add tarot result URL helpers"
```

---

### Task 2: Use Share URLs That Can Reopen the Same Result

**Files:**
- Modify: `script.js`
- Test: `tests/script.test.js`

- [ ] **Step 1: Write failing tests for profile share URL**

Add:

```js
test('getShareUrl appends birth date when profile is available', () => {
  assert.equal(typeof tarot.getShareUrl, 'function');

  const profile = tarot.buildTarotProfile(
    { year: 1997, month: 10, day: 17 },
    new Date('2026-05-22T00:00:00+09:00')
  );

  assert.equal(
    tarot.getShareUrl(profile),
    'https://tarot-zeta-two.vercel.app/?birth=1997-10-17'
  );
});

test('buildKakaoSharePayload uses a result URL with birth query', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1997, month: 10, day: 17 },
    new Date('2026-05-22T00:00:00+09:00')
  );

  const payload = tarot.buildKakaoSharePayload(profile);

  assert.equal(payload.link.mobileWebUrl, 'https://tarot-zeta-two.vercel.app/?birth=1997-10-17');
  assert.equal(payload.link.webUrl, 'https://tarot-zeta-two.vercel.app/?birth=1997-10-17');
});
```

- [ ] **Step 2: Run tests to verify failure**

```bash
node --test tests/script.test.js
```

Expected: FAIL because `getShareUrl(profile)` currently ignores profile data.

- [ ] **Step 3: Update share URL construction**

Replace `getShareUrl` with:

```js
function getShareBaseUrl() {
  const configuredShareBaseUrl =
    (typeof globalThis !== 'undefined' && globalThis.APP_CONFIG?.shareBaseUrl) ||
    DEFAULT_SHARE_BASE_URL;

  return String(configuredShareBaseUrl || DEFAULT_SHARE_BASE_URL).trim() || DEFAULT_SHARE_BASE_URL;
}

function getShareUrl(profile = currentProfile) {
  const shareBaseUrl = getShareBaseUrl();

  if (!profile?.birthDate) {
    return shareBaseUrl;
  }

  const url = new URL(shareBaseUrl);
  url.searchParams.set('birth', serializeBirthDateForUrl(profile.birthDate));

  return url.toString();
}
```

In `getShareText`, keep:

```js
const shareUrl = getShareUrl(profile);
```

In `buildKakaoSharePayload`, keep:

```js
const shareUrl = getShareUrl(profile);
```

Export `getShareBaseUrl` too:

```js
getShareBaseUrl,
```

- [ ] **Step 4: Run verification**

```bash
node --test tests/script.test.js
node --check script.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add script.js tests/script.test.js
git commit -m "feat: share result-specific tarot URLs"
```

---

### Task 3: Hydrate Result Screen From Shared URL

**Files:**
- Modify: `script.js`
- Test: `tests/script.test.js`

- [ ] **Step 1: Write pure hydration test**

Add:

```js
test('getBirthDateFromLocation reads birth query parameter', () => {
  assert.equal(typeof tarot.getBirthDateFromLocation, 'function');

  const parsed = tarot.getBirthDateFromLocation(
    new URL('https://tarot-zeta-two.vercel.app/?birth=1997-10-17'),
    new Date('2026-05-22T00:00:00+09:00')
  );

  assert.deepEqual(parsed, {
    year: 1997,
    month: 10,
    day: 17
  });
});

test('getBirthDateFromLocation returns null without birth query', () => {
  assert.equal(
    tarot.getBirthDateFromLocation(new URL('https://tarot-zeta-two.vercel.app/')),
    null
  );
});
```

- [ ] **Step 2: Run tests to verify failure**

```bash
node --test tests/script.test.js
```

Expected: FAIL because `getBirthDateFromLocation` does not exist yet.

- [ ] **Step 3: Add URL read helper and render function**

Add to `script.js`:

```js
function getBirthDateFromLocation(locationLike, now = new Date()) {
  const url =
    locationLike instanceof URL
      ? locationLike
      : new URL(String(locationLike?.href || locationLike || ''), getShareBaseUrl());
  const birthParam = url.searchParams.get('birth');

  if (!birthParam) {
    return null;
  }

  return parseBirthDateFromUrlParam(birthParam, now);
}

function renderProfile(profile) {
  currentProfile = profile;
  renderBirthCardSection(currentProfile);
  renderPersonaCardSection(currentProfile);
  renderWingCardSection(currentProfile);
  renderYearFlowSection(currentProfile);

  const swiper = document.getElementById('card-swiper');
  if (swiper) {
    swiper.scrollLeft = 0;
  }

  updateDots(0);
  setShareFeedback('');
  showScreen('result');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

Update the timeout body in `handleStart` to use `renderProfile`:

```js
window.setTimeout(() => {
  renderProfile(buildTarotProfile(parsedDate));
}, 350);
```

Update `initApp` after `bindEvents()`:

```js
try {
  const parsedDate = getBirthDateFromLocation(window.location);
  if (parsedDate) {
    renderProfile(buildTarotProfile(parsedDate));
    return;
  }
} catch (error) {
  setShareFeedback('');
}
```

Export:

```js
getBirthDateFromLocation,
renderProfile,
```

- [ ] **Step 4: Run verification**

```bash
node --test tests/script.test.js
node --check script.js
```

Expected: PASS.

- [ ] **Step 5: Manual browser check**

Run:

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4175/?birth=1997-10-17
```

Expected: Result screen opens directly with birth card `8 힘`.

- [ ] **Step 6: Commit**

```bash
git add script.js tests/script.test.js
git commit -m "feat: restore tarot result from shared URL"
```

---

### Task 4: Strengthen Edge Case Regression Tests

**Files:**
- Modify: `tests/script.test.js`

- [ ] **Step 1: Add tests for documented edge cases**

Add:

```js
test('reduceToBirthCard normalizes persona 22 to fool card', () => {
  const result = tarot.reduceToBirthCard(1900, 8, 31);

  assert.equal(result.birthNumber, 4);
  assert.equal(result.personaRaw, 22);
  assert.equal(result.personaNumber, 0);
});

test('getYearCard normalizes 22 to fool card', () => {
  const result = tarot.getYearCard(1, 1, 1999);

  assert.equal(result.rawNumber, 22);
  assert.equal(result.number, 0);
});

test('buildTarotProfile keeps persona empty for single-card type', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1997, month: 10, day: 17 },
    new Date('2026-05-22T00:00:00+09:00')
  );

  assert.equal(profile.birthCard.name, '힘');
  assert.equal(profile.personaNumber, null);
  assert.equal(profile.wingCard.name, '전차');
});
```

- [ ] **Step 2: Run tests**

```bash
node --test tests/script.test.js
```

Expected: PASS. If any test fails, fix the implementation only where it contradicts `docs/calculation-rules.md`.

- [ ] **Step 3: Commit**

```bash
git add tests/script.test.js
git commit -m "test: cover tarot calculation edge cases"
```

---

### Task 5: Make Swiper Dots Accessible and Clickable

**Files:**
- Modify: `index.html`
- Modify: `script.js`
- Modify: `style.css`
- Test: `tests/script.test.js` if helper extraction is needed

- [ ] **Step 1: Update dot markup**

Replace the `swiper-dots` block in `index.html` with:

```html
<div class="swiper-dots" aria-label="결과 카드 이동">
    <button class="dot active" type="button" data-slide-index="0" aria-label="탄생카드 보기" aria-current="true"></button>
    <button class="dot" type="button" data-slide-index="1" aria-label="페르소나 카드 보기" aria-current="false"></button>
    <button class="dot" type="button" data-slide-index="2" aria-label="날개 카드 보기" aria-current="false"></button>
</div>
```

- [ ] **Step 2: Update dot state logic**

Replace `updateDots` in `script.js` with:

```js
function updateDots(index) {
  if (typeof document === 'undefined') {
    return;
  }

  document.querySelectorAll('.dot').forEach((dot, dotIndex) => {
    const isActive = dotIndex === index;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
}
```

Add:

```js
function goToSlide(index) {
  const swiper = document.getElementById('card-swiper');
  if (!swiper) {
    return;
  }

  swiper.scrollTo({
    left: swiper.offsetWidth * index,
    behavior: 'smooth'
  });
  updateDots(index);
}
```

Update `bindSwiperDots`:

```js
function bindSwiperDots() {
  const swiper = document.getElementById('card-swiper');
  if (!swiper) {
    return;
  }

  swiper.addEventListener('scroll', () => {
    const width = swiper.offsetWidth || 1;
    const activeIndex = Math.round(swiper.scrollLeft / width);
    updateDots(activeIndex);
  });

  document.querySelectorAll('.dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(Number(dot.dataset.slideIndex || 0));
    });
  });
}
```

Export `goToSlide`:

```js
goToSlide,
```

- [ ] **Step 3: Style button dots**

Update `.dot` in `style.css`:

```css
.dot {
    width: 7px;
    height: 7px;
    border: 0;
    padding: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    cursor: pointer;
    transition: width 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.dot:focus-visible {
    outline: 2px solid var(--accent-gold-strong);
    outline-offset: 4px;
}
```

Add focus-visible for main buttons:

```css
.btn-primary:focus-visible,
.btn-share:focus-visible,
.btn-secondary:focus-visible {
    outline: 2px solid var(--accent-gold-strong);
    outline-offset: 3px;
}
```

- [ ] **Step 4: Run checks**

```bash
node --test tests/script.test.js
node --check script.js
node --check data/card-content.js
```

Expected: PASS.

- [ ] **Step 5: Manual browser check**

At `http://127.0.0.1:4175`, generate a result and click each dot.

Expected:
- Dot 1 shows birth card.
- Dot 2 shows persona card or empty persona state.
- Dot 3 shows wing card.
- Focus outline is visible when tabbing.

- [ ] **Step 6: Commit**

```bash
git add index.html script.js style.css tests/script.test.js
git commit -m "feat: improve result carousel accessibility"
```

---

### Task 6: Verify Kakao Share Runtime Behavior

**Files:**
- Modify: `README.md`
- Modify: `docs/kakao-share-integration.md` only if actual behavior differs from docs
- Code changes only if verification finds a defect

- [ ] **Step 1: Generate local config with a real Kakao JavaScript key**

Run with a real key:

```bash
KAKAO_JS_KEY=your_real_key SHARE_BASE_URL=https://tarot-zeta-two.vercel.app/ node scripts/generate-config.js
```

Expected: `config.js` is generated locally and remains untracked.

- [ ] **Step 2: Start local server**

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```

Expected: server available at `http://127.0.0.1:4175`.

- [ ] **Step 3: Test fallback without valid domain**

Open:

```text
http://127.0.0.1:4175
```

Enter:

```text
1997 / 10 / 17
```

Click Kakao share.

Expected: If local domain is not registered in Kakao Developers, SDK may fail and fallback should use Web Share API or clipboard without breaking the page.

- [ ] **Step 4: Test production domain**

After deployment, open:

```text
https://tarot-zeta-two.vercel.app/?birth=1997-10-17
```

Click Kakao share.

Expected:
- Kakao share dialog opens.
- Shared text includes `탄생카드: 8 힘`.
- Shared link includes `?birth=1997-10-17`.

- [ ] **Step 5: Document verified behavior**

Update `README.md` under Vercel or verification section:

```md
## 운영 공유 검증

- Kakao Developers에 운영 도메인 `https://tarot-zeta-two.vercel.app` 등록이 필요합니다.
- 공유 링크는 `?birth=YYYY-MM-DD` 쿼리로 같은 결과를 복원합니다.
- SDK 초기화 또는 도메인 설정 실패 시 Web Share API 또는 클립보드 fallback으로 내려갑니다.
```

- [ ] **Step 6: Commit docs**

```bash
git add README.md docs/kakao-share-integration.md
git commit -m "docs: document tarot share verification"
```

---

### Task 7: Mobile QA and Visual Polish

**Files:**
- Modify: `style.css`
- Modify: `docs/screenshots/landing.png` only if new screenshot is intentionally captured
- Modify: `README.md` only if screenshot instructions change

- [ ] **Step 1: Start local server**

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```

- [ ] **Step 2: Check target viewports**

Use browser devtools or Playwright. Verify these widths:

```text
320 x 740
360 x 800
390 x 844
430 x 932
768 x 1024
```

Flow:

```text
landing -> enter 1997/10/17 -> result -> swipe all cards -> restart -> enter 1900/8/31 -> persona 0/22 case -> share fallback
```

- [ ] **Step 3: Fix only observed layout defects**

If card art or text feels cramped on 320px, adjust only existing selectors. Prefer changes like:

```css
@media (max-width: 360px) {
    #app {
        padding-left: 10px;
        padding-right: 10px;
    }

    .card-info-box {
        padding: 20px 16px;
    }

    .card-visual {
        width: min(74vw, 190px);
        min-height: 260px;
    }
}
```

If no issue is observed, do not change CSS.

- [ ] **Step 4: Run checks**

```bash
node --test tests/script.test.js
node --check script.js
node --check data/card-content.js
```

Expected: PASS.

- [ ] **Step 5: Commit if CSS changed**

```bash
git add style.css README.md docs/screenshots/landing.png
git commit -m "style: polish tarot mobile layout"
```

If no files changed, skip commit and record QA result in the final handoff.

---

### Task 8: Update Project Checklist and Status Docs

**Files:**
- Modify: `docs/implementation-checklist.md`
- Modify: `README.md`

- [ ] **Step 1: Update checklist to match implementation**

In `docs/implementation-checklist.md`, mark completed items after Tasks 1-7. Keep unchecked only items that truly remain. Expected final state:

```md
## Must

- [x] 생년월일 입력 파서와 날짜 유효성 검사를 구현한다.
- [x] 탄생카드 계산을 문서 기준으로 수정한다.
- [x] 페르소나 카드 계산과 빈 상태 UI를 구현한다.
- [x] 날개 카드의 `1 -> 0/22 바보` 순환 규칙을 반영한다.
- [x] 작년 / 올해 / 내년 연도 카드 계산과 별도 흐름 문구를 연결한다.
- [x] 결과 카드에 카드 타입 설명, 기본 의미, 카드 설명, 프로필 설명을 모두 반영한다.
- [x] 현재 `index.html / script.js / style.css` 구조를 유지한다.
- [x] 카카오 공유 버튼을 결과 화면에 유지하고 fallback 상태를 정의한다.
- [x] 모바일 360px 기준에서 레이아웃이 깨지지 않도록 조정한다.
```

If Kakao production verification is not done yet, leave actual SDK verification clearly unchecked under Should:

```md
- [ ] 운영 Kakao 앱키와 등록 도메인에서 실제 공유 다이얼로그를 검증한다.
```

- [ ] **Step 2: Update README current status**

Update the remaining work section:

```md
## 남은 작업

- 운영 Kakao 앱키/도메인에서 실제 공유 다이얼로그 검증
- 모바일 실기기 QA와 세부 polish
- 필요 시 공유 썸네일/OG 이미지 정책 추가
```

- [ ] **Step 3: Run final checks**

```bash
node --test tests/script.test.js
node --check script.js
node --check data/card-content.js
```

Expected: PASS.

- [ ] **Step 4: Commit docs**

```bash
git add docs/implementation-checklist.md README.md
git commit -m "docs: update tarot completion status"
```

---

## Final Verification

Run:

```bash
node --test tests/script.test.js
node --test tests/generate-config.test.js
node --check script.js
node --check data/card-content.js
node --check scripts/generate-config.js
```

Manual flow:

```text
1. Open http://127.0.0.1:4175
2. Enter 1997 / 10 / 17
3. Confirm birth card 8 힘, persona empty, wing 7 전차
4. Swipe or dot-click through all result cards
5. Confirm year flow renders previous/current/next years
6. Click restart and confirm inputs clear
7. Open http://127.0.0.1:4175/?birth=1900-08-31
8. Confirm direct result restore and persona card 0/22 바보
9. Click share and confirm SDK or fallback behavior
```

Production flow:

```text
1. Confirm Vercel has KAKAO_JS_KEY and SHARE_BASE_URL
2. Confirm Kakao Developers has production domain registered
3. Open https://tarot-zeta-two.vercel.app/?birth=1997-10-17
4. Click Kakao share
5. Confirm shared link reopens the same result
```

---

## Self-Review

**Spec coverage:** Covers result URL, sharing, Kakao verification, accessibility, mobile QA, tests, and docs. Calculation logic is not rewritten because current implementation already matches `docs/calculation-rules.md`.

**Placeholder scan:** No task contains `TBD`, vague “add tests”, or unspecified implementation work. Kakao app key is necessarily represented as `your_real_key` because it must not be committed.

**Type consistency:** New helpers use existing `parsedDate` shape: `{ year, month, day }`. Share helpers accept optional `profile` and preserve existing fallback when no profile exists.
