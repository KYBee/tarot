const contentSource = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.TAROT_CARD_CONTENT) {
    return globalThis;
  }

  try {
    return require('./data/card-content.js');
  } catch (error) {
    return {};
  }
})();

const minorContentSource = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.MINOR_ARCANA_CONTENT) {
    return globalThis;
  }

  try {
    return require('./data/minor-arcana-content.js');
  } catch (error) {
    return {};
  }
})();

const TAROT_CARD_CONTENT = contentSource.TAROT_CARD_CONTENT || {};
const MINOR_ARCANA_CONTENT = minorContentSource.MINOR_ARCANA_CONTENT || {};
const APP_COPY = contentSource.APP_COPY || {};
const SERVICE_TITLE = '오늘과 너의 타로';
const DEFAULT_SHARE_BASE_URL = 'https://tarot-zeta-two.vercel.app/';
const KAKAO_SDK_MESSAGE = '카카오 공유를 열었어요.';
const DAILY_STORAGE_KEY = 'tarot_daily_fortune_v1';
const KAKAO_ADFIT_SCRIPT_SRC = 'https://t1.daumcdn.net/kas/static/ba.min.js';
const CARD_IMAGE_FILES = {
  0: 'img/00-TheFool.png',
  1: 'img/01-TheMagician.png',
  2: 'img/02-TheHighPriestess.png',
  3: 'img/03-TheEmpress.png',
  4: 'img/04-TheEmperor.png',
  5: 'img/05-TheHierophant.png',
  6: 'img/06-TheLovers.png',
  7: 'img/07-TheChariot.png',
  8: 'img/08-Strength.png',
  9: 'img/09-TheHermit.png',
  10: 'img/10-WheelOfFortune.png',
  11: 'img/11-Justice.png',
  12: 'img/12-TheHangedMan.png',
  13: 'img/13-Death.png',
  14: 'img/14-Temperance.png',
  15: 'img/15-TheDevil.png',
  16: 'img/16-TheTower.png',
  17: 'img/17-TheStar.png',
  18: 'img/18-TheMoon.png',
  19: 'img/19-TheSun.png',
  20: 'img/20-Judgement.png',
  21: 'img/21-TheWorld.png'
};

let currentProfile = null;
let currentDailyCard = null;
let currentDailyDeck = [];
let selectedDailyCardId = null;
let selectedDailyCardIndex = null;
let isDailyPicking = false;
let suppressNextSpreadClick = false;

function sumDigits(number) {
  return String(Math.abs(number))
    .split('')
    .reduce((total, digit) => total + Number(digit), 0);
}

function parseBirthDate(input, now = new Date()) {
  const normalized = String(input || '').trim();
  const match = normalized.match(/^(\d{4})[./\s-]?(\d{1,2})[./\s-]?(\d{1,2})$/);

  if (!match) {
    throw new Error(APP_COPY.messages?.invalidDate || '생년월일 형식이 올바르지 않습니다.');
  }

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new Error(APP_COPY.messages?.invalidDate || '생년월일 형식이 올바르지 않습니다.');
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (parsed > today) {
    throw new Error(APP_COPY.messages?.futureDate || '미래 날짜는 입력할 수 없습니다.');
  }

  return { year, month, day };
}

function normalizeBirthDateFields(fields) {
  const year = String(fields?.year || '').replace(/\D/g, '').slice(0, 4);
  const monthDigits = String(fields?.month || '').replace(/\D/g, '').slice(0, 2);
  const dayDigits = String(fields?.day || '').replace(/\D/g, '').slice(0, 2);
  const month = monthDigits ? monthDigits.padStart(2, '0') : '';
  const day = dayDigits ? dayDigits.padStart(2, '0') : '';

  return [year, month, day].join('.');
}

function getBirthDateInputValue() {
  if (typeof document === 'undefined') {
    return '';
  }

  return normalizeBirthDateFields({
    year: document.getElementById('birth-year')?.value || '',
    month: document.getElementById('birth-month')?.value || '',
    day: document.getElementById('birth-day')?.value || ''
  });
}

function reduceToBirthCard(year, month, day) {
  const total = year + month + day;
  const steps = [total];
  let current = total;
  let personaRaw = null;

  while (current > 9) {
    current = sumDigits(current);
    steps.push(current);

    if (personaRaw === null && current >= 10 && current <= 22) {
      personaRaw = current;
    }
  }

  return {
    total,
    steps,
    birthNumber: current,
    personaRaw,
    personaNumber: personaRaw === null ? null : normalizeCardNumber(personaRaw)
  };
}

function getPersonaCard(reductionResult) {
  return reductionResult.personaNumber;
}

function getYearCard(month, day, year) {
  const total = month + day + year;
  const steps = [total];
  let current = total;

  while (current > 22) {
    current = sumDigits(current);
    steps.push(current);
  }

  return {
    year,
    total,
    steps,
    rawNumber: current,
    number: normalizeCardNumber(current)
  };
}

function getYearFlow(cardNumber) {
  return getCardContent(cardNumber).yearFlowDescription;
}

function normalizeCardNumber(number) {
  if (number === 22) {
    return 0;
  }

  return number;
}

function getDisplayNumber(number) {
  return normalizeCardNumber(number) === 0 ? '0/22' : String(number);
}

