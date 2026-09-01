const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptSource = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

function createMockElement() {
  return {
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

global.document = {
  getElementById() {
    return createMockElement();
  },
  querySelectorAll() {
    return [createMockElement(), createMockElement(), createMockElement()];
  }
};

global.window = {
  scrollTo() {}
};

const tarot = require('../script.js');

test('parseBirthDate parses YYYY.MM.DD and returns numeric parts', () => {
  assert.equal(typeof tarot.parseBirthDate, 'function');
  assert.deepEqual(tarot.parseBirthDate('1997.10.17'), {
    year: 1997,
    month: 10,
    day: 17
  });
});

test('normalizeBirthDateFields pads single-digit month and day', () => {
  assert.equal(typeof tarot.normalizeBirthDateFields, 'function');
  assert.equal(
    tarot.normalizeBirthDateFields({
      year: '1997',
      month: '1',
      day: '1'
    }),
    '1997.01.01'
  );
});

test('parseBirthDate rejects invalid and future dates', () => {
  assert.throws(() => tarot.parseBirthDate('2026.02.30'));
  assert.throws(() => tarot.parseBirthDate('2999.01.01'));
});

test('reduceToBirthCard follows docs rule and stops at one digit', () => {
  assert.equal(typeof tarot.reduceToBirthCard, 'function');

  const result = tarot.reduceToBirthCard(1997, 10, 17);

  assert.equal(result.birthNumber, 8);
  assert.equal(result.personaNumber, null);
  assert.deepEqual(result.steps, [2024, 8]);
});

test('reduceToBirthCard captures first two-digit persona card', () => {
  const result = tarot.reduceToBirthCard(1993, 12, 31);

  assert.equal(result.birthNumber, 2);
  assert.equal(result.personaNumber, 11);
  assert.deepEqual(result.steps, [2036, 11, 2]);
});

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

test('getYearCard reduces to 22 or below for yearly flow', () => {
  assert.equal(typeof tarot.getYearCard, 'function');

  const result = tarot.getYearCard(10, 17, 2026);

  assert.equal(result.number, 10);
  assert.deepEqual(result.steps, [2053, 10]);
});

test('getCardImagePath maps canonical card number to img directory asset', () => {
  assert.equal(typeof tarot.getCardImagePath, 'function');
  assert.equal(tarot.getCardImagePath(0), 'img/00-TheFool.png');
  assert.equal(tarot.getCardImagePath(8), 'img/08-Strength.png');
  assert.equal(tarot.getCardImagePath(21), 'img/21-TheWorld.png');
});

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

test('rendering source connects relationship, details, and profile steps', () => {
  assert.match(scriptSource, /buildProfileRelationship\(profile\)/);
  assert.match(scriptSource, /getDetailedProfile\(profile\.birthCard\)/);
  assert.match(scriptSource, /res-relationship-description/);
  assert.match(scriptSource, /res-detail-growth/);
  assert.match(scriptSource, /querySelectorAll\('\.profile-step'\)/);
  assert.doesNotMatch(scriptSource, /querySelectorAll\('\.dot'\)/);
});

test('profile relationship styles include responsive and reduced-motion states', () => {
  assert.match(styleCss, /\.profile-relationship/);
  assert.match(styleCss, /\.profile-steps/);
  assert.match(styleCss, /\.profile-detail/);
  assert.match(styleCss, /\.relationship-visible/);
  assert.match(styleCss, /prefers-reduced-motion:\s*reduce/);
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

test('getShareText includes the configured production URL', () => {
  assert.equal(typeof tarot.getShareText, 'function');

  const profile = tarot.buildTarotProfile(
    {
      year: 1997,
      month: 10,
      day: 17
    },
    new Date('2026-04-12T00:00:00+09:00')
  );

  const shareText = tarot.getShareText(profile);

  assert.match(shareText, /https:\/\/tarot-zeta-two\.vercel\.app\/?/);
});

test('buildKakaoSharePayload creates a Kakao share payload with runtime URL', () => {
  assert.equal(typeof tarot.buildKakaoSharePayload, 'function');

  const profile = tarot.buildTarotProfile(
    {
      year: 1997,
      month: 10,
      day: 17
    },
    new Date('2026-04-12T00:00:00+09:00')
  );

  const payload = tarot.buildKakaoSharePayload(profile);

  assert.equal(payload.objectType, 'text');
  assert.equal(payload.link.mobileWebUrl, 'https://tarot-zeta-two.vercel.app/');
  assert.equal(payload.link.webUrl, 'https://tarot-zeta-two.vercel.app/');
  assert.match(payload.text, /탄생카드: 8 힘/);
});
