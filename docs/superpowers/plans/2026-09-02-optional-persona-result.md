# Optional Persona Result Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 페르소나 카드가 실제 계산될 때만 두 번째 프로필 카드와 관계 UI를 보여주고, 없을 때는 탄생카드 하나만 자연스럽게 읽히는 결과 화면을 만든다.

**Architecture:** 계산 결과에서 페르소나 부재를 `null`과 `hasPersona: false`로 명시하고, 이 상태를 순수한 표시 정책 함수와 DOM 렌더 함수가 소비한다. 기존의 정적 2장 DOM과 모바일 카드형 디자인은 유지하되 `hidden` 속성으로 페르소나 슬라이드·단계 탐색·스와이프 안내를 함께 제외하며, 공유 문구와 활성 문서도 같은 조건을 따른다.

**Tech Stack:** Vanilla JavaScript, HTML, CSS, Node.js built-in test runner, Playwright CLI

---

## File map

- Modify: `script.js` — 선택적 페르소나 데이터 모델, 관계 문구, 표시 정책, DOM 렌더링, 공유 문구를 담당한다.
- Modify: `data/card-content.js` — 더 이상 쓰지 않는 통합형 공통 문구를 제거한다.
- Modify: `style.css` — 통합형 전용 시각 상태를 제거하고 네이티브 `hidden` 동작을 보존한다.
- Modify: `tests/script.test.js` — 페르소나 유무에 따른 모델·관계·표시·공유 회귀 테스트를 담당한다.
- Modify: `AGENTS.md`, `README.md`, `docs/product-overview.md`, `docs/requirements.md`, `docs/calculation-rules.md`, `docs/content-model.md`, `docs/content-writing-guide.md`, `docs/ui-ux-spec.md`, `docs/technical-plan.md`, `docs/implementation-checklist.md` — 활성 문서의 표시 정책을 구현과 일치시킨다.
- Reference: `docs/superpowers/specs/2026-09-02-optional-persona-result-design.md` — 승인된 UX와 데이터 정책의 기준이다.

### Task 1: Make persona absence explicit in the profile model and relationship copy

**Files:**
- Modify: `tests/script.test.js:88-116`
- Modify: `tests/script.test.js:210-240`
- Modify: `script.js:194-220`
- Modify: `script.js:271-299`

- [ ] **Step 1: Replace the integrated-persona model tests with optional-persona expectations**

```js
test('buildTarotProfile leaves persona empty when no two-digit card appears', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1997, month: 10, day: 17 },
    new Date('2026-09-01T00:00:00+09:00')
  );

  assert.equal(profile.personaNumber, null);
  assert.equal(profile.personaCard, null);
  assert.equal(profile.hasPersona, false);
  assert.equal('hasDistinctPersona' in profile, false);
  assert.equal('wingNumber' in profile, false);
  assert.equal('wingCard' in profile, false);
});

test('buildTarotProfile keeps a two-digit persona card when one appears', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1993, month: 12, day: 31 },
    new Date('2026-09-01T00:00:00+09:00')
  );

  assert.equal(profile.personaNumber, 11);
  assert.equal(profile.personaCard.canonicalNumber, 11);
  assert.equal(profile.hasPersona, true);
  assert.notEqual(profile.personaCard, profile.birthCard);
});
```

Replace the two existing relationship tests with:

```js
test('buildProfileRelationship returns null when persona is absent', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1997, month: 10, day: 17 },
    new Date('2026-04-12T00:00:00+09:00')
  );

  assert.equal(tarot.buildProfileRelationship(profile), null);
});

test('buildProfileRelationship explains a persona card outward expression', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1993, month: 12, day: 31 },
    new Date('2026-04-12T00:00:00+09:00')
  );

  assert.deepEqual(tarot.buildProfileRelationship(profile), {
    badge: '내 중심이 다른 모습으로 표현돼요',
    birthLabel: '2 여사제',
    personaLabel: '11 정의',
    description:
      '내면에서는 “말보다 깊은 곳에서 답을 읽는 사람”의 성향이 중심을 이루고, 사람들에게는 “감정보다 기준을 세우고 균형 있게 판단하는 사람”의 모습이 먼저 보일 수 있어요.'
  });
});
```

- [ ] **Step 2: Run the focused tests and confirm the new contract fails**

Run: `node --test --test-name-pattern="buildTarotProfile|buildProfileRelationship" tests/script.test.js`

