# Card Symbolism Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the custom wing-card concept, represent missing two-digit persona results as an integrated birth/persona type, and explain every Major Arcana image through visible symbols and role-specific profile copy.

**Architecture:** Keep the static `index.html / script.js / style.css` structure and existing calculation rules for birth, persona, and year cards. Extend card data with one shared symbolism interpretation plus birth/persona role descriptions, expose explicit persona state on the built profile, and render a two-slide result flow. Update normative documentation in the same branch while preserving historical completed plans.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, Node.js built-in test runner

---

## File map

- Modify `data/card-content.js`: add symbolism interpretations, role descriptions, and integrated-persona copy; remove wing copy.
- Modify `script.js`: remove wing calculation/rendering, add explicit persona state, and render role-specific content.
- Modify `index.html`: reduce result swiper to birth/persona and add symbolism interpretation blocks.
- Modify `style.css`: style integrated-persona state and new explanation block without redesigning the result screen.
- Modify `tests/script.test.js`: define profile, content-contract, and two-slide regressions.
- Modify `AGENTS.md`, `README.md`, and active `docs/*.md`: synchronize the two-card policy and integrated persona terminology.
- Preserve existing `docs/superpowers/plans/*.md`: these are historical implementation records.

### Task 1: Define integrated persona profile state and remove wing calculation

**Files:**
- Modify: `tests/script.test.js:66-90`
- Modify: `script.js:104-139`
- Modify: `script.js:220-265`
- Modify: `script.js:702-725`

- [ ] **Step 1: Replace the wing test with failing profile-state tests**

Add these tests after the existing persona reduction tests:

```js
test('buildTarotProfile reuses the birth card for an integrated persona result', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1997, month: 10, day: 17 },
    new Date('2026-09-01T00:00:00+09:00')
  );

  assert.equal(profile.personaNumber, null);
  assert.equal(profile.hasDistinctPersona, false);
  assert.equal(profile.personaCard, profile.birthCard);
  assert.equal(profile.personaCard.canonicalNumber, 8);
  assert.equal('wingNumber' in profile, false);
  assert.equal('wingCard' in profile, false);
});

test('buildTarotProfile keeps a distinct two-digit persona card', () => {
  const profile = tarot.buildTarotProfile(
    { year: 1993, month: 12, day: 31 },
    new Date('2026-09-01T00:00:00+09:00')
  );

  assert.equal(profile.personaNumber, 11);
  assert.equal(profile.hasDistinctPersona, true);
  assert.equal(profile.personaCard.canonicalNumber, 11);
  assert.notEqual(profile.personaCard, profile.birthCard);
});
```

Delete the test named `getWingCard wraps 1 to 0`.

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="buildTarotProfile" tests/script.test.js
```

Expected: FAIL because `hasDistinctPersona` and `personaCard` do not exist and the profile still contains wing fields.

- [ ] **Step 3: Implement the minimal profile model**

Delete `getWingCard`. In `buildTarotProfile`, replace wing construction with:

```js
const personaNumber = getPersonaCard(birthReduction);
const hasDistinctPersona = personaNumber !== null;
const personaCard = hasDistinctPersona ? getCardContent(personaNumber) : birthCard;
```

Return these fields:

```js
return {
  birthDate: parsedDate,
  birthReduction,
  birthCard,
  personaNumber,
  personaCard,
  hasDistinctPersona,
  years
};
```

Remove `getWingCard` from the CommonJS/browser export object.

- [ ] **Step 4: Run the focused and complete test suites**

Run:

```bash
node --test --test-name-pattern="buildTarotProfile" tests/script.test.js
node --test tests/script.test.js
```

Expected: both commands PASS.

- [ ] **Step 5: Commit the profile-model change**

```bash
git add script.js tests/script.test.js
git commit -m "refactor: replace wing card with persona state"
```

### Task 2: Add and validate the card-content contract

**Files:**
- Modify: `tests/script.test.js`
- Modify: `data/card-content.js:8-253`

- [ ] **Step 1: Write failing content-contract tests**

Add:

```js
test('every Major Arcana card explains its symbols and persona expression', () => {
  for (let number = 0; number <= 21; number += 1) {
    const card = tarot.getCardContent(number);

    assert.equal(typeof card.symbolismInterpretation, 'string', `card ${number} interpretation`);
    assert.ok(card.symbolismInterpretation.length >= 45, `card ${number} interpretation length`);
    assert.equal(typeof card.roleDescriptions?.persona, 'string', `card ${number} persona`);
    assert.ok(card.roleDescriptions.persona.length >= 45, `card ${number} persona length`);
  }
});

