# Profile Relationship UI and Card Content V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 탄생카드와 페르소나카드의 관계가 두 번째 슬라이드에서 명확히 읽히도록 만들고, 메이저 아르카나 22장의 콘텐츠를 승인된 V2 문구와 상세 프로필 필드로 교체한다.

**Architecture:** 계산 결과인 `buildTarotProfile`은 유지하고, 카드 관계와 상세 프로필을 만드는 작은 순수 함수를 `script.js`에 추가한다. `data/card-content.js`는 승인된 V2 카드 콘텐츠의 단일 소스로 유지하며, `index.html`은 2장 스와이프 안의 핵심 정보와 스와이프 아래의 `<details>` 상세 프로필을 제공한다. 기존 퍼플·골드 카드형 UI를 `style.css`에서 확장하되 프레임워크나 새 런타임 의존성은 추가하지 않는다.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, Node.js built-in test runner, Playwright browser QA

---

## File map

- Modify: `data/card-content.js` — 메이저 아르카나 0~21의 승인된 V2 콘텐츠와 새 상세 필드
- Modify: `script.js` — 관계 카피 생성, 상세 프로필 정규화, 렌더링, 단계 내비게이션
- Modify: `index.html` — 관계 패널, 한 줄 정체성, 2단계 내비게이션, 상세 프로필 아코디언
- Modify: `style.css` — 관계 패널, 단계 표시, 아코디언, 반응형 및 모션 감소 스타일
- Modify: `tests/script.test.js` — 콘텐츠 계약, 관계 카피, 상세 프로필, 마크업 회귀 테스트
- Modify: `docs/content-model.md` — V2 필드와 관계 카피 모델
- Modify: `docs/content-writing-guide.md` — 강점·그림자·관계·일·성장 작성 원칙
- Modify: `docs/content-cards.md` — 승인된 카드 콘텐츠 V2 원문
- Modify: `docs/ui-ux-spec.md` — 관계형 두 번째 슬라이드, 단계 표시, 상세 아코디언
- Modify: `docs/requirements.md` — V2 콘텐츠와 관계 UI 요구사항
- Modify: `docs/implementation-checklist.md` — 완료 조건과 QA 항목

## Approved content source

이 계획에서 `승인된 V2 원문`은 사용자가 이 작업 스레드에 제공한 `# 너의 타로는? — 카드 콘텐츠 V2`의 0 바보부터 21 세계까지의 전체 텍스트를 뜻한다. 각 제목을 다음 필드에 기계적으로 대응시키며 문장을 임의로 요약하거나 기존 문구와 섞지 않는다.

| V2 제목 | 데이터 필드 |
| --- | --- |
| 한 줄 정체성 | `tagline` |
| 기본 의미 | `keywords` 배열 |
| 그래서 어떤 사람인가 | `profileDescription` |
| 강점 | `strengthDescription` |
| 그림자 | `shadowDescription` |
| 관계 | `relationshipDescription` |
| 일 | `workStyleDescription` |
| 성장 포인트 | `growthPointDescription` |
| 그림 속 상징 | `symbolismDescription` |
| 왜 이렇게 읽을까요? | `symbolismInterpretation` |
| 탄생카드 | `roleDescriptions.birth` |
| 페르소나 | `roleDescriptions.persona` |
| 연도 카드 | `yearFlowDescription` |

카드 번호, `displayNumber`, 한국어 이름, 영어 이름, 이미지 파일 매핑은 변경하지 않는다.

---

### Task 1: Migrate all 22 cards to the V2 content contract

**Files:**
- Modify: `tests/script.test.js`
- Modify: `data/card-content.js`

- [ ] **Step 1: Write the failing V2 content-contract test**

Replace the existing two content-contract tests with one complete contract test:

```js
test('every Major Arcana card provides the complete V2 profile content', () => {
  const requiredFields = [
    'tagline',
    'profileDescription',
    'strengthDescription',
    'shadowDescription',
    'relationshipDescription',
    'workStyleDescription',
    'growthPointDescription',
    'symbolismDescription',
    'symbolismInterpretation',
    'yearFlowDescription'
  ];

  for (let number = 0; number <= 21; number += 1) {
    const card = tarot.getCardContent(number);

    assert.ok(Array.isArray(card.keywords), `card ${number} keywords`);
    assert.ok(card.keywords.length >= 4, `card ${number} keyword count`);

    requiredFields.forEach((field) => {
      assert.equal(typeof card[field], 'string', `card ${number} ${field}`);
      assert.ok(card[field].trim().length >= 10, `card ${number} ${field} content`);
    });

    assert.equal(typeof card.roleDescriptions?.birth, 'string', `card ${number} birth`);
    assert.ok(card.roleDescriptions.birth.trim().length >= 10, `card ${number} birth content`);
    assert.equal(typeof card.roleDescriptions?.persona, 'string', `card ${number} persona`);
    assert.ok(card.roleDescriptions.persona.trim().length >= 10, `card ${number} persona content`);
  }
});
```