function getCardContent(cardNumber) {
  const normalized = normalizeCardNumber(cardNumber);

  return (
    TAROT_CARD_CONTENT[normalized] || {
      canonicalNumber: normalized,
      displayNumber: getDisplayNumber(normalized),
      name: '알 수 없는 카드',
      englishName: 'Unknown',
      keywords: ['데이터 확인 필요'],
      symbolismDescription: '카드 데이터를 아직 연결하지 못했어요.',
      symbolismInterpretation: '카드 이미지와 상징 해석 데이터를 다시 확인해주세요.',
      profileDescription: '문서와 데이터 파일을 다시 확인해주세요.',
      roleDescriptions: {},
      yearFlowDescription: '연도 흐름 데이터를 아직 연결하지 못했어요.'
    }
  );
}

function getRoleDescription(cardContent, role) {
  return cardContent.roleDescriptions?.[role] || cardContent.profileDescription || '';
}

function formatProfileCardLabel(cardContent) {
  return `${cardContent.displayNumber} ${cardContent.name}`;
}

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

function getProfileResultVisibility(profile) {
  const showPersona = Boolean(profile?.hasPersona && profile.personaCard);

  return {
    showPersona,
    showNavigation: showPersona,
    showSwipeHint: showPersona
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

function getCardImagePath(cardNumber) {
  return CARD_IMAGE_FILES[normalizeCardNumber(cardNumber)] || '';
}

function buildDeck() {
  const deck = [];

  for (let number = 0; number <= 21; number += 1) {
    const content = getCardContent(number);
    const id = `major-${String(number).padStart(2, '0')}`;
    deck.push({
      id,
      arcana: 'major',
      canonicalNumber: number,
      displayNumber: content.displayNumber || getDisplayNumber(number),
      name: content.name,
      englishName: content.englishName,
      imagePath: getCardImagePath(number),
      keywords: content.keywords || [],
      symbolismDescription: content.symbolismDescription || '',
      dailyMessage: content.dailyMessage || '',
      dailyAdvice: content.dailyAdvice || ''
    });
  }

  const suits = ['wands', 'cups', 'swords', 'pentacles'];
  for (const suit of suits) {
    for (let rank = 1; rank <= 14; rank += 1) {
      const id = `${suit}-${String(rank).padStart(2, '0')}`;
      const minor = MINOR_ARCANA_CONTENT[id];
      if (minor) {
        deck.push({
          ...minor,
          id,
          arcana: 'minor'
        });
      }
    }
  }

  return deck;
}

function getDailyCardContent(cardId) {
  if (!cardId) {
    return null;
  }

  const normalizedId = String(cardId).trim();
  const deck = buildDeck();
  return deck.find((card) => card.id === normalizedId) || null;
}

function shuffleDeck(deck, rng = Math.random) {
  const copy = Array.isArray(deck) ? [...deck] : [];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(rng() * (index + 1));
    const clampedIndex = Math.max(0, Math.min(index, randomIndex));
    const temp = copy[index];
    copy[index] = copy[clampedIndex];
    copy[clampedIndex] = temp;
  }

  return copy;
}

function formatDailyDateKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function getSavedDailyCard(now = new Date(), storage = getDefaultStorage()) {
  if (!storage || typeof storage.getItem !== 'function') {
    return null;
  }

  try {
    const raw = storage.getItem(DAILY_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const todayKey = formatDailyDateKey(now);
    if (!parsed || parsed.dateKey !== todayKey || !parsed.cardId) {
      return null;
    }

    return getDailyCardContent(parsed.cardId);
  } catch (error) {
    return null;
  }
}

function saveDailyCard(cardId, now = new Date(), storage = getDefaultStorage()) {
  if (!storage || typeof storage.setItem !== 'function' || !cardId) {
    return false;
  }

  try {
    const payload = JSON.stringify({
      dateKey: formatDailyDateKey(now),
      cardId: String(cardId).trim()
    });
    storage.setItem(DAILY_STORAGE_KEY, payload);
    return true;
  } catch (error) {
    return false;
  }
}

function formatDigitsExpression(value) {
  return String(value).split('').join(' + ');
}

function formatReducedValue(value) {
  return value === 22 ? '22 (0/22 바보)' : String(value);
}

function formatReductionTrace(prefix, steps) {
  if (!steps.length) {
    return prefix;
  }

  let trace = prefix;

  for (let index = 1; index < steps.length; index += 1) {
    trace += ` -> ${formatDigitsExpression(steps[index - 1])} = ${formatReducedValue(steps[index])}`;
  }

  return trace;
}

function formatBirthTrace(year, month, day, reductionResult) {
  return formatReductionTrace(
    `${year} + ${month} + ${day} = ${reductionResult.total}`,
    reductionResult.steps
  );
}

function formatYearTrace(month, day, yearResult) {
  return formatReductionTrace(
    `${month} + ${day} + ${yearResult.year} = ${yearResult.total}`,
    yearResult.steps
  );
}

function buildTarotProfile(parsedDate, today = new Date()) {
  const birthReduction = reduceToBirthCard(parsedDate.year, parsedDate.month, parsedDate.day);
  const birthCard = getCardContent(birthReduction.birthNumber);
  const personaNumber = getPersonaCard(birthReduction);
  const hasPersona = personaNumber !== null;
  const personaCard = hasPersona ? getCardContent(personaNumber) : null;
  const currentYear = today.getFullYear();

  const years = [currentYear - 1, currentYear, currentYear + 1].map((year) => {
    const card = getYearCard(parsedDate.month, parsedDate.day, year);

    return {
      ...card,
      cardContent: getCardContent(card.number),
      flow: getYearFlow(card.number),
      trace: formatYearTrace(parsedDate.month, parsedDate.day, card)
    };
  });

  return {
    birthDate: parsedDate,
    birthReduction,
    birthCard,
    personaNumber,
    personaCard,
    hasPersona,
    years
  };
}

function showScreen(screenId) {
  if (typeof document === 'undefined') {
    return;
  }

  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
  });

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }
}

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