Expected: FAIL because the current profile substitutes `birthCard` for a missing persona and the relationship builder still creates integrated copy.

- [ ] **Step 3: Implement the minimal optional-persona model**

Replace the persona setup and returned property in `buildTarotProfile` with:

```js
const personaNumber = getPersonaCard(birthReduction);
const hasPersona = personaNumber !== null;
const personaCard = hasPersona ? getCardContent(personaNumber) : null;
```

```js
return {
  birthDate: parsedDate,
  birthReduction,
  birthCard,
  personaNumber,
  personaCard,
  hasPersona,
  years
};
```

Replace `buildProfileRelationship` with:

```js
function buildProfileRelationship(profile) {
  if (!profile.hasPersona || !profile.personaCard) {
    return null;
  }

  const birthContent = profile.birthCard;
  const personaContent = profile.personaCard;

  return {
    badge: '내 중심이 다른 모습으로 표현돼요',
    birthLabel: formatProfileCardLabel(birthContent),
    personaLabel: formatProfileCardLabel(personaContent),
    description: `내면에서는 “${birthContent.tagline}”의 성향이 중심을 이루고, 사람들에게는 “${personaContent.tagline}”의 모습이 먼저 보일 수 있어요.`
  };
}
```

- [ ] **Step 4: Run the focused tests and the complete script suite**

Run: `node --test --test-name-pattern="buildTarotProfile|buildProfileRelationship" tests/script.test.js`

Expected: PASS for the model and relationship cases.

Run: `node --test tests/script.test.js`

Expected: all tests PASS.

- [ ] **Step 5: Commit the model change**

```bash
git add script.js tests/script.test.js
git commit -m "refactor: make persona result optional"
```

### Task 2: Define the persona visibility policy

**Files:**
- Modify: `tests/script.test.js`
- Modify: `script.js:220-235`
- Modify: `script.js:780-815`

- [ ] **Step 1: Add visibility-policy tests**

```js
test('getProfileResultVisibility hides persona navigation when persona is absent', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1997, month: 10, day: 17 },
    new Date('2026-04-12T00:00:00+09:00')
  );

  assert.deepEqual(tarot.getProfileResultVisibility(profile), {
    showPersona: false,
    showNavigation: false,
    showSwipeHint: false
  });
});

test('getProfileResultVisibility shows persona navigation when persona exists', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1993, month: 12, day: 31 },
    new Date('2026-04-12T00:00:00+09:00')
  );

  assert.deepEqual(tarot.getProfileResultVisibility(profile), {
    showPersona: true,
    showNavigation: true,
    showSwipeHint: true
  });
});
```

- [ ] **Step 2: Run the focused policy tests and verify they fail**

Run: `node --test --test-name-pattern="getProfileResultVisibility" tests/script.test.js`

Expected: FAIL because `getProfileResultVisibility` is not exported.

- [ ] **Step 3: Add the pure visibility helper**

```js
function getProfileResultVisibility(profile) {
  const showPersona = Boolean(profile?.hasPersona && profile.personaCard);

  return {
    showPersona,
    showNavigation: showPersona,
    showSwipeHint: showPersona
  };
}
```

Insert `getProfileResultVisibility` between the existing relationship and detail exports:

```js
buildProfileRelationship,
getProfileResultVisibility,
getDetailedProfile,
```

- [ ] **Step 4: Run the focused and complete suites**

Run: `node --test --test-name-pattern="getProfileResultVisibility" tests/script.test.js`

Expected: PASS for both visibility-policy tests.

Run: `node --test tests/script.test.js`

Expected: all tests PASS.

- [ ] **Step 5: Commit the policy helpers**

```bash
git add script.js tests/script.test.js
git commit -m "feat: define optional persona display policy"
```

### Task 3: Hide the persona UI as one accessible unit

**Files:**
- Modify: `tests/script.test.js:7-36`
- Modify: `tests/script.test.js:160-197`
- Modify: `script.js:310-345`
- Modify: `script.js:416-447`
- Modify: `script.js:674-704`
- Modify: `script.js:780-815`

- [ ] **Step 1: Give mock elements a real hidden state and add a DOM visibility test**

Add `hidden: false` to `createMockElement()`:

```js
function createMockElement() {
  return {
    hidden: false,
    value: '',
    textContent: '',
    innerHTML: '',
    style: {},
    offsetWidth: 360,
    scrollLeft: 0,
    addEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    focus() {},
    scrollTo() {},
    classList: {
      add() {},
      remove() {},
      toggle() {}
    }
  };
}
```