test('birth cards 1 through 9 have birth-specific profile descriptions', () => {
  for (let number = 1; number <= 9; number += 1) {
    const card = tarot.getCardContent(number);

    assert.equal(typeof card.roleDescriptions?.birth, 'string', `card ${number} birth`);
    assert.ok(card.roleDescriptions.birth.length >= 45, `card ${number} birth length`);
  }
});
```

- [ ] **Step 2: Run the content tests and verify failure**

Run:

```bash
node --test --test-name-pattern="Major Arcana|birth cards" tests/script.test.js
```

Expected: FAIL because `symbolismInterpretation` and `roleDescriptions` are absent.

- [ ] **Step 3: Verify the image/source basis before writing**

Use the existing `img/00-TheFool.png` through `img/21-TheWorld.png` assets as the visual source. Cross-check ambiguous details against A. E. Waite's public-domain *The Pictorial Key to the Tarot* at:

```text
https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot
```

Keep the visible-object descriptions in `symbolismDescription`. Put the link between those objects and the service interpretation in `symbolismInterpretation`. Do not present the birth/persona calculation labels as Waite's system.

- [ ] **Step 4: Add exact symbolism interpretations for cards 0-10**

Add each value as `symbolismInterpretation` immediately after `symbolismDescription`:

```text
0 바보: 절벽은 아직 확인하지 못한 세계와 위험을 함께 보여주고, 가벼운 배낭은 과거의 짐보다 가능성을 앞세우는 태도를 나타낸다. 흰 장미와 강아지는 순수한 의도와 현실적인 경고가 함께한다는 뜻이라, 이 카드는 자유로운 시작과 준비의 균형으로 읽힌다.
1 마법사: 위를 향한 손과 아래를 가리키는 손은 생각이나 영감을 현실의 행동으로 연결하는 모습을 만든다. 네 가지 수트가 이미 탁자에 놓여 있기 때문에, 부족한 재능을 기다리기보다 가진 자원을 조합해 시작하는 실행력으로 읽힌다.
2 여사제: 서로 반대되는 두 기둥은 한쪽만으로 판단할 수 없는 세계를, 장막은 아직 드러나지 않은 정보를 나타낸다. 여사제가 그 경계에 조용히 앉아 있어, 이 카드는 즉시 행동하기보다 관찰과 직관으로 안쪽의 답을 읽는 힘과 연결된다.
3 여황제: 밀밭과 숲, 흐르는 물은 억지로 밀어붙이지 않아도 생명이 자라고 결실을 맺는 환경을 보여준다. 편안한 자세와 풍성한 자연이 돌봄과 감각을 강조하기 때문에, 창조하고 키우며 누릴 줄 아는 힘으로 읽힌다.
4 황제: 돌 왕좌와 메마른 산은 감정보다 쉽게 무너지지 않는 구조와 경계를 먼저 떠올리게 한다. 갑옷을 입은 채 왕좌를 지키는 모습에서 보호와 통제가 동시에 보이므로, 책임 있는 질서가 강점이지만 경직될 수도 있는 카드로 읽힌다.
5 교황: 두 제자와 교차된 열쇠는 혼자 얻는 깨달음보다 전승되는 지식과 공동체의 문을 나타낸다. 축복하는 손과 공식적인 복장은 경험을 규칙과 언어로 전달하는 역할을 강조해, 배움과 가르침, 제도 안의 연결로 이어진다.
6 연인: 두 사람의 시선이 서로에게서 천사로 이어지는 구도는 끌림만이 아니라 더 높은 가치와 선택을 함께 묻는다. 서로 다른 나무와 그 사이에 선 인물들은 관계가 각자의 욕망과 기준을 드러내는 장면임을 보여주므로, 사랑과 선택의 카드로 읽힌다.
7 전차: 반대 색의 스핑크스는 서로 다른 욕구와 방향을 나타내지만 전차병은 고삐 없이 한 길을 향한다. 힘으로 억누르기보다 목표와 의지로 상반된 에너지를 모으는 모습이어서, 방향이 분명할 때 발휘되는 추진력으로 읽힌다.
8 힘: 여인이 사자를 해치지 않고 부드럽게 다루는 장면은 본능을 없애는 대신 관계를 맺고 조절하는 태도를 보여준다. 머리 위 무한대 기호가 지속성을 더하기 때문에, 순간적인 완력보다 오래 유지되는 인내와 회복력으로 읽힌다.
9 은둔자: 등불은 산 전체가 아니라 바로 앞의 작은 범위만 비추고, 지팡이는 한 걸음씩 균형을 잡게 한다. 홀로 높은 곳에 선 모습이 외부의 속도보다 내면의 기준을 찾는 시간을 강조해, 깊은 탐구와 신중한 안내로 연결된다.
10 운명의 수레바퀴: 바퀴 둘레의 여러 존재는 올라감과 내려감이 한 흐름 안에서 반복된다는 사실을 보여준다. 중심은 유지되지만 가장자리는 계속 움직이는 구조이므로, 모든 것을 통제하기보다 변화를 읽고 적절한 때에 대응하는 힘으로 해석된다.
```

- [ ] **Step 5: Add exact symbolism interpretations for cards 11-21**

```text
11 정의: 한 손의 저울은 여러 조건을 비교하는 과정이고, 다른 손의 곧은 칼은 비교 뒤에 내려야 하는 분명한 결론이다. 두 기둥 사이의 정면 자세까지 더해져, 감정에 치우치지 않고 선택의 결과를 책임지는 균형으로 읽힌다.
12 매달린 사람: 인물은 거꾸로 매달렸지만 표정은 고통보다 평온에 가깝고 머리 주변에는 빛이 있다. 움직일 수 없는 시간이 시야를 뒤집어 새로운 이해를 만든다는 구도라서, 수동적인 실패보다 자발적 멈춤과 관점 전환으로 읽힌다.
13 죽음: 흰 장미 깃발을 든 기사가 지나가고, 멀리서는 두 탑 사이로 해가 떠오른다. 지위와 나이에 관계없이 끝을 피할 수 없는 장면이지만 새로운 빛도 함께 보여, 물리적인 죽음의 예언보다 한 단계의 종료와 변형으로 해석된다.
14 절제: 천사의 한 발은 물에, 다른 발은 땅에 놓이고 두 컵 사이의 물은 끊기지 않고 흐른다. 서로 다른 상태를 오가면서도 어느 한쪽에 빠지지 않는 모습이므로, 극단을 피하는 소극성보다 새로운 균형을 만드는 조율과 통합으로 읽힌다.
15 악마: 두 사람을 묶은 사슬은 느슨해 보이지만 인물들은 그 자리에 머물러 있다. 빠져나갈 가능성이 있는데도 익숙한 욕망에 붙들린 구도라서, 외부의 악보다 스스로 반복하는 집착과 그 안에 묶인 힘을 알아차리는 카드로 읽힌다.
16 탑: 번개는 탑의 꼭대기를 갑자기 열어젖히고 왕관과 사람들이 함께 떨어진다. 단단해 보이던 구조도 잘못된 기반 위에서는 한순간에 무너질 수 있다는 장면이어서, 단순한 불운보다 감춰진 문제의 폭로와 강제적인 재정비로 읽힌다.
17 별: 여인은 물을 연못과 땅에 나누어 붓고, 작은 별들은 큰 별 주위를 밝힌다. 감정의 근원과 현실의 땅을 동시에 돌보는 장면이 탑 이후의 고요한 회복을 보여주므로, 과장된 낙관보다 다시 방향을 믿고 생기를 되찾는 희망으로 읽힌다.
18 달: 달빛 아래에는 길이 이어지지만 끝이 선명하지 않고, 길 양쪽의 개와 늑대는 익숙함과 야생의 반응을 함께 드러낸다. 물에서 올라오는 가재까지 무의식의 움직임을 강조해, 직감이 예민해지는 만큼 불안과 착각도 확인해야 하는 카드로 읽힌다.
19 태양: 커다란 태양 아래 아이는 가림 없이 드러나 있고, 흰 말과 해바라기는 생명력과 성장을 밝게 보여준다. 숨겨진 것이 거의 없는 장면이어서, 모호함이 걷힌 뒤의 기쁨과 자신감, 다른 사람과 나눌 수 있는 명확한 성취로 읽힌다.
20 심판: 천사의 나팔 소리에 사람들이 관에서 일어나 같은 방향을 바라본다. 과거의 상태에 머무르지 않고 부름에 응답하는 장면이므로, 벌을 받는 심판보다 지난 경험을 재평가하고 새로운 단계로 일어나는 각성으로 읽힌다.
21 세계: 인물을 감싸는 타원형 화환은 하나의 순환이 완성되었음을 보여주고, 네 모서리의 존재는 서로 다른 요소가 함께 자리 잡은 상태를 나타낸다. 중심의 인물이 움직임을 멈추지 않아, 끝에 고정되는 완벽보다 경험을 통합하고 다음 순환으로 확장하는 완성으로 읽힌다.
```

- [ ] **Step 6: Add role descriptions**

For cards 1-9, add the exact `roleDescriptions.birth` values below:

```text
1 마법사: 내 중심에는 생각을 행동으로 옮기는 실행력이 있습니다. 가진 도구를 빠르게 조합해 시작하는 편입니다. 다만 속도만 앞서지 않도록 점검과 마무리의 균형을 함께 챙겨야 합니다.
2 여사제: 내 중심에는 서두르지 않고 안쪽의 답을 듣는 직관이 있습니다. 충분히 관찰한 뒤 확신이 생길 때 움직이는 편입니다. 다만 침묵이 거리감이 되지 않도록 필요한 마음은 표현하는 것이 좋습니다.
3 여황제: 내 중심에는 생명력과 가능성을 키우는 돌봄의 힘이 있습니다. 감각과 관계를 풍성하게 가꾸면서 자연스럽게 결과를 만듭니다. 다만 다른 사람을 돌보듯 자신의 리듬도 함께 보살펴야 합니다.
4 황제: 내 중심에는 흔들리지 않는 기준과 책임감이 있습니다. 구조를 세우고 지킬 것을 보호할 때 힘이 잘 드러납니다. 다만 원칙 안에 다른 사람과 상황이 들어올 유연성을 남겨두는 것이 중요합니다.
5 교황: 내 중심에는 배움을 기준으로 정리하고 전하는 힘이 있습니다. 지식과 사람을 연결하며 함께 성장할 때 보람을 느끼는 편입니다. 다만 익숙한 규칙이 지금의 내 가치와도 맞는지 확인해야 합니다.
6 연인: 내 중심에는 관계 속에서 진심과 가치를 선택하는 힘이 있습니다. 연결을 통해 자신의 마음과 기준을 더 선명하게 이해합니다. 다만 다른 사람의 마음과 자신의 선택을 구분하는 연습이 필요합니다.
7 전차: 내 중심에는 서로 다른 욕구를 한 방향으로 모으는 의지가 있습니다. 목표가 생기면 행동으로 길을 열고 앞으로 나아갑니다. 다만 속도를 붙이기 전에 무엇을 향해 가는지 먼저 확인해야 합니다.
8 힘: 내 중심에는 본능과 감정을 부드럽게 다루는 내면의 힘이 있습니다. 오래 버티면서 주변의 긴장을 조율하는 편입니다. 다만 참는 것과 솔직히 표현하는 힘을 함께 길러야 합니다.
9 은둔자: 내 중심에는 혼자 깊이 들어가 본질을 찾는 탐구심이 있습니다. 충분히 생각한 뒤 경험 속에서 자신만의 답을 길어 올립니다. 다만 성찰이 고립으로 굳어지지 않도록 필요한 연결을 유지해야 합니다.
```

For every card 0-21, add the exact `roleDescriptions.persona` values below. Cards 1-9 contain both role keys; the remaining cards contain the persona key only:

```text
0 바보: 다른 사람에게는 자유롭게 시작하는 사람으로 보이기 쉽습니다. 새로운 가능성을 먼저 발견하고 분위기를 가볍게 여는 역할을 맡기도 합니다. 다만 그 이미지가 강하면 신중하지 않거나 준비가 부족하다는 오해를 받을 수 있습니다.
1 마법사: 다른 사람에게는 아이디어를 현실로 옮기는 사람으로 보이기 쉽습니다. 시작하고 설명하고 설득하는 역할을 기대받기도 합니다. 다만 그 모습에 오래 머물면 모든 일을 혼자 해결해야 한다는 부담이 생길 수 있습니다.
2 여사제: 다른 사람에게는 조용히 흐름을 읽는 사람으로 보이기 쉽습니다. 말보다 분위기를 살피고 신중하게 판단하는 역할을 맡기도 합니다. 다만 표현이 적으면 속마음을 알기 어렵다는 거리감이 생길 수 있습니다.
3 여황제: 다른 사람에게는 편안함과 성장을 만드는 사람으로 보이기 쉽습니다. 사람이나 일을 돌보고 키우는 역할을 기대받기도 합니다. 다만 늘 베풀고 보살펴야 한다는 부담까지 떠안을 필요는 없습니다.
4 황제: 다른 사람에게는 기준이 분명하고 든든한 사람으로 보이기 쉽습니다. 구조를 세우고 책임지는 역할을 맡기도 합니다. 다만 단단한 모습이 강해지면 통제적으로 보일 수 있습니다.
5 교황: 다른 사람에게는 믿을 만한 기준을 전하는 사람으로 보이기 쉽습니다. 지식과 사람을 연결하고 조언하는 역할을 기대받기도 합니다. 다만 언제나 정답을 알아야 한다는 부담을 안을 수 있습니다.
6 연인: 다른 사람에게는 관계를 소중히 여기고 다정한 사람으로 보이기 쉽습니다. 서로의 입장을 연결하고 선택을 돕는 역할을 맡기도 합니다. 다만 모두를 만족시켜야 한다는 부담까지 질 필요는 없습니다.
7 전차: 다른 사람에게는 목표를 향해 빠르게 움직이는 사람으로 보이기 쉽습니다. 방향을 정하고 추진하는 역할을 기대받기도 합니다. 다만 쉬지 않고 성과를 내야 한다는 압박으로 이어질 수 있습니다.
8 힘: 다른 사람에게는 차분하지만 속이 단단한 사람으로 보이기 쉽습니다. 감정을 조율하고 어려운 상황을 버텨주는 역할을 맡기도 합니다. 다만 힘든 순간에도 계속 참아야 한다는 부담을 안을 수 있습니다.
9 은둔자: 다른 사람에게는 깊이 생각하고 본질을 찾는 사람으로 보이기 쉽습니다. 전문적으로 탐구하고 조언하는 역할을 기대받기도 합니다. 다만 혼자 해결하려는 모습이 길어지면 고립될 수 있습니다.
10 운명의 수레바퀴: 다른 사람에게는 변화의 타이밍을 잘 읽는 사람으로 보이기 쉽습니다. 전환기에 기회를 발견하고 흐름을 바꾸는 역할을 맡기도 합니다. 다만 변화가 잦으면 일관되지 않다는 오해를 받을 수 있습니다.
11 정의: 다른 사람에게는 공정하고 기준이 분명한 사람으로 보이기 쉽습니다. 여러 조건을 비교하고 판단하며 균형을 잡는 역할을 기대받기도 합니다. 다만 감정보다 원칙만 본다는 오해를 받을 수 있습니다.
12 매달린 사람: 다른 사람에게는 남들과 다른 관점을 가진 사람으로 보이기 쉽습니다. 서두르지 않고 새로운 시각을 제시하는 역할을 맡기도 합니다. 다만 충분히 생각하는 시간이 결정이 느리다는 오해로 이어질 수 있습니다.
13 죽음: 다른 사람에게는 오래된 것을 정리할 줄 아는 사람으로 보이기 쉽습니다. 변화가 필요한 순간 결단하고 다음 단계로 넘기는 역할을 맡기도 합니다. 다만 정리하는 힘이 차갑고 단호하게 보일 수 있습니다.
14 절제: 다른 사람에게는 분위기를 부드럽게 조율하는 사람으로 보이기 쉽습니다. 다른 의견과 속도를 연결하는 역할을 기대받기도 합니다. 다만 조율에 집중하다 자신의 결정을 미루는 부담이 생길 수 있습니다.
15 악마: 다른 사람에게는 강한 몰입과 매력을 가진 사람으로 보이기 쉽습니다. 욕망을 성과와 영향력으로 바꾸는 역할을 맡기도 합니다. 다만 집중력이 강할수록 집착하거나 과하다는 오해를 받을 수 있습니다.
16 탑: 다른 사람에게는 문제를 숨기지 않고 드러내는 사람으로 보이기 쉽습니다. 낡은 구조를 깨고 재정비하는 역할을 맡기도 합니다. 다만 변화의 방식이 거칠고 갑작스럽다는 부담이 생길 수 있습니다.
17 별: 다른 사람에게는 맑은 희망과 영감을 주는 사람으로 보이기 쉽습니다. 지친 분위기에 방향과 생기를 더하는 역할을 기대받기도 합니다. 다만 현실보다 이상을 앞세운다는 오해를 받을 수 있습니다.
18 달: 다른 사람에게는 감정과 분위기에 민감한 사람으로 보이기 쉽습니다. 말로 드러나지 않은 흐름을 감지하는 역할을 맡기도 합니다. 다만 섬세한 관찰이 예민하거나 확신이 없다는 오해로 이어질 수 있습니다.
19 태양: 다른 사람에게는 밝고 솔직하며 자신감 있는 사람으로 보이기 쉽습니다. 분위기를 열고 성과를 드러내는 역할을 기대받기도 합니다. 다만 언제나 긍정적이어야 한다는 부담을 안을 수 있습니다.
20 심판: 다른 사람에게는 중요한 순간을 깨우는 사람으로 보이기 쉽습니다. 지난 경험을 정리하고 결단을 촉진하는 역할을 맡기도 합니다. 다만 자신과 타인을 엄격하게 평가한다는 오해를 받을 수 있습니다.
21 세계: 다른 사람에게는 큰 그림을 보고 완성하는 사람으로 보이기 쉽습니다. 서로 다른 경험을 통합하고 마무리하는 역할을 기대받기도 합니다. 다만 언제나 완벽한 결과를 내야 한다는 부담이 생길 수 있습니다.
```

- [ ] **Step 7: Run content tests and syntax checks**

Run:

```bash
node --test --test-name-pattern="Major Arcana|birth cards" tests/script.test.js
node --check data/card-content.js
```

Expected: PASS with no syntax output.

- [ ] **Step 8: Commit the content data**

```bash
git add data/card-content.js tests/script.test.js
git commit -m "content: explain Major Arcana symbolism"
```

### Task 3: Render two profile cards and integrated persona content

**Files:**
- Modify: `tests/script.test.js`
- Modify: `index.html:72-190`
- Modify: `script.js:176-205`
- Modify: `script.js:280-410`
- Modify: `script.js:630-650`
- Modify: `script.js:702-725`
- Modify: `style.css:299-531`

- [ ] **Step 1: Add failing DOM structure and role-description tests**

At the top of `tests/script.test.js`, import the HTML source:

```js
const fs = require('node:fs');
const path = require('node:path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
```

Add:

```js
test('result markup contains two slides and symbolism interpretation anchors', () => {
  const slideIds = indexHtml.match(/id="item-(?:birth|persona|wing)"/g) || [];
  const dots = indexHtml.match(/class="dot(?: active)?"/g) || [];

  assert.deepEqual(slideIds, ['id="item-birth"', 'id="item-persona"']);
  assert.equal(dots.length, 2);
  assert.match(indexHtml, /id="res-birth-symbolism-interpretation"/);
  assert.match(indexHtml, /id="res-persona-symbolism-interpretation"/);
  assert.doesNotMatch(indexHtml, /res-wing|item-wing|날개 카드/);
});

test('getRoleDescription selects role copy and falls back to the common profile', () => {
  const card = tarot.getCardContent(8);

  assert.equal(tarot.getRoleDescription(card, 'birth'), card.roleDescriptions.birth);
  assert.equal(tarot.getRoleDescription(card, 'persona'), card.roleDescriptions.persona);
  assert.equal(
    tarot.getRoleDescription({ profileDescription: 'fallback' }, 'persona'),
    'fallback'
  );
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="result markup|getRoleDescription" tests/script.test.js
```

Expected: FAIL because the third slide remains, the new anchors are absent, and `getRoleDescription` is undefined.

- [ ] **Step 3: Add content selection helpers**

Add to `script.js` after `getCardContent`:

```js
function getRoleDescription(cardContent, role) {
  return cardContent.roleDescriptions?.[role] || cardContent.profileDescription || '';
}
```

Add `symbolismInterpretation` and empty `roleDescriptions` to the unknown-card fallback object. Export `getRoleDescription`.

- [ ] **Step 4: Update the two-slide HTML**

For birth and persona cards, rename `카드 설명` to `그림 속 상징`. After each symbolism paragraph add:

```html
<hr class="gold-divider">
<div class="info-block interpretation-block">
    <h4 class="info-label">왜 이렇게 읽을까요?</h4>
    <p class="info-desc" id="res-birth-symbolism-interpretation"></p>
</div>
```

Use `res-persona-symbolism-interpretation` on the persona slide. Change profile headings to `내 중심에서 나타나는 모습` and `다른 사람에게 보이는 모습`. Add this under the persona type definition:

```html
<p class="persona-state" id="res-persona-state"></p>
```

Delete the complete `item-wing` slide and the third navigation dot.

- [ ] **Step 5: Update rendering**

In `renderCardSection`, add:

```js
setElementText(
  `${prefix}-symbolism-interpretation`,
  options.symbolismInterpretation || cardContent.symbolismInterpretation || ''
);
setElementText(
  `${prefix}-profile`,
  options.profileDescription || getRoleDescription(cardContent, options.role)
);
```

Pass `role: 'birth'` in `renderBirthCardSection`.

Replace `renderPersonaCardSection` with:

```js
function renderPersonaCardSection(profile) {
  const isIntegrated = !profile.hasDistinctPersona;
  const trace = isIntegrated
    ? '중간 축약 과정에서 별도의 두 자리 카드가 나오지 않아 탄생카드와 같은 카드로 읽습니다.'
    : `탄생카드 축약 과정에서 ${formatReducedValue(profile.birthReduction.personaRaw)}이 나타나 페르소나 카드로 읽습니다.`;

  setElementText('res-persona-state', isIntegrated ? '탄생·페르소나 통합형' : '');
  renderCardSection('res-persona', APP_COPY.persona, profile.personaCard, {
    role: 'persona',
    trace
  });

  const item = document.getElementById('item-persona');
  if (item) {
    item.classList.toggle('is-integrated', isIntegrated);
  }
}
```

Delete `createPersonaFallbackCard` and `renderWingCardSection`. Remove the wing render call in `handleStart` and remove the wing renderer export.

- [ ] **Step 6: Add minimal integrated-state styling**

Replace `.is-empty .card-visual` with:

```css
.persona-state {
    min-height: 1.3rem;
    color: var(--accent-gold);
    font-size: 0.78rem;
    line-height: 1.5;
    text-align: center;
}

.is-integrated .card-visual {
    box-shadow: 0 0 34px rgba(212, 175, 55, 0.22);
}

.interpretation-block .info-desc {
    color: var(--text-main);
}
```

Keep `.is-hidden` because image fallback still uses it.

- [ ] **Step 7: Run tests and syntax checks**

Run:

```bash
node --test tests/script.test.js
node --check script.js
node --check data/card-content.js
```

Expected: all tests PASS and syntax checks produce no output.

- [ ] **Step 8: Commit the two-card UI**

```bash
git add index.html script.js style.css tests/script.test.js
git commit -m "feat: show birth and persona profile cards"
```

### Task 4: Synchronize active product documentation

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/README.md`
- Modify: `docs/product-overview.md`
- Modify: `docs/requirements.md`
- Modify: `docs/calculation-rules.md`
- Modify: `docs/content-model.md`
- Modify: `docs/content-writing-guide.md`
- Modify: `docs/ui-ux-spec.md`
- Modify: `docs/technical-plan.md`
- Modify: `docs/content-cards.md`
- Modify: `docs/implementation-checklist.md`

- [ ] **Step 1: Update normative card-role language**

Apply these exact policy statements consistently:

```text
결과 프로필은 탄생카드와 페르소나 카드 두 층위로 구성한다.
중간 축약 과정에서 10~22가 나오지 않으면 별도 페르소나가 없는 것이 아니라 탄생카드와 같은 카드로 이어지는 '탄생·페르소나 통합형'으로 표시한다.
날개 카드는 현재 제품 모델과 계산 결과에서 사용하지 않는다.
```

Delete active requirements and checklist items for `탄생카드 - 1`, wing rendering, three-card swiping, and persona empty/hidden states. Change screen descriptions to two-slide swiping. Preserve historical plan files.

- [ ] **Step 2: Update the calculation examples**

In `docs/calculation-rules.md`, keep the same five birth/persona examples but remove every wing result. For `1997.10.17`, replace `페르소나 카드: 없음` with:

```text
- 페르소나 표시: `8 힘` 탄생·페르소나 통합형
```

For examples with a two-digit result, keep the distinct persona result unchanged.

- [ ] **Step 3: Document symbolism data and sources**

In `docs/content-model.md`, document `symbolismInterpretation` and `roleDescriptions.birth/persona`. In `docs/content-cards.md`, rename `카드 설명` headings to `그림 속 상징`, add `왜 이렇게 읽을까요?` from Task 2, and note this primary source near the introduction:

```markdown
상징 검토 기준: A. E. Waite, [The Pictorial Key to the Tarot](https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot)와 현재 `img/`의 Rider-Waite-Smith 계열 이미지.
```

State that birth/persona roles are this service's interpretation layer rather than Waite's original terminology.

- [ ] **Step 4: Scan for stale active-policy references**

Run:

```bash
rg -n "날개 카드|wingCard|getWingCard|renderWingCard|페르소나 카드가 없|스와이프 카드 3장|세 장" AGENTS.md README.md docs --glob '!docs/superpowers/plans/**' --glob '!docs/superpowers/specs/**'
```

Expected: no active-policy matches. Mentions explicitly stating that wing is no longer used are allowed only where needed to explain the migration.

- [ ] **Step 5: Commit documentation synchronization**

```bash
git add AGENTS.md README.md docs/README.md docs/product-overview.md docs/requirements.md docs/calculation-rules.md docs/content-model.md docs/content-writing-guide.md docs/ui-ux-spec.md docs/technical-plan.md docs/content-cards.md docs/implementation-checklist.md
git commit -m "docs: align profile model with two cards"
```

### Task 5: Full verification and mobile QA

**Files:**
- Modify if defects are found: `index.html`, `script.js`, `style.css`, `data/card-content.js`, `tests/script.test.js`

- [ ] **Step 1: Run all automated checks**

```bash
node --test tests/script.test.js
node --test tests/generate-config.test.js
node --check script.js
node --check data/card-content.js
git diff --check
```

Expected: all tests PASS, syntax checks and `git diff --check` produce no errors.

- [ ] **Step 2: Start the static server**

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```

Expected: server listens on `http://127.0.0.1:4175`.

- [ ] **Step 3: Verify the integrated persona flow at 360px**

Use `1997 / 10 / 17` and confirm:

```text
birth: 8 힘
persona state: 탄생·페르소나 통합형
persona card: 8 힘
slides/dots: 2
wing content: absent
```

Confirm both cards show `그림 속 상징`, `왜 이렇게 읽을까요?`, and their role-specific profile heading.

- [ ] **Step 4: Verify a distinct persona flow at 360px**

Use `1993 / 12 / 31` and confirm:

```text
birth: 2 여사제
persona: 11 정의
integrated state label: blank
slides/dots: 2
```

Swipe both cards, use `다시 하기`, generate a second result, and exercise the share fallback.

- [ ] **Step 5: Inspect long-text layout**

Confirm at 320px, 360px, and 430px that:

```text
no horizontal page overflow
card text is not clipped
line-height remains readable
the card image remains visible above the text
year cards remain unchanged
```

- [ ] **Step 6: Commit any verification fixes**

If verification required code changes:

```bash
git add index.html script.js style.css data/card-content.js tests/script.test.js
git commit -m "fix: polish two-card profile flow"
```

If no fixes were needed, do not create an empty commit.