function setElementText(id, value) {
  if (typeof document === 'undefined') {
    return;
  }

  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function setImageSource(id, imagePath, altText, options = {}) {
  if (typeof document === 'undefined') {
    return;
  }

  const image = document.getElementById(id);
  if (!image) {
    return;
  }

  if (!imagePath || options.hidden) {
    image.removeAttribute('src');
    image.setAttribute('alt', altText || '');
    image.classList.add('is-hidden');
    return;
  }

  image.src = imagePath;
  image.alt = altText;
  image.classList.remove('is-hidden');
}

function renderCardSection(prefix, typeCopy, cardContent, options = {}) {
  setElementText(`${prefix}-type-def`, options.typeDefinition || typeCopy.definition);
  setElementText(`${prefix}-num`, options.displayNumber || cardContent.displayNumber);
  setElementText(`${prefix}-name`, options.name || cardContent.name);
  setElementText(`${prefix}-tagline`, options.tagline || cardContent.tagline || '');
  setElementText(
    `${prefix}-overview`,
    options.commonProfileDescription || cardContent.profileDescription || ''
  );
  setElementText(
    `${prefix}-meaning`,
    Array.isArray(options.keywords || cardContent.keywords)
      ? (options.keywords || cardContent.keywords).join(', ')
      : options.keywords || cardContent.keywords
  );
  setElementText(
    `${prefix}-symbolism`,
    options.symbolismDescription || cardContent.symbolismDescription
  );
  setElementText(
    `${prefix}-symbolism-interpretation`,
    options.symbolismInterpretation || cardContent.symbolismInterpretation || ''
  );
  setElementText(
    `${prefix}-profile`,
    options.profileDescription || getRoleDescription(cardContent, options.role)
  );
  setElementText(`${prefix}-trace`, options.trace || '');
  setImageSource(
    `${prefix}-art`,
    options.imagePath === undefined ? getCardImagePath(cardContent.canonicalNumber) : options.imagePath,
    `${options.name || cardContent.name} 카드 이미지`,
    { hidden: options.hideImage }
  );
}

function renderBirthCardSection(profile) {
  renderCardSection('res-birth', APP_COPY.birth, profile.birthCard, {
    role: 'birth',
    trace: formatBirthTrace(
      profile.birthDate.year,
      profile.birthDate.month,
      profile.birthDate.day,
      profile.birthReduction
    )
  });
}

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

function renderDetailedProfileSection(profile) {
  const details = getDetailedProfile(profile.birthCard);

  setElementText('res-detail-strength', details.strength);
  setElementText('res-detail-shadow', details.shadow);
  setElementText('res-detail-relationship', details.relationship);
  setElementText('res-detail-work', details.workStyle);
  setElementText('res-detail-growth', details.growthPoint);
}

function resetProfileDetails() {
  if (typeof document === 'undefined') {
    return;
  }

  document.querySelectorAll('.profile-detail').forEach((detail) => {
    detail.open = false;
  });
}

function renderYearFlowSection(profile) {
  const keys = ['prev', 'curr', 'next'];

  profile.years.forEach((yearResult, index) => {
    const key = keys[index];
    setElementText(`year-${key}-label`, String(yearResult.year));
    setElementText(`year-${key}-number`, yearResult.cardContent.displayNumber);
    setElementText(`year-${key}-name`, yearResult.cardContent.name);
    setElementText(`year-${key}-desc`, yearResult.flow);
    setElementText(`year-${key}-trace`, yearResult.trace);
    setImageSource(
      `year-${key}-art`,
      getCardImagePath(yearResult.cardContent.canonicalNumber),
      `${yearResult.year}년 ${yearResult.cardContent.name} 카드 이미지`
    );
  });
}

function getShareUrl() {
  const configuredShareBaseUrl =
    (typeof globalThis !== 'undefined' && globalThis.APP_CONFIG?.shareBaseUrl) ||
    DEFAULT_SHARE_BASE_URL;

  return String(configuredShareBaseUrl || DEFAULT_SHARE_BASE_URL).trim() || DEFAULT_SHARE_BASE_URL;
}

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
    `${SERVICE_TITLE} | 나의 타로 프로필`,
    '',
    ...profileLines,
    `기본 의미: ${birth.keywords.join(', ')}`,
    `올해 흐름: ${currentYearFlow.cardContent.displayNumber} ${currentYearFlow.cardContent.name}`,
    '',
    '나의 타로 프로필을 확인해보세요.',
    shareUrl
  ].join('\n');
}

function getKakaoJavaScriptKey() {
  return String(
    (typeof globalThis !== 'undefined' && globalThis.APP_CONFIG?.kakaoJavaScriptKey) || ''
  ).trim();
}

function getKakaoAdfitConfig() {
  const runtimeConfig = (typeof globalThis !== 'undefined' && globalThis.APP_CONFIG) || {};
  const unit = String(runtimeConfig.kakaoAdfitUnit || '').trim();
  const width = String(runtimeConfig.kakaoAdfitWidth || '320').trim() || '320';
  const height = String(runtimeConfig.kakaoAdfitHeight || '100').trim() || '100';

  return {
    enabled: Boolean(unit),
    unit,
    width,
    height
  };
}