- [ ] **Step 2: Run the test and verify the new contract fails**

Run:

```bash
node --test --test-name-pattern="complete V2 profile content" tests/script.test.js
```

Expected: FAIL because `tagline`, the five detailed profile fields, and birth-role copy outside cards 1~9 do not exist yet.

- [ ] **Step 3: Replace card entries with the approved V2 content**

For every entry `0` through `21` in `TAROT_CARD_CONTENT`:

1. Preserve `canonicalNumber`, `displayNumber`, `name`, and `englishName`.
2. Replace `keywords`, `profileDescription`, `symbolismDescription`, `symbolismInterpretation`, both role descriptions, and `yearFlowDescription` with the exact approved V2 values.
3. Add the six new string fields immediately after `englishName` or `profileDescription`, using the same order for all cards.
4. Keep JavaScript strings single-quoted and escape only literal apostrophes if one appears.

Each card must have this complete shape:

```js
8: {
  canonicalNumber: 8,
  displayNumber: '8',
  name: '힘',
  englishName: 'Strength',
  tagline: '거친 힘을 억누르지 않고 부드럽게 다루는 사람',
  keywords: ['인내', '내면의 힘', '조절', '용기', '회복력'],
  profileDescription: '겉보다 속이 훨씬 단단하고 어려운 상황에서도 쉽게 무너지지 않는 편입니다. 사람을 억누르기보다 부드럽게 설득하고 조율하는 힘이 있으며 시간이 걸려도 꾸준히 버틸 수 있습니다. 다만 참는 힘이 강한 만큼 감정을 너무 오래 눌러두면 어느 순간 한꺼번에 터질 수 있습니다.',
  strengthDescription: '인내심과 회복력이 뛰어나고 거친 상황에서도 침착함을 유지할 수 있습니다.',
  shadowDescription: '무조건 참는 것을 강함이라고 착각하거나 자신의 욕구를 지나치게 억누를 수 있습니다.',
  relationshipDescription: '따뜻하고 오래 버티는 힘이 크지만 상대를 이해하려다 자신의 감정을 무시하지 않아야 합니다.',
  workStyleDescription: '코칭, 조율, 서비스, 리더십처럼 사람을 움직이는 일이 잘 맞습니다.',
  growthPointDescription: '필요할 때 분명하게 말하고 쉬는 것도 힘의 일부입니다.',
  symbolismDescription: '여인이 사자의 머리와 입가를 부드럽게 다루고 머리 위에는 무한대 기호가 있습니다.',
  symbolismInterpretation: '사자를 힘으로 누르지 않는 모습은 감정과 욕망을 없애는 것이 아니라 이해하고 다루는 능력을 뜻합니다.',
  roleDescriptions: {
    birth: '내 중심에는 쉽게 꺾이지 않는 인내와 내면의 힘이 있습니다.',
    persona: '다른 사람에게는 차분하지만 강한 사람으로 보이기 쉽습니다.'
  },
  yearFlowDescription: '빠르게 밀어붙이기보다 감정과 속도를 조절하는 힘이 중요해지는 해입니다.'
}
```

Card `0` keeps `displayNumber: '0/22'`; its approved V2 title is `0 바보`, but the existing UI display policy remains `0/22 바보`.

- [ ] **Step 4: Run content and syntax tests**

Run:

```bash
node --test --test-name-pattern="complete V2 profile content" tests/script.test.js
node --check data/card-content.js
```

Expected: both commands exit 0; the focused test reports one pass.

- [ ] **Step 5: Commit the V2 data migration**

```bash
git add data/card-content.js tests/script.test.js
git commit -m "content: add tarot profile v2 copy"
```

---

### Task 2: Add pure helpers for relationship copy and detailed profile data

**Files:**
- Modify: `tests/script.test.js`
- Modify: `script.js`

- [ ] **Step 1: Write failing relationship-copy tests**

Add:

```js
test('buildProfileRelationship explains an integrated profile as one direction', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1997, month: 10, day: 17 },
    new Date('2026-04-12T00:00:00+09:00')
  );

  assert.deepEqual(tarot.buildProfileRelationship(profile), {
    variant: 'integrated',
    badge: '같은 카드, 같은 방향',
    birthLabel: '8 힘',
    personaLabel: '8 힘',
    description: '내면과 사회적 인상 모두 “거친 힘을 억누르지 않고 부드럽게 다루는 사람”이라는 같은 방향으로 이어져요.'
  });
});

test('buildProfileRelationship explains a distinct outward expression', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1993, month: 12, day: 31 },
    new Date('2026-04-12T00:00:00+09:00')
  );

  assert.deepEqual(tarot.buildProfileRelationship(profile), {
    variant: 'distinct',
    badge: '내 중심이 다른 모습으로 표현돼요',
    birthLabel: '2 여사제',
    personaLabel: '11 정의',
    description: '내면에서는 “말보다 깊은 곳에서 답을 읽는 사람”의 성향이 중심을 이루고, 사람들에게는 “감정보다 기준을 세우고 균형 있게 판단하는 사람”의 모습이 먼저 보일 수 있어요.'
  });
});
```

- [ ] **Step 2: Write failing detailed-profile normalization tests**

Add:

```js
test('getDetailedProfile selects the birth card V2 details', () => {
  const card = tarot.getCardContent(8);

  assert.deepEqual(tarot.getDetailedProfile(card), {
    strength: card.strengthDescription,
    shadow: card.shadowDescription,
    relationship: card.relationshipDescription,
    workStyle: card.workStyleDescription,
    growthPoint: card.growthPointDescription
  });
});

test('getDetailedProfile falls back to the common profile for missing fields', () => {
  assert.deepEqual(tarot.getDetailedProfile({ profileDescription: 'fallback' }), {
    strength: 'fallback',
    shadow: 'fallback',
    relationship: 'fallback',
    workStyle: 'fallback',
    growthPoint: 'fallback'
  });
});
```

- [ ] **Step 3: Run focused tests and verify they fail**

Run:

```bash
node --test --test-name-pattern="buildProfileRelationship|getDetailedProfile" tests/script.test.js
```

Expected: FAIL because both exported helpers are undefined.

- [ ] **Step 4: Implement the two pure helpers**

Add after `getRoleDescription` in `script.js`:

```js
function formatProfileCardLabel(cardContent) {
  return `${cardContent.displayNumber} ${cardContent.name}`;
}

function buildProfileRelationship(profile) {
  const birthContent = profile.birthCard.cardContent;
  const personaContent = profile.personaCard.cardContent;
  const birthLabel = formatProfileCardLabel(birthContent);
  const personaLabel = formatProfileCardLabel(personaContent);

  if (!profile.hasDistinctPersona) {
    return {
      variant: 'integrated',
      badge: '같은 카드, 같은 방향',
      birthLabel,
      personaLabel,
      description: `내면과 사회적 인상 모두 “${birthContent.tagline}”이라는 같은 방향으로 이어져요.`
    };
  }

  return {
    variant: 'distinct',
    badge: '내 중심이 다른 모습으로 표현돼요',
    birthLabel,
    personaLabel,
    description: `내면에서는 “${birthContent.tagline}”의 성향이 중심을 이루고, 사람들에게는 “${personaContent.tagline}”의 모습이 먼저 보일 수 있어요.`
  };
}

function getDetailedProfile(cardContent) {
  const fallback = cardContent?.profileDescription || '';

  return {
    strength: cardContent?.strengthDescription || fallback,
    shadow: cardContent?.shadowDescription || fallback,
    relationship: cardContent?.relationshipDescription || fallback,
    workStyle: cardContent?.workStyleDescription || fallback,
    growthPoint: cardContent?.growthPointDescription || fallback
  };
}
```

Export `buildProfileRelationship` and `getDetailedProfile` from the existing `exported` object. Keep `formatProfileCardLabel` private.

- [ ] **Step 5: Run focused and full tests**

Run:

```bash
node --test --test-name-pattern="buildProfileRelationship|getDetailedProfile" tests/script.test.js
node --test tests/script.test.js
node --check script.js
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the profile helpers**

```bash
git add script.js tests/script.test.js
git commit -m "feat: describe tarot profile relationships"
```

---

### Task 3: Add relationship, identity, navigation, and detail markup

**Files:**
- Modify: `tests/script.test.js`
- Modify: `index.html`

- [ ] **Step 1: Write a failing result-markup contract**

Replace the current result-markup test with:

```js
test('result markup exposes relationship steps and V2 detail anchors', () => {
  const slideIds = indexHtml.match(/id="item-(?:birth|persona|wing)"/g) || [];
  const steps = indexHtml.match(/class="profile-step(?: active)?"/g) || [];

  assert.deepEqual(slideIds, ['id="item-birth"', 'id="item-persona"']);
  assert.equal(steps.length, 2);
  assert.match(indexHtml, /aria-label="프로필 카드 단계"/);
  assert.match(indexHtml, /id="res-birth-tagline"/);
  assert.match(indexHtml, /id="res-birth-overview"/);
  assert.match(indexHtml, /id="res-persona-tagline"/);
  assert.match(indexHtml, /id="res-profile-relationship"/);
  assert.match(indexHtml, /id="res-relationship-badge"/);
  assert.match(indexHtml, /id="res-relationship-description"/);
  assert.match(indexHtml, /id="profile-details"/);
  assert.equal((indexHtml.match(/<details class="profile-detail"/g) || []).length, 3);
  assert.doesNotMatch(indexHtml, /res-wing|item-wing|날개 카드/);
});
```

- [ ] **Step 2: Run the markup test and verify it fails**

Run:

```bash
node --test --test-name-pattern="result markup exposes" tests/script.test.js
```

Expected: FAIL because the relationship panel, labeled steps, taglines, and details do not exist.

- [ ] **Step 3: Add birth and persona V2 anchors**

In the birth card info box, add the following before `기본 의미`:

```html
<div class="info-block identity-block">
    <h4 class="info-label">한 줄 정체성</h4>
    <p class="card-tagline" id="res-birth-tagline"></p>
</div>
<hr class="gold-divider">
```

Add the following between `기본 의미` and `그림 속 상징`:

```html
<div class="info-block overview-block">
    <h4 class="info-label">그래서 어떤 사람인가</h4>
    <p class="info-desc" id="res-birth-overview"></p>
</div>
<hr class="gold-divider">
```

In the persona info box, add only the identity block with `id="res-persona-tagline"`; do not add a persona overview anchor. This prevents the integrated profile from repeating the first slide's full overview.

- [ ] **Step 4: Add the relationship panel before the persona card visual**

Replace the existing empty `persona-state` paragraph with:

```html
<section class="profile-relationship" id="res-profile-relationship" aria-live="polite">
    <p class="relationship-badge" id="res-relationship-badge"></p>
    <div class="relationship-path" aria-label="탄생카드에서 페르소나카드로 이어지는 흐름">
        <span class="relationship-card-label" id="res-relationship-birth"></span>
        <span class="relationship-arrow" aria-hidden="true">→</span>
        <span class="relationship-card-label" id="res-relationship-persona"></span>
    </div>
    <p class="relationship-description" id="res-relationship-description"></p>
</section>
```

- [ ] **Step 5: Replace dots with labeled, interactive steps**

Replace `.swiper-dots` with:

```html
<nav class="profile-steps" aria-label="프로필 카드 단계">
    <button class="profile-step active" type="button" data-slide-index="0" aria-current="step" aria-label="내 중심 1/2">
        <span class="profile-step-number">01</span>
        <span>내 중심</span>
    </button>
    <span class="profile-step-line" aria-hidden="true"></span>
    <button class="profile-step" type="button" data-slide-index="1" aria-label="보이는 나 2/2">
        <span class="profile-step-number">02</span>
        <span>보이는 나</span>
    </button>
</nav>
```

Keep the existing swipe hint immediately below it.

- [ ] **Step 6: Add the detailed profile section before year flow**

Insert:

```html
<section class="profile-details-section" id="profile-details">
    <h3 class="section-title">나의 프로필 더 보기</h3>
    <details class="profile-detail">
        <summary>강점과 그림자</summary>
        <div class="profile-detail-content">
            <h4>강점</h4>
            <p id="res-detail-strength"></p>
            <h4>그림자</h4>
            <p id="res-detail-shadow"></p>
        </div>
    </details>
    <details class="profile-detail">
        <summary>관계와 일</summary>
        <div class="profile-detail-content">
            <h4>관계</h4>
            <p id="res-detail-relationship"></p>
            <h4>일</h4>
            <p id="res-detail-work"></p>
        </div>
    </details>
    <details class="profile-detail">
        <summary>성장 포인트</summary>
        <div class="profile-detail-content">
            <p id="res-detail-growth"></p>
        </div>
    </details>