Add this test after the visibility-policy tests:

```js
test('renderProfileResultVisibility toggles persona, navigation, and hint together', () => {
  const personaSlide = createMockElement();
  const navigation = createMockElement();
  const swipeHint = createMockElement();
  const originalGetElementById = global.document.getElementById;
  const originalQuerySelector = global.document.querySelector;

  global.document.getElementById = (id) =>
    id === 'item-persona' ? personaSlide : createMockElement();
  global.document.querySelector = (selector) => {
    if (selector === '.profile-steps') return navigation;
    if (selector === '.swipe-hint') return swipeHint;
    return null;
  };

  try {
    const singleCardProfile = tarot.buildTarotProfile(
      { year: 1997, month: 10, day: 17 },
      new Date('2026-04-12T00:00:00+09:00')
    );
    tarot.renderProfileResultVisibility(singleCardProfile);
    assert.equal(personaSlide.hidden, true);
    assert.equal(navigation.hidden, true);
    assert.equal(swipeHint.hidden, true);

    const twoCardProfile = tarot.buildTarotProfile(
      { year: 1993, month: 12, day: 31 },
      new Date('2026-04-12T00:00:00+09:00')
    );
    tarot.renderProfileResultVisibility(twoCardProfile);
    assert.equal(personaSlide.hidden, false);
    assert.equal(navigation.hidden, false);
    assert.equal(swipeHint.hidden, false);
  } finally {
    global.document.getElementById = originalGetElementById;
    global.document.querySelector = originalQuerySelector;
  }
});
```

- [ ] **Step 2: Run the DOM visibility test and verify it fails**

Run: `node --test --test-name-pattern="renderProfileResultVisibility" tests/script.test.js`

Expected: FAIL because `renderProfileResultVisibility` does not exist.

- [ ] **Step 3: Add the DOM renderer and export it**

```js
function setElementHidden(element, hidden) {
  if (element) {
    element.hidden = hidden;
  }
}

function renderProfileResultVisibility(profile) {
  if (typeof document === 'undefined') {
    return;
  }

  const visibility = getProfileResultVisibility(profile);
  setElementHidden(document.getElementById('item-persona'), !visibility.showPersona);
  setElementHidden(document.querySelector('.profile-steps'), !visibility.showNavigation);
  setElementHidden(document.querySelector('.swipe-hint'), !visibility.showSwipeHint);
}
```

Insert `renderProfileResultVisibility` between the existing persona and detail render exports:

```js
renderBirthCardSection,
renderPersonaCardSection,
renderProfileResultVisibility,
renderDetailedProfileSection,
```

- [ ] **Step 4: Make persona rendering safe for a missing card**

Replace `renderPersonaCardSection` with:

```js
function renderPersonaCardSection(profile) {
  if (!profile.hasPersona || !profile.personaCard) {
    return;
  }

  const relationship = buildProfileRelationship(profile);
  const trace = `탄생카드 축약 과정에서 ${formatReducedValue(profile.birthReduction.personaRaw)}이 나타나 페르소나 카드로 읽습니다.`;

  setElementText('res-relationship-badge', relationship.badge);
  setElementText('res-relationship-birth', relationship.birthLabel);
  setElementText('res-relationship-persona', relationship.personaLabel);
  setElementText('res-relationship-description', relationship.description);

  renderCardSection('res-persona', APP_COPY.persona, profile.personaCard, {
    role: 'persona',
    trace
  });
}
```

- [ ] **Step 5: Apply visibility before showing each result**

Update the render sequence inside `handleStart`:

```js
currentProfile = buildTarotProfile(parsedDate);
resetProfileDetails();
renderProfileResultVisibility(currentProfile);
renderBirthCardSection(currentProfile);
renderPersonaCardSection(currentProfile);
renderDetailedProfileSection(currentProfile);
renderYearFlowSection(currentProfile);
```

Calling the visibility renderer on every start restores the second card after a single-card reading without page reload.

Change `updateProfileSteps` so a single-card result removes both visual activation and `aria-current`:

```js
function updateProfileSteps(index, enabled = true) {
  if (typeof document === 'undefined') {
    return;
  }

  document.querySelectorAll('.profile-step').forEach((step, stepIndex) => {
    const isActive = enabled && stepIndex === index;
    step.classList.toggle('active', isActive);

    if (isActive) {
      step.setAttribute('aria-current', 'step');
    } else {
      step.removeAttribute('aria-current');
    }
  });

  document
    .getElementById('item-persona')
    ?.classList.toggle('relationship-visible', enabled && index === 1);
}
```