function initKakaoAdfit() {
  if (typeof document === 'undefined') {
    return false;
  }

  const adfit = getKakaoAdfitConfig();
  const container = document.getElementById('adfit-container');
  const ins = document.getElementById('kakao-adfit-ins');

  if (!adfit.enabled || !container || !ins) {
    setElementHidden(container, true);
    return false;
  }

  ins.setAttribute('data-ad-unit', adfit.unit);
  ins.setAttribute('data-ad-width', adfit.width);
  ins.setAttribute('data-ad-height', adfit.height);
  setElementHidden(container, false);

  const existingScript =
    typeof document.querySelector === 'function'
      ? document.querySelector(`script[src="${KAKAO_ADFIT_SCRIPT_SRC}"]`)
      : null;

  if (!existingScript && typeof document.createElement === 'function' && document.body?.appendChild) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = KAKAO_ADFIT_SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }

  return true;
}

function buildKakaoSharePayload(profile = currentProfile) {
  if (!profile) {
    return null;
  }

  const shareUrl = getShareUrl();

  return {
    objectType: 'text',
    text: getShareText(profile),
    link: {
      mobileWebUrl: shareUrl,
      webUrl: shareUrl
    },
    buttonTitle: '내 타로 보기'
  };
}

function getDailyShareLabel(card) {
  if (!card) {
    return '';
  }

  if (card.arcana === 'major') {
    return `${card.displayNumber} ${card.name} (${card.englishName})`;
  }

  return `${card.name} (${card.englishName})`;
}

function getDailyShareText(card) {
  if (!card) {
    return '';
  }

  const shareUrl = getShareUrl();

  return [
    `${SERVICE_TITLE} | 오늘의 타로 운세`,
    '',
    `오늘의 카드: ${getDailyShareLabel(card)}`,
    `기본 의미: ${(card.keywords || []).join(', ')}`,
    `한 줄 조언: ${card.dailyAdvice || ''}`,
    '',
    '오늘의 타로 운세를 확인해보세요.',
    shareUrl
  ].join('\n');
}

function buildDailyKakaoSharePayload(card) {
  if (!card) {
    return null;
  }

  const shareUrl = getShareUrl();

  return {
    objectType: 'text',
    text: getDailyShareText(card),
    link: {
      mobileWebUrl: shareUrl,
      webUrl: shareUrl
    },
    buttonTitle: '오늘의 타로 보기'
  };
}

function initKakaoShare() {
  if (typeof window === 'undefined' || !window.Kakao?.init || !window.Kakao?.isInitialized) {
    return false;
  }

  const kakaoJavaScriptKey = getKakaoJavaScriptKey();
  if (!kakaoJavaScriptKey) {
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoJavaScriptKey);
  }

  return true;
}

async function copyShareText(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  return false;
}

function setShareFeedback(message) {
  setElementText('share-feedback', message);
}

function setDailyShareFeedback(message) {
  setElementText('daily-share-feedback', message);
}

function getDailyBadgeText(card) {
  if (!card) {
    return '';
  }

  if (card.arcana === 'major') {
    return card.displayNumber || String(card.canonicalNumber ?? '');
  }

  const suitLabels = {
    wands: 'WANDS',
    cups: 'CUPS',
    swords: 'SWORDS',
    pentacles: 'PENTACLES'
  };
  return `${suitLabels[card.suit] || 'MINOR'} · ${String(card.rank || '').padStart(2, '0')}`;
}

function renderDailyCardSection(card, options = {}) {
  if (!card) {
    return;
  }

  setElementText('daily-type-def', APP_COPY.daily?.definition || '78장의 타로 덱에서 오늘 하루의 흐름과 마주할 카드를 한 장 고릅니다.');
  setElementText('res-daily-num', getDailyBadgeText(card));
  setElementText('res-daily-name', card.name);
  setElementText(
    'res-daily-meaning',
    Array.isArray(card.keywords) ? card.keywords.join(', ') : String(card.keywords || '')
  );
  setElementText('res-daily-symbolism', card.symbolismDescription || '');
  setElementText('res-daily-message', card.dailyMessage || '');
  setElementText('res-daily-advice', card.dailyAdvice || '');
  setImageSource('res-daily-art', card.imagePath, `${card.name} 카드 이미지`);

  if (typeof document !== 'undefined') {
    const badgeEl = document.getElementById('res-daily-num');
    const stageCard = document.getElementById('daily-card-visual');
    const readingBox = document.getElementById('daily-reading-box');
    badgeEl?.classList.toggle('is-minor-badge', card.arcana === 'minor');
    setElementHidden(document.getElementById('daily-lock-notice'), !options.isLockedToday);
    setElementHidden(document.getElementById('daily-result-panel'), false);
    setElementHidden(document.getElementById('share-daily'), false);

    if (!options.animateFlip) {
      stageCard?.classList.remove('is-ceremony-entering');
      stageCard?.classList.add('is-flipped');
      readingBox?.classList.remove('is-revealing');
    }
  }
}

function updateDailySelectionStatus(index = null) {
  if (typeof document === 'undefined') {
    return;
  }

  const statusEl = document.getElementById('daily-selection-status');
  const confirmBtn = document.getElementById('daily-draw-confirm');

  if (index === null || index === undefined) {
    setElementText('daily-selection-status', '');
    setElementText('daily-guide', '뒤집어진 카드를 좌우로 드래그해 살펴보고, 끌리는 카드를 골라보세요.');
    statusEl?.classList.remove('is-active');
    setElementHidden(statusEl, true);
    setElementHidden(confirmBtn, true);
    return;
  }

  const orderLabel = index + 1;
  setElementText(
    'daily-selection-status',
    `${orderLabel}번째 카드 선택됨 · 카드를 한 번 더 탭하면 뒤집힙니다`
  );
  setElementText(
    'daily-guide',
    '이 카드에서 끌림이 느껴진다면 카드를 한 번 더 탭하거나 아래 버튼을 눌러보세요.'
  );
  statusEl?.classList.add('is-active');
  setElementHidden(statusEl, false);
  setElementHidden(confirmBtn, false);
}