</section>
```

- [ ] **Step 7: Run the focused test and HTML sanity checks**

Run:

```bash
node --test --test-name-pattern="result markup exposes" tests/script.test.js
rg -n "res-profile-relationship|profile-step|profile-detail" index.html
```

Expected: the test passes; `rg` shows one relationship panel, two steps, and three detail blocks.

- [ ] **Step 8: Commit the result markup**

```bash
git add index.html tests/script.test.js
git commit -m "feat: structure profile relationship results"
```

---

### Task 4: Render V2 content and synchronize the profile steps

**Files:**
- Modify: `script.js`
- Modify: `tests/script.test.js`

- [ ] **Step 1: Write a failing source contract for rendering behavior**

At the top of `tests/script.test.js`, load the script source:

```js
const scriptSource = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
```

Add:

```js
test('rendering source connects relationship, details, and profile steps', () => {
  assert.match(scriptSource, /buildProfileRelationship\(profile\)/);
  assert.match(scriptSource, /getDetailedProfile\(profile\.birthCard\.cardContent\)/);
  assert.match(scriptSource, /res-relationship-description/);
  assert.match(scriptSource, /res-detail-growth/);
  assert.match(scriptSource, /querySelectorAll\('\.profile-step'\)/);
  assert.doesNotMatch(scriptSource, /querySelectorAll\('\.dot'\)/);
});
```

- [ ] **Step 2: Run the source contract and verify it fails**

Run:

```bash
node --test --test-name-pattern="rendering source connects" tests/script.test.js
```

Expected: FAIL because the old dot selector and old renderers remain.

- [ ] **Step 3: Render tagline and overview fields**

Extend `renderCardSection` with two optional anchors:

```js
setElementText(`${prefix}-tagline`, options.tagline || cardContent.tagline || '');
setElementText(`${prefix}-overview`, options.profileDescription || cardContent.profileDescription || '');
```

The persona markup intentionally has no `res-persona-overview`, so `setElementText` safely does nothing there. Keep role descriptions in their existing role-specific anchors.

- [ ] **Step 4: Render the relationship panel**

At the start of `renderPersonaCardSection(profile)`, compute and render:

```js
const relationship = buildProfileRelationship(profile);
const relationshipElement = document.getElementById('res-profile-relationship');

setElementText('res-relationship-badge', relationship.badge);
setElementText('res-relationship-birth', relationship.birthLabel);
setElementText('res-relationship-persona', relationship.personaLabel);
setElementText('res-relationship-description', relationship.description);