After the existing swiper reset in `handleStart`, replace `updateProfileSteps(0)` with:

```js
updateProfileSteps(0, currentProfile.hasPersona);
```

Keep the feedback reset, result screen transition, and scroll-to-top calls after it. Existing step-click and swipe handlers continue calling `updateProfileSteps(targetIndex)` with the default enabled state because those controls are reachable only in a two-card result.

- [ ] **Step 6: Tighten the source-contract test around accessible hiding**

Extend `rendering source connects relationship, details, and profile steps` with:

```js
assert.match(scriptSource, /renderProfileResultVisibility\(currentProfile\)/);
assert.match(scriptSource, /element\.hidden = hidden/);
assert.match(scriptSource, /if \(!profile\.hasPersona \|\| !profile\.personaCard\)/);
assert.match(scriptSource, /updateProfileSteps\(0, currentProfile\.hasPersona\)/);
assert.match(scriptSource, /const isActive = enabled && stepIndex === index/);
```

Keep the static-markup assertions for the two existing slide anchors: the DOM structure remains reusable and runtime visibility supplies the conditional behavior.

- [ ] **Step 7: Run the DOM test, full script suite, and syntax check**

Run: `node --test --test-name-pattern="renderProfileResultVisibility" tests/script.test.js`

Expected: PASS.

Run: `node --test tests/script.test.js`

Expected: PASS except for obsolete integrated-copy assertions removed in Task 4.

Run: `node --check script.js`

Expected: no output and exit code 0.

- [ ] **Step 8: Commit the conditional UI behavior**

```bash
git add script.js tests/script.test.js
git commit -m "feat: show persona UI only when available"
```

### Task 4: Make share copy conditional and remove integrated-state remnants

**Files:**
- Modify: `tests/script.test.js`
- Modify: `script.js:491-510`
- Modify: `data/card-content.js:410-430`
- Modify: `style.css:545-560`

- [ ] **Step 1: Add share-text tests for both profile shapes**

```js
test('getShareText omits persona when the profile has no persona card', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1997, month: 10, day: 17 },
    new Date('2026-09-01T00:00:00+09:00')
  );
  const shareText = tarot.getShareText(profile);

  assert.match(shareText, /탄생카드: 8 힘/);
  assert.doesNotMatch(shareText, /페르소나카드:/);
});

test('getShareText includes persona when the profile has a persona card', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1993, month: 12, day: 31 },
    new Date('2026-09-01T00:00:00+09:00')
  );
  const shareText = tarot.getShareText(profile);

  assert.match(shareText, /탄생카드: 2 여사제/);
  assert.match(shareText, /페르소나카드: 11 정의/);
});
```

- [ ] **Step 2: Run the focused share tests and verify the persona-present case fails**

Run: `node --test --test-name-pattern="getShareText" tests/script.test.js`

Expected: the no-persona assertion passes and the persona-present assertion FAILS because current share text has no persona line.

- [ ] **Step 3: Build share profile lines conditionally**

Replace `getShareText` with:

```js
function getShareText(profile = currentProfile) {
  if (!profile) {
    return '';
  }

  const birth = profile.birthCard;
  const currentYearFlow = profile.years[1];
  const shareUrl = getShareUrl();
  const profileLines = [`탄생카드: ${birth.displayNumber} ${birth.name}`];

  if (profile.hasPersona && profile.personaCard) {
    profileLines.push(
      `페르소나카드: ${profile.personaCard.displayNumber} ${profile.personaCard.name}`
    );
  }

  return [
    '너의 타로는? | 나의 타로 프로필',
    '',
    ...profileLines,
    `기본 의미: ${birth.keywords.join(', ')}`,
    `올해 흐름: ${currentYearFlow.cardContent.displayNumber} ${currentYearFlow.cardContent.name}`,
    '',
    '나의 타로 프로필을 확인해보세요.',
    shareUrl
  ].join('\n');
}
```

- [ ] **Step 4: Remove the unused integrated copy and style**

Delete this object from `APP_COPY` in `data/card-content.js`:

```js
personaIntegrated: {
  label: '탄생·페르소나 통합형',
  trace: '중간 축약 과정에서 별도의 두 자리 카드가 나오지 않아 탄생카드와 같은 카드로 읽습니다.'
},
```