function buildTarotCardBackSvg() {
  return [
    '<svg class="tarot-back-svg" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    '  <rect x="3" y="3" width="114" height="194" rx="9" fill="none" stroke="#d4af37" stroke-width="1.6" stroke-opacity="0.88"/>',
    '  <rect x="8" y="8" width="104" height="184" rx="6" fill="none" stroke="#f4d46a" stroke-width="0.9" stroke-opacity="0.55" stroke-dasharray="2 2"/>',
    '  <path d="M8 22 L22 8 M98 8 L112 22 M8 178 L22 192 M98 192 L112 178" stroke="#d4af37" stroke-width="1.1" stroke-opacity="0.7"/>',
    '  <circle cx="16" cy="16" r="2.2" fill="#f4d46a" fill-opacity="0.8"/>',
    '  <circle cx="104" cy="16" r="2.2" fill="#f4d46a" fill-opacity="0.8"/>',
    '  <circle cx="16" cy="184" r="2.2" fill="#f4d46a" fill-opacity="0.8"/>',
    '  <circle cx="104" cy="184" r="2.2" fill="#f4d46a" fill-opacity="0.8"/>',
    '  <line x1="60" y1="20" x2="60" y2="180" stroke="#d4af37" stroke-width="0.7" stroke-opacity="0.35"/>',
    '  <line x1="16" y1="100" x2="104" y2="100" stroke="#d4af37" stroke-width="0.7" stroke-opacity="0.35"/>',
    '  <polygon points="60,24 98,100 60,176 22,100" fill="none" stroke="#d4af37" stroke-width="1" stroke-opacity="0.48"/>',
    '  <circle cx="60" cy="100" r="34" fill="#180a2d" fill-opacity="0.85" stroke="#d4af37" stroke-width="1.4" stroke-opacity="0.85"/>',
    '  <circle cx="60" cy="100" r="26" fill="none" stroke="#f4d46a" stroke-width="0.8" stroke-opacity="0.55" stroke-dasharray="3 2"/>',
    '  <rect x="42" y="82" width="36" height="36" fill="none" stroke="#d4af37" stroke-width="1" stroke-opacity="0.65" transform="rotate(45 60 100)"/>',
    '  <rect x="42" y="82" width="36" height="36" fill="none" stroke="#d4af37" stroke-width="1" stroke-opacity="0.65"/>',
    '  <polygon points="60,76 65,95 84,100 65,105 60,124 55,105 36,100 55,95" fill="#f4d46a" fill-opacity="0.9"/>',
    '  <circle cx="60" cy="100" r="4.5" fill="#1b0c33" stroke="#f4d46a" stroke-width="1.2"/>',
    '  <path d="M53 42 A9 9 0 1 0 67 42 A7 7 0 1 1 53 42 Z" fill="#f4d46a" fill-opacity="0.78"/>',
    '  <path d="M53 158 A9 9 0 1 1 67 158 A7 7 0 1 0 53 158 Z" fill="#f4d46a" fill-opacity="0.78"/>',
    '</svg>'
  ].join('');
}

