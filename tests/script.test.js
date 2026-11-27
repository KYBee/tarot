const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptSource = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

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
  assert.match(scriptSource, /renderProfileResultVisibility\(currentProfile\)/);
  assert.match(scriptSource, /element\.hidden = hidden/);
  assert.match(scriptSource, /if \(!profile\.hasPersona \|\| !profile\.personaCard\)/);
  assert.match(scriptSource, /updateProfileSteps\(0, currentProfile\.hasPersona\)/);
  assert.match(scriptSource, /const isActive = enabled && stepIndex === index/);
  assert.doesNotMatch(scriptSource, /querySelectorAll\('\.dot'\)/);
});

test('profile relationship styles include responsive and reduced-motion states', () => {
  assert.match(styleCss, /\[hidden\]\s*\{[^}]*display:\s*none\s*!important;/s);
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
    description: '내면에서는 “말보다 깊은 곳에서 답을 읽는 사람”의 성향이 중심을 이루고, 사람들에게는 “감정보다 기준을 세우고 균형 있게 판단하는 사람”의 모습이 먼저 보일 수 있어요.'
  });
});

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

test('resetProfileDetails closes every open profile detail', () => {
  const originalQuerySelectorAll = global.document.querySelectorAll;
  const details = [{ open: true }, { open: true }, { open: false }];
  global.document.querySelectorAll = (selector) =>
    selector === '.profile-detail' ? details : originalQuerySelectorAll(selector);

  try {
    tarot.resetProfileDetails();
    assert.deepEqual(details.map((detail) => detail.open), [false, false, false]);
  } finally {
    global.document.querySelectorAll = originalQuerySelectorAll;
  }
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

test('optional persona implementation has no integrated-state remnants', () => {
  const contentSource = fs.readFileSync(
    path.join(__dirname, '..', 'data', 'card-content.js'),
    'utf8'
  );

  assert.doesNotMatch(scriptSource, /hasDistinctPersona|personaIntegrated|is-integrated/);
  assert.doesNotMatch(contentSource, /personaIntegrated|탄생·페르소나 통합형/);
  assert.doesNotMatch(styleCss, /\.is-integrated/);
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

async function withMockNavigator(mockNavigator, run) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {
    value: mockNavigator,
    configurable: true,
    writable: true
  });

  try {
    await run();
  } finally {
    if (original) {
      Object.defineProperty(globalThis, 'navigator', original);
    } else {
      delete globalThis.navigator;
    }
  }
}

function createShareTestProfile() {
  return tarot.buildTarotProfile(
    { year: 1997, month: 10, day: 17 },
    new Date('2026-09-01T00:00:00+09:00')
  );
}

test('shareProfile does not copy text when the user cancels the share sheet', async () => {
  let copiedText = null;

  await withMockNavigator(
    {
      share: async () => {
        const error = new Error('Share canceled');
        error.name = 'AbortError';
        throw error;
      },
      clipboard: {
        writeText: async (text) => {
          copiedText = text;
        }
      }
    },
    async () => {
      const result = await tarot.shareProfile(createShareTestProfile());
      assert.equal(result, 'cancelled');
    }
  );

  assert.equal(copiedText, null);
});

test('shareProfile falls back to clipboard when the share sheet fails', async () => {
  let copiedText = null;

  await withMockNavigator(
    {
      share: async () => {
        throw new Error('Share unavailable');
      },
      clipboard: {
        writeText: async (text) => {
          copiedText = text;
        }
      }
    },
    async () => {
      const result = await tarot.shareProfile(createShareTestProfile());
      assert.equal(result, 'copied');
    }
  );

  assert.match(copiedText, /탄생카드: 8 힘/);
});

test('buildDeck returns 78 unique cards with existing images and daily fortune fields', () => {
  assert.equal(typeof tarot.buildDeck, 'function');

  const deck = tarot.buildDeck();
  assert.equal(deck.length, 78);

  const ids = new Set();
  let majorCount = 0;
  let minorCount = 0;

  for (const card of deck) {
    assert.ok(card.id, 'card must have an id');
    assert.equal(ids.has(card.id), false, `duplicate id: ${card.id}`);
    ids.add(card.id);

    if (card.arcana === 'major') {
      majorCount += 1;
    } else if (card.arcana === 'minor') {
      minorCount += 1;
    }

    assert.ok(card.name, `missing name for ${card.id}`);
    assert.ok(card.englishName, `missing englishName for ${card.id}`);
    assert.ok(Array.isArray(card.keywords) && card.keywords.length >= 3, `invalid keywords for ${card.id}`);
    assert.ok(card.symbolismDescription, `missing symbolismDescription for ${card.id}`);
    assert.ok(card.dailyMessage, `missing dailyMessage for ${card.id}`);
    assert.ok(card.dailyAdvice, `missing dailyAdvice for ${card.id}`);
    assert.ok(card.imagePath, `missing imagePath for ${card.id}`);
    assert.equal(
      fs.existsSync(path.join(__dirname, '..', card.imagePath)),
      true,
      `image file does not exist for ${card.id}: ${card.imagePath}`
    );
  }

  assert.equal(majorCount, 22);
  assert.equal(minorCount, 56);
});

test('getDailyCardContent resolves major and minor cards by id', () => {
  assert.equal(typeof tarot.getDailyCardContent, 'function');

  const fool = tarot.getDailyCardContent('major-00');
  assert.equal(fool.name, '바보');
  assert.equal(fool.displayNumber, '0/22');

  const cupsKing = tarot.getDailyCardContent('cups-14');
  assert.equal(cupsKing.name, '컵 왕');
  assert.equal(cupsKing.suit, 'cups');
  assert.equal(cupsKing.rank, 14);

  assert.equal(tarot.getDailyCardContent('unknown-99'), null);
});

test('shuffleDeck deterministically shuffles 78 cards without mutation or loss', () => {
  assert.equal(typeof tarot.shuffleDeck, 'function');

  const deck = tarot.buildDeck();
  const originalIds = deck.map((card) => card.id);

  function createSeededRng(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    };
  }

  const shuffledA = tarot.shuffleDeck(deck, createSeededRng(42));
  const shuffledB = tarot.shuffleDeck(deck, createSeededRng(42));

  assert.deepEqual(
    deck.map((card) => card.id),
    originalIds,
    'shuffleDeck should not mutate original deck'
  );
  assert.equal(shuffledA.length, 78);
  assert.deepEqual(
    shuffledA.map((card) => card.id),
    shuffledB.map((card) => card.id),
    'same seed should produce identical order'
  );
  assert.notDeepEqual(
    shuffledA.map((card) => card.id),
    originalIds,
    'shuffled order should differ from canonical order'
  );
  assert.deepEqual(
    [...shuffledA.map((card) => card.id)].sort(),
    [...originalIds].sort(),
    'shuffled deck should contain the exact same 78 cards'
  );
});

test('saveDailyCard and getSavedDailyCard lock the daily card for the same day only', () => {
  assert.equal(typeof tarot.saveDailyCard, 'function');
  assert.equal(typeof tarot.getSavedDailyCard, 'function');

  const store = new Map();
  const mockStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    }
  };

  const today = new Date('2026-11-27T09:30:00+09:00');
  const tomorrow = new Date('2026-11-28T00:05:00+09:00');

  assert.equal(tarot.getSavedDailyCard(today, mockStorage), null);

  tarot.saveDailyCard('wands-01', today, mockStorage);
  const savedToday = tarot.getSavedDailyCard(today, mockStorage);
  assert.ok(savedToday);
  assert.equal(savedToday.id, 'wands-01');
  assert.equal(savedToday.name, '완드 에이스');

  assert.equal(tarot.getSavedDailyCard(tomorrow, mockStorage), null);
});