Delete the complete `.is-integrated .card-visual` rule from `style.css`. Do not add a replacement: the persona slide is absent from layout via `hidden` when no persona exists.

- [ ] **Step 5: Add a regression assertion that integrated implementation terms are gone**

```js
test('optional persona implementation has no integrated-state remnants', () => {
  const contentSource = fs.readFileSync(
    path.join(__dirname, '..', 'data', 'card-content.js'),
    'utf8'
  );

  assert.doesNotMatch(scriptSource, /hasDistinctPersona|personaIntegrated|is-integrated/);
  assert.doesNotMatch(contentSource, /personaIntegrated|탄생·페르소나 통합형/);
  assert.doesNotMatch(styleCss, /\.is-integrated/);
});
```

- [ ] **Step 6: Run focused tests and all JavaScript checks**

Run: `node --test --test-name-pattern="getShareText|integrated-state remnants" tests/script.test.js`

Expected: PASS.

Run: `node --test tests/script.test.js`

Expected: all tests PASS.

Run: `node --check script.js && node --check data/card-content.js`

Expected: no output and exit code 0.

- [ ] **Step 7: Commit share and cleanup changes**

```bash
git add script.js data/card-content.js style.css tests/script.test.js
git commit -m "refactor: remove integrated persona state"
```

### Task 5: Synchronize active product and implementation documentation

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/product-overview.md`
- Modify: `docs/requirements.md`
- Modify: `docs/calculation-rules.md`
- Modify: `docs/content-model.md`
- Modify: `docs/content-writing-guide.md`
- Modify: `docs/ui-ux-spec.md`
- Modify: `docs/technical-plan.md`
- Modify: `docs/implementation-checklist.md`

- [ ] **Step 1: Locate every active-document statement that promises an integrated persona state**

Run:

```bash
rg -n "통합형|같은 카드|hasDistinctPersona|personaIntegrated|탄생카드와 같은 카드|페르소나 카드가 없" AGENTS.md README.md docs --glob '!docs/superpowers/**'
```

Expected: matches identify the exact active policy text to replace; historical specs and plans are intentionally excluded.

- [ ] **Step 2: Apply one consistent product policy in each matched document**

Use these canonical statements, adapting only headings and surrounding grammar:

```markdown
- 축약 과정에서 `10~22`가 처음 나타나면 해당 카드를 페르소나 카드로 제공한다.
- 두 자리 카드가 나타나지 않으면 페르소나 값은 `null`이며, 탄생카드 결과만 제공한다.
- 페르소나가 없을 때 결과 화면은 페르소나 슬라이드, 프로필 단계 탐색, 스와이프 안내를 표시하지 않는다.
- 페르소나가 있을 때만 탄생카드와 페르소나 카드의 관계 설명을 표시한다.
- 페르소나가 없다는 별도 상태명이나 대체 문구는 사용자에게 노출하지 않는다.
```

For code-model examples, use exactly:

```js
{
  personaNumber: null,
  personaCard: null,
  hasPersona: false
}
```

and:

```js
{
  personaNumber: 11,
  personaCard: cardContent,
  hasPersona: true
}
```

Keep `roleDescriptions.persona` documented because all 22 cards can still become valid persona content for other birth dates.

- [ ] **Step 3: Verify active docs no longer describe the removed behavior**

Run:

```bash
rg -n "통합형|같은 카드|hasDistinctPersona|personaIntegrated|탄생카드와 같은 카드" AGENTS.md README.md docs --glob '!docs/superpowers/**'
```

Expected: no matches.

Run:

```bash
rg -n "hasPersona|personaCard: null|페르소나가 있을 때만|페르소나 슬라이드" AGENTS.md README.md docs --glob '!docs/superpowers/**'
```

Expected: matches in the calculation, content-model, UI/UX, technical, and checklist documents confirm the new contract is recorded.

- [ ] **Step 4: Commit the documentation update**

```bash
git add AGENTS.md README.md docs/product-overview.md docs/requirements.md docs/calculation-rules.md docs/content-model.md docs/content-writing-guide.md docs/ui-ux-spec.md docs/technical-plan.md docs/implementation-checklist.md
git commit -m "docs: document optional persona results"
```

### Task 6: Verify calculations, responsive UI, accessibility, and state restoration

**Files:**
- Verify: `index.html`
- Verify: `style.css`
- Verify: `script.js`
- Verify: `data/card-content.js`
- Verify: `tests/script.test.js`
- Modify if the checklist records completed QA: `docs/implementation-checklist.md`

- [ ] **Step 1: Run the complete automated verification set**

Run:

```bash
node --test tests/script.test.js tests/generate-config.test.js
node --check script.js
node --check data/card-content.js
git diff --check
```

Expected: every test passes; both syntax checks and `git diff --check` exit 0 without output.

- [ ] **Step 2: Start the local static server for browser verification**

Run: `python3 -m http.server 4173`

Expected: the process reports that it is serving the repository on port 4173. Keep its session ID for the remaining browser checks.

- [ ] **Step 3: Verify the single-card flow at 320, 360, and 430 px**

For each viewport width, open `http://127.0.0.1:4173`, enter `1997`, `10`, `17`, start the reading, and evaluate:

```js
({
  personaHidden: document.getElementById('item-persona').hidden,
  navigationHidden: document.querySelector('.profile-steps').hidden,
  swipeHintHidden: document.querySelector('.swipe-hint').hidden,
  swiperClientWidth: document.getElementById('card-swiper').clientWidth,
  swiperScrollWidth: document.getElementById('card-swiper').scrollWidth,
  resultText: document.getElementById('result').innerText
})
```

Expected at all three widths:

```js
{
  personaHidden: true,
  navigationHidden: true,
  swipeHintHidden: true
}
```

Also confirm `swiperScrollWidth` is no wider than one visible card viewport apart from subpixel rounding, the result text contains the birth card `8 힘`, and it contains none of `페르소나 카드`, `통합형`, `같은 카드`.

Open one `나의 프로필 더 보기` detail and confirm its text is readable, then confirm the previous/current/next year-flow cards are populated. Use `다시 하기` and confirm the landing inputs return without stale expanded details.

- [ ] **Step 4: Verify the two-card flow and relationship transition at 320, 360, and 430 px**

Restart, enter `1993`, `12`, `31`, start the reading, and evaluate:

```js
({
  personaHidden: document.getElementById('item-persona').hidden,
  navigationHidden: document.querySelector('.profile-steps').hidden,
  swipeHintHidden: document.querySelector('.swipe-hint').hidden,
  birthName: document.getElementById('res-birth-name').textContent,
  personaName: document.getElementById('res-persona-name').textContent
})
```

Expected:

```js
{
  personaHidden: false,
  navigationHidden: false,
  swipeHintHidden: false,
  birthName: '여사제',
  personaName: '정의'
}
```

Activate the second `.profile-step` and confirm `#item-persona` becomes the visible slide, receives `.relationship-visible`, and the relationship panel reads `2 여사제 → 11 정의` without horizontal overflow.

Open one detailed-profile item and confirm the year-flow section remains populated below the two-card swiper.

- [ ] **Step 5: Verify accessibility and same-session restoration**

On the `1997.10.17` result, inspect the browser accessibility snapshot and confirm neither the persona card nor its two-step navigation is present. Then use `다시 하기`, run `1993.12.31` without reloading, and confirm the persona card, navigation, and swipe hint all return to the accessibility tree and screen.

- [ ] **Step 6: Verify share text for both result shapes without sending externally**

In the page console, evaluate `window.tarotApp.getShareText(window.tarotApp.buildTarotProfile({ year: 1997, month: 10, day: 17 }))` and confirm it has no persona line. Evaluate the same call with `{ year: 1993, month: 12, day: 31 }` and confirm it contains `페르소나카드: 11 정의`.

With Kakao SDK still unconfigured, click the share button once on each result shape. Confirm the existing fallback completes without an uncaught error and shows the configured copy-success or unavailable feedback; do not send a real external message.

- [ ] **Step 7: Record QA completion only if the active checklist has matching entries**

If `docs/implementation-checklist.md` already tracks mobile QA, update only those matching checkboxes and add the two tested dates beside them. Do not create a new release log section.

- [ ] **Step 8: Re-run verification after any QA adjustment and commit the evidence**

Run:

```bash
node --test tests/script.test.js tests/generate-config.test.js
node --check script.js
node --check data/card-content.js
git diff --check
git status --short
```

Expected: all checks pass; status contains only the intentional checklist update, or is clean if no checklist edit was needed.

If the checklist changed:

```bash
git add docs/implementation-checklist.md
git commit -m "docs: record optional persona mobile qa"
```

If it did not change, do not create an empty commit.