function selectDailySpreadCard(cardId, index) {
  if (isDailyPicking || currentDailyCard) {
    return null;
  }

  selectedDailyCardId = cardId;
  selectedDailyCardIndex = index;
  updateDailySelectionStatus(index);

  if (typeof document !== 'undefined') {
    const buttons = document.querySelectorAll('.spread-card');
    buttons.forEach((button) => {
      const btnIndex = Number(button.dataset?.cardIndex);
      const isTarget = button.dataset?.cardId === cardId;
      button.classList.toggle('is-selected', isTarget);
      button.classList.toggle('is-neighbor-left', btnIndex === index - 1 || btnIndex === index - 2);
      button.classList.toggle('is-neighbor-right', btnIndex === index + 1 || btnIndex === index + 2);
      button.setAttribute('aria-pressed', isTarget ? 'true' : 'false');

      if (isTarget) {
        button.scrollIntoView?.({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    });
  }

  return {
    cardId: selectedDailyCardId,
    index: selectedDailyCardIndex
  };
}

function handleDailyCardTap(cardId, index, button) {
  if (suppressNextSpreadClick) {
    suppressNextSpreadClick = false;
    return;
  }

  if (isDailyPicking || currentDailyCard) {
    return;
  }

  if (selectedDailyCardId === cardId) {
    handleDailyPick(cardId, button);
    return;
  }

  selectDailySpreadCard(cardId, index);
}

function renderDailySpread(deck) {
  if (typeof document === 'undefined') {
    return;
  }

  const spreadContainer = document.getElementById('daily-spread');
  if (!spreadContainer || typeof document.createElement !== 'function') {
    return;
  }

  spreadContainer.innerHTML = '';
  const total = deck.length || 1;
  const midpoint = (total - 1) / 2;
  const cardBackSvg = buildTarotCardBackSvg();

  deck.forEach((card, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'spread-card';
    button.dataset.cardId = card.id;
    button.dataset.cardIndex = String(index);
    button.setAttribute('aria-label', `78장 중 ${index + 1}번째 카드 고르기`);
    button.setAttribute('aria-pressed', 'false');

    const normalizedOffset = (index - midpoint) / midpoint;
    const arcY = Math.round(Math.pow(normalizedOffset, 2) * 14 + Math.sin(index * 0.45) * 3);
    const angle = (normalizedOffset * 5).toFixed(2);
    button.style.setProperty('--fan-y', `${arcY}px`);
    button.style.setProperty('--fan-rot', `${angle}deg`);
    button.style.setProperty('--card-order', String(index));

    const indexLabel = String(index + 1).padStart(2, '0');
    button.innerHTML = [
      '<span class="spread-card-inner">',
      '  <span class="spread-card-back">',
      `    ${cardBackSvg}`,
      `    <span class="spread-card-index">${indexLabel}</span>`,
      '  </span>',
      '  <span class="spread-card-front">',
      `    <img src="${card.imagePath}" alt="${card.name} 카드 이미지" loading="lazy" draggable="false">`,
      '  </span>',
      '</span>'
    ].join('');

    button.addEventListener('click', () => {
      handleDailyCardTap(card.id, index, button);
    });

    spreadContainer.appendChild(button);
  });
}

function bindDailySpreadDrag() {
  if (typeof document === 'undefined') {
    return;
  }

  const spreadTrack = document.getElementById('daily-spread');
  if (!spreadTrack) {
    return;
  }

  let isPointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let draggedDistance = 0;

  spreadTrack.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    isPointerDown = true;
    draggedDistance = 0;
    startX = event.clientX;
    startScrollLeft = spreadTrack.scrollLeft;
    spreadTrack.classList.add('is-dragging');
  });

  spreadTrack.addEventListener('pointermove', (event) => {
    if (!isPointerDown) {
      return;
    }

    const deltaX = event.clientX - startX;
    draggedDistance = Math.max(draggedDistance, Math.abs(deltaX));

    if (draggedDistance > 6) {
      suppressNextSpreadClick = true;
      spreadTrack.scrollLeft = startScrollLeft - deltaX;
    }
  });

  const endDrag = () => {
    if (!isPointerDown) {
      return;
    }
    isPointerDown = false;
    spreadTrack.classList.remove('is-dragging');
    if (draggedDistance <= 6) {
      suppressNextSpreadClick = false;
    }
  };

  spreadTrack.addEventListener('pointerup', endDrag);
  spreadTrack.addEventListener('pointercancel', endDrag);
  spreadTrack.addEventListener('pointerleave', endDrag);
}

function reshuffleDailySpread() {
  if (isDailyPicking || currentDailyCard) {
    return;
  }

  selectedDailyCardId = null;
  selectedDailyCardIndex = null;
  updateDailySelectionStatus(null);

  const spreadTrack = typeof document !== 'undefined' ? document.getElementById('daily-spread') : null;
  spreadTrack?.classList.add('is-shuffling');

  const finishShuffle = () => {
    currentDailyDeck = shuffleDeck(buildDeck());
    renderDailySpread(currentDailyDeck);
    spreadTrack?.classList.remove('is-shuffling');
    if (spreadTrack) {
      spreadTrack.scrollLeft = Math.max(0, (spreadTrack.scrollWidth - spreadTrack.clientWidth) / 3);
    }
  };

  if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
    window.setTimeout(finishShuffle, 240);
  } else {
    finishShuffle();
  }
}