if (relationshipElement) {
  relationshipElement.dataset.variant = relationship.variant;
}
```

Continue rendering `profile.personaCard` through the existing common card renderer and keep `APP_COPY.personaIntegrated.trace` for the calculation trace only. Remove writes to the deleted `res-persona-state` anchor.

- [ ] **Step 5: Render birth-card details exactly once**

Add:

```js
function renderDetailedProfileSection(profile) {
  const details = getDetailedProfile(profile.birthCard.cardContent);

  setElementText('res-detail-strength', details.strength);
  setElementText('res-detail-shadow', details.shadow);
  setElementText('res-detail-relationship', details.relationship);
  setElementText('res-detail-work', details.workStyle);
  setElementText('res-detail-growth', details.growthPoint);
}
```

Call `renderDetailedProfileSection(currentProfile)` in `handleStart` after both profile-card renderers and before `renderYearFlowSection`. Export it for direct diagnostics.

- [ ] **Step 6: Replace dot updates with labeled step updates**

Replace `updateDots` with:

```js
function updateProfileSteps(index) {
  if (typeof document === 'undefined') {
    return;
  }

  document.querySelectorAll('.profile-step').forEach((step, stepIndex) => {
    const isActive = stepIndex === index;
    step.classList.toggle('active', isActive);

    if (isActive) {
      step.setAttribute('aria-current', 'step');
    } else {
      step.removeAttribute('aria-current');
    }
  });

  document.getElementById('item-persona')?.classList.toggle('relationship-visible', index === 1);
}
```

Rename `bindSwiperDots` to `bindProfileNavigation`. Its scroll listener calls `updateProfileSteps(activeIndex)`. Also bind each `.profile-step` click to:

```js
const index = Number(step.dataset.slideIndex);
swiper.scrollTo({ left: swiper.offsetWidth * index, behavior: 'smooth' });
```

Update `initApp`, `handleStart`, and `resetView` to call `updateProfileSteps(0)`.

- [ ] **Step 7: Run focused and full regression tests**

Run:

```bash
node --test --test-name-pattern="rendering source connects" tests/script.test.js
node --test tests/script.test.js tests/generate-config.test.js
node --check script.js
```

Expected: all commands exit 0 and no test still expects `.dot`.

- [ ] **Step 8: Commit rendering and navigation**

```bash
git add script.js tests/script.test.js
git commit -m "feat: render connected tarot profiles"
```

---

### Task 5: Style relationship UI and accessible details

**Files:**
- Modify: `tests/script.test.js`
- Modify: `style.css`

- [ ] **Step 1: Write a failing CSS contract**

At the top of `tests/script.test.js`, load the stylesheet:

```js
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
```

Add:

```js
test('profile relationship styles include responsive and reduced-motion states', () => {
  assert.match(styleCss, /\.profile-relationship/);
  assert.match(styleCss, /\.profile-steps/);
  assert.match(styleCss, /\.profile-detail/);
  assert.match(styleCss, /\.relationship-visible/);
  assert.match(styleCss, /prefers-reduced-motion:\s*reduce/);
});
```

- [ ] **Step 2: Run the CSS contract and verify it fails**

Run:

```bash
node --test --test-name-pattern="profile relationship styles" tests/script.test.js
```

Expected: FAIL because the new selectors do not exist.

- [ ] **Step 3: Add component styles**

Add styles following the existing variables and card-frame vocabulary:

```css
.card-tagline {
    color: var(--text-main);
    font-size: 1.02rem;
    font-weight: 700;
    line-height: 1.65;
}

.profile-relationship {
    margin: 18px 0 22px;
    padding: 18px;
    border: 1px solid rgba(214, 178, 90, 0.48);
    border-radius: 18px;
    background: rgba(20, 8, 37, 0.72);
    box-shadow: inset 0 0 24px rgba(214, 178, 90, 0.06);
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 240ms ease, transform 240ms ease;
}

.relationship-visible .profile-relationship {
    opacity: 1;
    transform: translateY(0);
}

.relationship-badge {
    color: var(--accent-gold);
    font-size: 0.82rem;
    font-weight: 700;
    text-align: center;
}

.relationship-path {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    margin: 14px 0;
}

.relationship-card-label {
    min-width: 0;
    padding: 9px 8px;
    border-radius: 999px;
    background: rgba(214, 178, 90, 0.1);
    color: var(--text-main);
    font-size: 0.8rem;
    text-align: center;
    overflow-wrap: anywhere;
}

.relationship-arrow {
    color: var(--accent-gold);
}

.relationship-description {
    color: var(--text-soft);
    font-size: 0.9rem;
    line-height: 1.75;
}

.profile-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
}

.profile-step {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border: 0;
    background: transparent;
    color: var(--text-soft);
    font: inherit;
    cursor: pointer;
}

.profile-step.active {
    color: var(--accent-gold);
}

.profile-step-number {
    font-size: 0.7rem;
}

.profile-step-line {
    width: 34px;
    height: 1px;
    background: rgba(214, 178, 90, 0.35);
}

.profile-details-section {
    padding: 34px 20px 8px;
}

.profile-detail {
    margin-bottom: 12px;
    border: 1px solid rgba(214, 178, 90, 0.3);
    border-radius: 16px;
    background: rgba(20, 8, 37, 0.62);
    overflow: hidden;
}

.profile-detail summary {
    padding: 16px 18px;
    color: var(--text-main);
    font-weight: 700;
    cursor: pointer;
}

.profile-detail-content {
    padding: 0 18px 18px;
}

.profile-detail-content h4 {
    margin: 16px 0 6px;
    color: var(--accent-gold);
    font-size: 0.8rem;
}

.profile-detail-content p {
    color: var(--text-soft);
    font-size: 0.9rem;
    line-height: 1.75;
}

@media (prefers-reduced-motion: reduce) {
    .profile-relationship {
        transition: none;
    }
}
```

Remove obsolete `.swiper-dots`, `.dot`, and `.persona-state` rules after verifying they are unused. At `max-width: 360px`, reduce `.profile-details-section` horizontal padding and `.relationship-path` gap rather than shrinking body text.

- [ ] **Step 4: Run the CSS and full tests**

Run:

```bash
node --test --test-name-pattern="profile relationship styles" tests/script.test.js
node --test tests/script.test.js tests/generate-config.test.js
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit the visual treatment**