test('getDailyShareText and buildDailyKakaoSharePayload include daily card details', () => {
  assert.equal(typeof tarot.getDailyShareText, 'function');
  assert.equal(typeof tarot.buildDailyKakaoSharePayload, 'function');

  const card = tarot.getDailyCardContent('wands-01');
  const text = tarot.getDailyShareText(card);

  assert.match(text, /오늘의 타로 운세/);
  assert.match(text, /오늘의 카드: 완드 에이스/);
  assert.match(text, /한 줄 조언:/);
  assert.match(text, /https:\/\/tarot-zeta-two\.vercel\.app\/?/);

  const payload = tarot.buildDailyKakaoSharePayload(card);
  assert.equal(payload.objectType, 'text');
  assert.equal(payload.link.mobileWebUrl, 'https://tarot-zeta-two.vercel.app/');
  assert.match(payload.text, /오늘의 카드: 완드 에이스/);
});

test('index.html includes daily fortune screen, mode selector, and minor arcana data script', () => {
  const latestHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(latestHtml, /id="mode-birth"/);
  assert.match(latestHtml, /id="mode-daily"/);
  assert.match(latestHtml, /id="daily"/);
  assert.match(latestHtml, /id="daily-spread"/);
  assert.match(latestHtml, /id="daily-result-panel"/);
  assert.match(latestHtml, /id="res-daily-art"/);
  assert.match(latestHtml, /id="res-daily-name"/);
  assert.match(latestHtml, /id="res-daily-meaning"/);
  assert.match(latestHtml, /id="res-daily-symbolism"/);
  assert.match(latestHtml, /id="res-daily-message"/);
  assert.match(latestHtml, /id="res-daily-advice"/);
  assert.match(latestHtml, /id="share-daily"/);
  assert.match(latestHtml, /id="daily-restart"/);
  assert.match(latestHtml, /<script src="data\/minor-arcana-content\.js"><\/script>/);
});