function handleDailyPick(cardId = selectedDailyCardId, pickedButton = null) {
  if (isDailyPicking || currentDailyCard || !cardId) {
    return;
  }

  const card = getDailyCardContent(cardId);
  if (!card) {
    return;
  }

  isDailyPicking = true;
  currentDailyCard = card;
  saveDailyCard(card.id);

  if (typeof document !== 'undefined') {
    document.querySelectorAll('.spread-card').forEach((button) => {
      if (button === pickedButton || button.dataset?.cardId === cardId) {
        button.classList.remove('is-selected');
        button.classList.add('is-picked');
      } else {
        button.classList.add('is-dimmed');
      }
    });
  }

  const startStageCeremony = () => {
    const spreadStage = typeof document !== 'undefined' ? document.getElementById('daily-spread-stage') : null;
    const stageCard = typeof document !== 'undefined' ? document.getElementById('daily-card-visual') : null;
    const readingBox = typeof document !== 'undefined' ? document.getElementById('daily-reading-box') : null;

    spreadStage?.classList.add('is-drawing');
    renderDailyCardSection(card, { isLockedToday: false, animateFlip: true });
    setDailyShareFeedback('');

    // 1단계: 중앙 스테이지에 카드 뒷면 상태로 등장
    stageCard?.classList.remove('is-flipped');
    stageCard?.classList.add('is-ceremony-entering');
    readingBox?.classList.add('is-revealing');

    const completeFlip = () => {
      setElementHidden(spreadStage, true);
      spreadStage?.classList.remove('is-drawing');
      stageCard?.classList.add('is-flipped');
      isDailyPicking = false;

      if (typeof document !== 'undefined') {
        document.getElementById('daily-result-panel')?.scrollIntoView?.({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
      window.setTimeout(completeFlip, 240);
    } else {
      completeFlip();
    }
  };

  if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
    window.setTimeout(startStageCeremony, 280);
  } else {
    startStageCeremony();
  }
}

function openDailyScreen() {
  isDailyPicking = false;
  selectedDailyCardId = null;
  selectedDailyCardIndex = null;
  setDailyShareFeedback('');
  updateDailySelectionStatus(null);

  const savedCard = getSavedDailyCard();
  const spreadStage = typeof document !== 'undefined' ? document.getElementById('daily-spread-stage') : null;
  const resultPanel = typeof document !== 'undefined' ? document.getElementById('daily-result-panel') : null;
  const shareBtn = typeof document !== 'undefined' ? document.getElementById('share-daily') : null;

  spreadStage?.classList.remove('is-drawing');

  if (savedCard) {
    currentDailyCard = savedCard;
    setElementHidden(spreadStage, true);
    renderDailyCardSection(savedCard, { isLockedToday: true });
  } else {
    currentDailyCard = null;
    currentDailyDeck = shuffleDeck(buildDeck());
    setElementHidden(spreadStage, false);
    setElementHidden(resultPanel, true);
    setElementHidden(shareBtn, true);
    renderDailySpread(currentDailyDeck);
  }

  showScreen('daily');
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

async function shareDailyCard(card = currentDailyCard) {
  if (!card) {
    setDailyShareFeedback(APP_COPY.messages?.shareUnavailable || '공유할 결과가 아직 없어요.');
    return 'unavailable';
  }

  const shareText = getDailyShareText(card);
  const shareUrl = getShareUrl();
  const kakaoPayload = buildDailyKakaoSharePayload(card);

  if (kakaoPayload && initKakaoShare() && typeof window !== 'undefined' && window.Kakao?.Share?.sendDefault) {
    try {
      window.Kakao.Share.sendDefault(kakaoPayload);
      setDailyShareFeedback(KAKAO_SDK_MESSAGE);
      return 'kakao';
    } catch (error) {
      // SDK 설정/도메인 오류 시 fallback으로 내려간다.
    }
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `${SERVICE_TITLE} | 오늘의 타로 운세`,
        text: shareText,
        url: shareUrl
      });
      setDailyShareFeedback('공유 시트를 열었어요.');
      return 'web-share';
    } catch (error) {
      if (error?.name === 'AbortError') {
        setDailyShareFeedback('');
        return 'cancelled';
      }
    }
  }

  const copied = await copyShareText(shareText);
  if (copied) {
    setDailyShareFeedback(APP_COPY.messages?.shareFallback || '결과 텍스트를 복사했어요.');
    return 'copied';
  }

  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(`${APP_COPY.messages?.shareFallback || '공유 텍스트를 준비했어요.'}\n\n${shareText}`);
  }

  return 'alert';
}

function handleDailyShare() {
  return shareDailyCard(currentDailyCard);
}

async function shareProfile(profile) {
  if (!profile) {
    setShareFeedback(APP_COPY.messages?.shareUnavailable || '공유할 결과가 아직 없어요.');
    return 'unavailable';
  }

  const shareText = getShareText(profile);
  const shareUrl = getShareUrl();
  const kakaoPayload = buildKakaoSharePayload(profile);

  if (kakaoPayload && initKakaoShare() && typeof window !== 'undefined' && window.Kakao?.Share?.sendDefault) {
    try {
      window.Kakao.Share.sendDefault(kakaoPayload);
      setShareFeedback(KAKAO_SDK_MESSAGE);
      return 'kakao';
    } catch (error) {
      // SDK가 있어도 도메인/앱 설정 문제 시 기존 fallback으로 내려간다.
    }
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `${SERVICE_TITLE} | 나의 타로 프로필`,
        text: shareText,
        url: shareUrl
      });
      setShareFeedback('공유 시트를 열었어요.');
      return 'web-share';
    } catch (error) {
      // 사용자가 공유 시트를 닫은 경우에는 복사로 넘어가지 않는다.
      if (error?.name === 'AbortError') {
        setShareFeedback('');
        return 'cancelled';
      }
    }
  }

  const copied = await copyShareText(shareText);
  if (copied) {
    setShareFeedback(APP_COPY.messages?.shareFallback || '결과 텍스트를 복사했어요.');
    return 'copied';
  }

  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(`${APP_COPY.messages?.shareFallback || '공유 텍스트를 준비했어요.'}\n\n${shareText}`);
  }

  return 'alert';
}

function handleShare() {
  return shareProfile(currentProfile);
}

function resetView() {
  currentProfile = null;
  currentDailyCard = null;
  selectedDailyCardId = null;
  selectedDailyCardIndex = null;
  isDailyPicking = false;

  const birthYearInput = document.getElementById('birth-year');
  const birthMonthInput = document.getElementById('birth-month');
  const birthDayInput = document.getElementById('birth-day');
  const errorBox = document.getElementById('input-error');
  const swiper = document.getElementById('card-swiper');

  [birthYearInput, birthMonthInput, birthDayInput].forEach((input) => {
    if (input) {
      input.value = '';
    }
  });

  if (errorBox) {
    errorBox.textContent = '';
  }

  setShareFeedback('');
  setDailyShareFeedback('');
  resetProfileDetails();
  showScreen('landing');

  if (swiper) {
    swiper.scrollLeft = 0;
  }

  updateProfileSteps(0);
}

function sanitizeBirthFieldValue(value, maxLength) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, maxLength);
}

function handleBirthFieldInput(event) {
  const input = event.target;
  const maxLength = Number(input?.getAttribute('maxlength')) || 2;

  if (input) {
    input.value = sanitizeBirthFieldValue(input.value, maxLength);
  }
}

