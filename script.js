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

const TAROT_CARD_CONTENT = contentSource.TAROT_CARD_CONTENT || {};
const APP_COPY = contentSource.APP_COPY || {};
const DEFAULT_SHARE_BASE_URL = 'https://tarot-zeta-two.vercel.app/';
const KAKAO_SDK_MESSAGE = '카카오 공유를 열었어요.';
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
  const isIntegrated = !profile.hasDistinctPersona;
  const relationship = buildProfileRelationship(profile);
  const trace = isIntegrated
    ? APP_COPY.personaIntegrated?.trace ||
      '중간 축약 과정에서 별도의 두 자리 카드가 나오지 않아 탄생카드와 같은 카드로 읽습니다.'
    : `탄생카드 축약 과정에서 ${formatReducedValue(profile.birthReduction.personaRaw)}이 나타나 페르소나 카드로 읽습니다.`;

  const relationshipElement = document.getElementById('res-profile-relationship');
  setElementText('res-relationship-badge', relationship.badge);
  setElementText('res-relationship-birth', relationship.birthLabel);
  setElementText('res-relationship-persona', relationship.personaLabel);
  setElementText('res-relationship-description', relationship.description);

  if (relationshipElement) {
    relationshipElement.dataset.variant = relationship.variant;
  }

  renderCardSection('res-persona', APP_COPY.persona, profile.personaCard, {
    role: 'persona',
    trace
  });

  const item = document.getElementById('item-persona');
  if (item) {
    item.classList.toggle('is-integrated', isIntegrated);
  }
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

  return [
    '너의 타로는? | 나의 타로 프로필',
    '',
    `탄생카드: ${birth.displayNumber} ${birth.name}`,
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

async function handleShare() {
  if (!currentProfile) {
    setShareFeedback(APP_COPY.messages?.shareUnavailable || '공유할 결과가 아직 없어요.');
    return;
  }

  const shareText = getShareText();
  const shareUrl = getShareUrl();
  const kakaoPayload = buildKakaoSharePayload();

  if (kakaoPayload && initKakaoShare() && typeof window !== 'undefined' && window.Kakao?.Share?.sendDefault) {
    try {
      window.Kakao.Share.sendDefault(kakaoPayload);
      setShareFeedback(KAKAO_SDK_MESSAGE);
      return;
    } catch (error) {
      // SDK가 있어도 도메인/앱 설정 문제 시 기존 fallback으로 내려간다.
    }
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: '너의 타로는? | 나의 타로 프로필',
        text: shareText,
        url: shareUrl
      });
      setShareFeedback('공유 시트를 열었어요.');
      return;
    } catch (error) {
      // 사용자가 취소한 경우에도 fallback을 허용한다.
    }
  }

  const copied = await copyShareText(shareText);
  if (copied) {
    setShareFeedback(APP_COPY.messages?.shareFallback || '결과 텍스트를 복사했어요.');
    return;
  }

  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(`${APP_COPY.messages?.shareFallback || '공유 텍스트를 준비했어요.'}\n\n${shareText}`);
  }
}

function resetView() {
  currentProfile = null;

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
    renderBirthCardSection(currentProfile);
    renderPersonaCardSection(currentProfile);
    renderDetailedProfileSection(currentProfile);
    renderYearFlowSection(currentProfile);

    const swiper = document.getElementById('card-swiper');
    if (swiper) {
      swiper.scrollLeft = 0;
    }

    updateProfileSteps(0);
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
  const birthYearInput = document.getElementById('birth-year');
  const birthMonthInput = document.getElementById('birth-month');
  const birthDayInput = document.getElementById('birth-day');

  startButton?.addEventListener('click', handleStart);
  restartButton?.addEventListener('click', resetView);
  shareButton?.addEventListener('click', handleShare);
  [birthYearInput, birthMonthInput, birthDayInput].forEach((input) => {
    input?.addEventListener('input', handleBirthFieldInput);
    input?.addEventListener('blur', handleBirthFieldBlur);
  });

  bindProfileNavigation();
}

function initApp() {
  if (typeof document === 'undefined') {
    return;
  }

  initKakaoShare();
  bindEvents();
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
  getShareUrl,
  getShareText,
  getKakaoJavaScriptKey,
  buildKakaoSharePayload,
  formatBirthTrace,
  formatYearTrace,
  buildTarotProfile,
  handleShare,
  resetView,
  renderBirthCardSection,
  renderPersonaCardSection,
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