test('shareDailyCard does not copy text when the user cancels the share sheet', async () => {
  assert.equal(typeof tarot.shareDailyCard, 'function');

  let copiedText = null;
  const card = tarot.getDailyCardContent('cups-14');

  await withMockNavigator(
    {
      share: async () => {
        const error = new Error('Share canceled');
        error.name = 'AbortError';
        throw error;
      },
      clipboard: {
        writeText: async (text) => {
          copiedText = text;
        }
      }
    },
    async () => {
      const result = await tarot.shareDailyCard(card);
      assert.equal(result, 'cancelled');
    }
  );

  assert.equal(copiedText, null);
});

test('shareDailyCard falls back to clipboard when the share sheet fails', async () => {
  let copiedText = null;
  const card = tarot.getDailyCardContent('swords-01');

  await withMockNavigator(
    {
      share: async () => {
        throw new Error('Share unavailable');
      },
      clipboard: {
        writeText: async (text) => {
          copiedText = text;
        }
      }
    },
    async () => {
      const result = await tarot.shareDailyCard(card);
      assert.equal(result, 'copied');
    }
  );

  assert.match(copiedText, /오늘의 카드: 소드 에이스/);
});

test('daily spread supports two-step card levitation, reshuffle, and 3D stage flip markup', () => {
  const latestHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const latestCss = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

  assert.match(latestHtml, /id="daily-selection-status"/);
  assert.match(latestHtml, /id="daily-draw-confirm"/);
  assert.match(latestHtml, /id="daily-reshuffle"/);
  assert.match(latestHtml, /id="daily-stage-card-inner"/);
  assert.match(latestCss, /\.spread-card\.is-selected/);
  assert.match(latestCss, /\.daily-stage-card\.is-flipped\s+\.daily-stage-card-inner/);

  tarot.resetView();
  const selection = tarot.selectDailySpreadCard('wands-01', 12);
  assert.deepEqual(selection, {
    cardId: 'wands-01',
    index: 12
  });
});