function handleBirthFieldBlur(event) {
  const input = event.target;

  if (!input) {
    return;
  }

  const maxLength = Number(input.getAttribute('maxlength')) || 2;
  const sanitizedValue = sanitizeBirthFieldValue(input.value, maxLength);

  if (input.id === 'birth-month' || input.id === 'birth-day') {
    input.value = sanitizedValue ? sanitizedValue.padStart(2, '0') : '';
    return;
  }

  input.value = sanitizedValue;
}

function handleStart() {
  const errorBox = document.getElementById('input-error');
  const inputValue = getBirthDateInputValue();

  if (errorBox) {
    errorBox.textContent = '';
  }

  let parsedDate;
  try {
    parsedDate = parseBirthDate(inputValue);
  } catch (error) {
    if (errorBox) {
      errorBox.textContent = error.message;
    }
    return;
  }

  showScreen('loading');

  window.setTimeout(() => {
    currentProfile = buildTarotProfile(parsedDate);
    resetProfileDetails();
    renderProfileResultVisibility(currentProfile);
    renderBirthCardSection(currentProfile);
    renderPersonaCardSection(currentProfile);
    renderDetailedProfileSection(currentProfile);
    renderYearFlowSection(currentProfile);

    const swiper = document.getElementById('card-swiper');
    if (swiper) {
      swiper.scrollLeft = 0;
    }

    updateProfileSteps(0, currentProfile.hasPersona);
    setShareFeedback('');
    showScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 350);
}

function bindProfileNavigation() {
  const swiper = document.getElementById('card-swiper');
  if (!swiper) {
    return;
  }

  swiper.addEventListener('scroll', () => {
    const width = swiper.offsetWidth || 1;
    const activeIndex = Math.round(swiper.scrollLeft / width);
    updateProfileSteps(activeIndex);
  });

  document.querySelectorAll('.profile-step').forEach((step) => {
    step.addEventListener('click', () => {
      const index = Number(step.dataset.slideIndex);
      swiper.scrollTo({ left: swiper.offsetWidth * index, behavior: 'smooth' });
    });
  });
}

function bindEvents() {
  const startButton = document.getElementById('cta-start');
  const restartButton = document.getElementById('restart');
  const shareButton = document.getElementById('share-kakao');
  const modeBirthButton = document.getElementById('mode-birth');
  const modeDailyButton = document.getElementById('mode-daily');
  const dailyDrawConfirmButton = document.getElementById('daily-draw-confirm');
  const dailyReshuffleButton = document.getElementById('daily-reshuffle');
  const dailyShareButton = document.getElementById('share-daily');
  const dailyRestartButton = document.getElementById('daily-restart');
  const birthYearInput = document.getElementById('birth-year');
  const birthMonthInput = document.getElementById('birth-month');
  const birthDayInput = document.getElementById('birth-day');

  startButton?.addEventListener('click', handleStart);
  restartButton?.addEventListener('click', resetView);
  shareButton?.addEventListener('click', handleShare);
  modeBirthButton?.addEventListener('click', () => {
    showScreen('landing');
    birthYearInput?.focus?.();
  });
  modeDailyButton?.addEventListener('click', openDailyScreen);
  dailyDrawConfirmButton?.addEventListener('click', () => {
    handleDailyPick(selectedDailyCardId);
  });
  dailyReshuffleButton?.addEventListener('click', reshuffleDailySpread);
  dailyShareButton?.addEventListener('click', handleDailyShare);
  dailyRestartButton?.addEventListener('click', resetView);
  [birthYearInput, birthMonthInput, birthDayInput].forEach((input) => {
    input?.addEventListener('input', handleBirthFieldInput);
    input?.addEventListener('blur', handleBirthFieldBlur);
  });

  bindProfileNavigation();
  bindDailySpreadDrag();
}

function initApp() {
  if (typeof document === 'undefined') {
    return;
  }

  initKakaoShare();
  initKakaoAdfit();
  bindEvents();
  if (typeof window !== 'undefined' && window.location?.hash === '#daily') {
    openDailyScreen();
    return;
  }
  showScreen('landing');
  updateProfileSteps(0);
}

const exported = {
  parseBirthDate,
  normalizeBirthDateFields,
  sumDigits,
  reduceToBirthCard,
  getPersonaCard,
  getYearCard,
  getYearFlow,
  getCardContent,
  getRoleDescription,
  buildProfileRelationship,
  getProfileResultVisibility,
  getDetailedProfile,
  getCardImagePath,
  buildDeck,
  getDailyCardContent,
  shuffleDeck,
  formatDailyDateKey,
  getSavedDailyCard,
  saveDailyCard,
  getShareUrl,
  getShareText,
  getDailyShareText,
  getKakaoJavaScriptKey,
  getKakaoAdfitConfig,
  initKakaoAdfit,
  buildKakaoSharePayload,
  buildDailyKakaoSharePayload,
  formatBirthTrace,
  formatYearTrace,
  buildTarotProfile,
  shareProfile,
  shareDailyCard,
  handleShare,
  handleDailyShare,
  openDailyScreen,
  selectDailySpreadCard,
  handleDailyCardTap,
  reshuffleDailySpread,
  handleDailyPick,
  renderDailyCardSection,
  renderDailySpread,
  resetView,
  renderBirthCardSection,
  renderPersonaCardSection,
  renderProfileResultVisibility,
  renderDetailedProfileSection,
  resetProfileDetails,
  renderYearFlowSection
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = exported;
}

if (typeof window !== 'undefined') {
  window.tarotApp = exported;
}

if (typeof document !== 'undefined') {
  initApp();
}