```bash
git add style.css tests/script.test.js
git commit -m "style: connect birth and persona results"
```

---

### Task 6: Synchronize product and content documentation

**Files:**
- Modify: `docs/content-model.md`
- Modify: `docs/content-writing-guide.md`
- Modify: `docs/content-cards.md`
- Modify: `docs/ui-ux-spec.md`
- Modify: `docs/requirements.md`
- Modify: `docs/implementation-checklist.md`

- [ ] **Step 1: Replace the card-content reference with the approved V2 source**

For each card section in `docs/content-cards.md`, use exactly this heading order:

```markdown
## 8 힘 · Strength

**한 줄 정체성:** 거친 힘을 억누르지 않고 부드럽게 다루는 사람

**기본 의미:** 인내, 내면의 힘, 조절, 용기, 회복력

**그래서 어떤 사람인가**
겉보다 속이 훨씬 단단하고 어려운 상황에서도 쉽게 무너지지 않는 편입니다. 사람을 억누르기보다 부드럽게 설득하고 조율하는 힘이 있으며 시간이 걸려도 꾸준히 버틸 수 있습니다. 다만 참는 힘이 강한 만큼 감정을 너무 오래 눌러두면 어느 순간 한꺼번에 터질 수 있습니다.

**강점:** 인내심과 회복력이 뛰어나고 거친 상황에서도 침착함을 유지할 수 있습니다.
**그림자:** 무조건 참는 것을 강함이라고 착각하거나 자신의 욕구를 지나치게 억누를 수 있습니다.
**관계:** 따뜻하고 오래 버티는 힘이 크지만 상대를 이해하려다 자신의 감정을 무시하지 않아야 합니다.
**일:** 코칭, 조율, 서비스, 리더십처럼 사람을 움직이는 일이 잘 맞습니다.
**성장 포인트:** 필요할 때 분명하게 말하고 쉬는 것도 힘의 일부입니다.

**그림 속 상징:** 여인이 사자의 머리와 입가를 부드럽게 다루고 머리 위에는 무한대 기호가 있습니다.
**왜 이렇게 읽을까요?:** 사자를 힘으로 누르지 않는 모습은 감정과 욕망을 없애는 것이 아니라 이해하고 다루는 능력을 뜻합니다.

**탄생카드:** 내 중심에는 쉽게 꺾이지 않는 인내와 내면의 힘이 있습니다.
**페르소나:** 다른 사람에게는 차분하지만 강한 사람으로 보이기 쉽습니다.
**연도 카드:** 빠르게 밀어붙이기보다 감정과 속도를 조절하는 힘이 중요해지는 해입니다.
```

Transcribe the exact approved V2 text for cards 0 through 21. Retain the existing source note explaining that the RWS symbolism is referenced while birth/persona roles are service-specific.

- [ ] **Step 2: Document the data and copy model**

In `docs/content-model.md`, add all six new fields, state that they are required for 0~21, and document `buildProfileRelationship`'s integrated/distinct output. Update the birth role rule from `1~9에 제공` to `0~21에 보관하되 현재 결과에서는 1~9만 사용`.

In `docs/content-writing-guide.md`, add concise rules:

```markdown
- 강점은 실제 행동에서 드러나는 자원으로 쓴다.
- 그림자는 강점이 과해질 때의 부담으로 연결하고 낙인처럼 쓰지 않는다.
- 관계와 일은 특정 결말이나 직업을 단정하지 않는다.
- 성장 포인트는 사용자가 선택할 수 있는 균형점으로 마무리한다.
- 통합형은 일관된 표현, 분리형은 변환된 표현으로 설명한다.
```

- [ ] **Step 3: Document the result interaction**

Update `docs/ui-ux-spec.md` and `docs/requirements.md` with:

- first slide `내 중심`, second slide `보이는 나`
- relationship badge, card-to-card path, and relationship description appear on slide two
- three collapsed details blocks appear below the swiper
- labeled steps replace unlabeled dots and remain synchronized with swipe
- reduced-motion and 320px overflow requirements
- integrated profiles omit the repeated common overview on slide two

- [ ] **Step 4: Update the implementation checklist**

Add checkboxes for:

```markdown
- [x] 카드 콘텐츠 V2 필드와 원문 반영
- [x] 통합형·분리형 관계 패널
- [x] `내 중심` / `보이는 나` 단계 표시
- [x] 강점·그림자·관계·일·성장 상세 아코디언
- [ ] 320px / 360px / 430px 최종 모바일 QA
```

Only mark the browser QA item complete after Task 7.

- [ ] **Step 5: Scan for stale language and formatting errors**

Run:

```bash
rg -n "swiper-dots|페르소나 없음|가면이 없|이중적|세 장|3장" README.md AGENTS.md docs index.html script.js style.css
git diff --check
```

Expected: no active requirement describes dots, missing persona, three result slides, or the rejected identity framing. Historical design/plan documents may contain intentional references and should not be rewritten solely to silence the scan.

- [ ] **Step 6: Commit synchronized documentation**

```bash
git add docs/content-model.md docs/content-writing-guide.md docs/content-cards.md docs/ui-ux-spec.md docs/requirements.md docs/implementation-checklist.md
git commit -m "docs: document tarot profile content v2"
```

---

### Task 7: Run full automated and browser verification

**Files:**
- Modify if QA reveals a defect: `index.html`, `script.js`, `style.css`, `data/card-content.js`, `tests/script.test.js`
- Modify after successful QA: `docs/implementation-checklist.md`

- [ ] **Step 1: Run the complete automated verification suite**

Run:

```bash
node --test tests/script.test.js tests/generate-config.test.js
node --check script.js
node --check data/card-content.js
git diff --check
```

Expected: all tests pass with zero failures and every command exits 0.

- [ ] **Step 2: Start a local static server**

Run:

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```

Open `http://127.0.0.1:4175` with the Playwright skill.

- [ ] **Step 3: Verify an integrated profile**

At 360×800, enter `1997 / 10 / 17` and verify:

- birth and persona are both `8 힘`
- the second step becomes active after swipe or click
- badge is `같은 카드, 같은 방향`
- path is `8 힘 → 8 힘`
- relationship description contains the Strength tagline
- the second slide does not repeat `그래서 어떤 사람인가`
- all three details show Strength content when expanded
- restart returns to the landing screen and resets the first step

- [ ] **Step 4: Verify a distinct profile**

At 360×800, enter `1993 / 12 / 31` and verify:

- birth is `2 여사제`, persona is `11 정의`
- badge is `내 중심이 다른 모습으로 표현돼요`
- path is `2 여사제 → 11 정의`
- relationship description includes both approved taglines
- persona symbolism and role copy belong to Justice
- detailed profile content still belongs to the birth card, High Priestess

- [ ] **Step 5: Verify responsive, details, and accessibility behavior**

Repeat overflow checks at 320×800 and 430×850:

```js
({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  stepCount: document.querySelectorAll('.profile-step').length,
  detailCount: document.querySelectorAll('.profile-detail').length
})
```

Expected: `innerWidth === scrollWidth`, `stepCount === 2`, and `detailCount === 3` at each width. Use keyboard focus and Enter/Space to activate both step buttons and each `<summary>`. Emulate reduced motion and verify the relationship panel has no transition.

- [ ] **Step 6: Verify the existing share flow**

Use the share button once. If Kakao SDK configuration is unavailable, verify the existing native-share or clipboard fallback feedback. Do not send a real share message during QA.

- [ ] **Step 7: Mark mobile QA complete and commit only if the checklist changed**

Change the final mobile QA checkbox in `docs/implementation-checklist.md` from `[ ]` to `[x]`, then run:

```bash
git add docs/implementation-checklist.md
git commit -m "docs: record profile v2 mobile qa"
```

- [ ] **Step 8: Re-run verification after every QA fix and inspect the branch**

Run:

```bash
node --test tests/script.test.js tests/generate-config.test.js
node --check script.js
node --check data/card-content.js
git diff --check
git status -sb
git log --oneline main..HEAD
```

Expected: zero failures, clean syntax and whitespace, a clean feature branch, and small commits matching the tasks above.

---

## Execution notes

- Keep `index.html / script.js / style.css`; do not introduce a framework.
- Do not change birth, persona, or year-card calculation rules.
- Do not rename existing card image files or change `CARD_IMAGE_FILES`.
- Preserve Kakao share fallback behavior.
- Avoid a new 22×22 relationship-copy matrix; approved taglines provide deterministic relationship copy.
- The existing open PR for `feat/card-symbolism-content` should remain open during implementation and receive the new commits after final verification.
