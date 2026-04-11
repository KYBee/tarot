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

const shareServiceSource = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.SHARE_SERVICE) {
    return globalThis;
  }

  try {
    return require('./share-service.js');
  } catch (error) {
    return {};
  }
})();
const SHARE_SERVICE = shareServiceSource.SHARE_SERVICE || shareServiceSource;
const shareUtilsSource = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.SHARE_UTILS) {
    return globalThis;
  }

  try {
    return require('./share-utils.js');
  } catch (error) {
    return {};
  }
})();
const SHARE_UTILS = shareUtilsSource.SHARE_UTILS || shareUtilsSource;
const APP_CONFIG =
  (typeof globalThis !== 'undefined' && globalThis.APP_CONFIG) || {};
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
let kakaoSdkPromise = null;

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

function normalizeBirthInputValue(value, maxLength) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, maxLength);
}

function getBirthInputs() {
  if (typeof document === 'undefined') {
    return {};
  }

  return {
    year: document.getElementById('birth-year'),
    month: document.getElementById('birth-month'),
    day: document.getElementById('birth-day')
  };
}

function getBirthdateInputValue() {
  const inputs = getBirthInputs();
  const year = inputs.year?.value?.trim() || '';
  const month = inputs.month?.value?.trim() || '';
  const day = inputs.day?.value?.trim() || '';

  if (!year && !month && !day) {
    return '';
  }

  return `${year}.${month}.${day}`;
}

function validateBirthdateInputs() {
  const inputs = getBirthInputs();
  const year = inputs.year?.value?.trim() || '';
  const month = inputs.month?.value?.trim() || '';
  const day = inputs.day?.value?.trim() || '';

  if (year.length !== 4) {
    throw new Error('연도는 4자리로 입력해주세요.');
  }

  if (month.length < 1 || month.length > 2) {
    throw new Error('월은 1자리 또는 2자리로 입력해주세요.');
  }

  if (day.length < 1 || day.length > 2) {
    throw new Error('일은 1자리 또는 2자리로 입력해주세요.');
  }
}

function setBirthdateInputs(parsedDate) {
  const inputs = getBirthInputs();

  if (inputs.year) {
    inputs.year.value = String(parsedDate.year).padStart(4, '0');
  }

  if (inputs.month) {
    inputs.month.value = String(parsedDate.month).padStart(2, '0');
  }

  if (inputs.day) {
    inputs.day.value = String(parsedDate.day).padStart(2, '0');
  }
}

function clearBirthdateInputs() {
  const inputs = getBirthInputs();

  if (inputs.year) {
    inputs.year.value = '';
  }

  if (inputs.month) {
    inputs.month.value = '';
  }

  if (inputs.day) {
    inputs.day.value = '';
  }
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

function getWingCard(birthNumber) {
  // TODO: 문서 기준 고정 정책. 이후 서비스 정의 변경 시 docs/calculation-rules.md와 같이 수정.
  if (birthNumber <= 1) {
    return 0;
  }

  return birthNumber - 1;
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
      profileDescription: '문서와 데이터 파일을 다시 확인해주세요.',
      yearFlowDescription: '연도 흐름 데이터를 아직 연결하지 못했어요.'
    }
  );
}

function getCardImagePath(cardNumber) {
  return CARD_IMAGE_FILES[normalizeCardNumber(cardNumber)] || '';
}

function getAppConfig() {
  return APP_CONFIG || {};
}

function getShareBaseUrl() {
  const configuredBaseUrl = String(getAppConfig().shareBaseUrl || '').trim();

  if (configuredBaseUrl) {
    try {
      const parsed = new URL(configuredBaseUrl);
      return parsed.toString();
    } catch (error) {
      return configuredBaseUrl.endsWith('/') ? configuredBaseUrl : `${configuredBaseUrl}/`;
    }
  }

  if (typeof window !== 'undefined' && window.location?.href) {
    const currentUrl = new URL(window.location.href);
    currentUrl.search = '';
    currentUrl.hash = '';
    return currentUrl.toString();
  }

  return '';
}

function getShareLink() {
  if (!currentProfile?.birthDate) {
    return getShareBaseUrl();
  }

  return SHARE_SERVICE.buildShareResultUrl({
    baseUrl: getShareBaseUrl(),
    cardId: currentProfile.birthCard.canonicalNumber,
    birthDate: currentProfile.birthDate
  });
}

function hasKakaoShareConfig() {
  return Boolean(String(getAppConfig().kakaoJavaScriptKey || '').trim());
}

function loadKakaoSdk() {
  if (typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  if (typeof window !== 'undefined' && window.Kakao) {
    return Promise.resolve(window.Kakao);
  }

  if (kakaoSdkPromise) {
    return kakaoSdkPromise;
  }

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('kakao-js-sdk');

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Kakao), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Kakao SDK load failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'kakao-js-sdk';
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js';
    script.async = true;
    script.onload = () => resolve(window.Kakao);
    script.onerror = () => reject(new Error('Kakao SDK load failed'));
    document.head.appendChild(script);
  });

  return kakaoSdkPromise;
}

async function ensureKakaoShareReady() {
  if (!hasKakaoShareConfig()) {
    return null;
  }

  const kakao = await loadKakaoSdk();
  if (!kakao) {
    return null;
  }

  if (!kakao.isInitialized()) {
    kakao.init(getAppConfig().kakaoJavaScriptKey);
  }

  return kakao;
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

function formatBirthdateValue(parsedDate) {
  const year = String(parsedDate.year).padStart(4, '0');
  const month = String(parsedDate.month).padStart(2, '0');
  const day = String(parsedDate.day).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function getBirthdateFromUrl() {
  if (typeof window === 'undefined' || !window.location) {
    return '';
  }

  try {
    const currentUrl = new URL(window.location.href);
    return currentUrl.searchParams.get('birthdate') || '';
  } catch (error) {
    return '';
  }
}

function getCardSlugFromUrl() {
  if (typeof window === 'undefined' || !window.location) {
    return '';
  }

  try {
    const currentUrl = new URL(window.location.href);
    return currentUrl.searchParams.get('card') || '';
  } catch (error) {
    return '';
  }
}

function replaceHistoryUrl(url) {
  if (typeof window === 'undefined' || !window.history?.replaceState) {
    return;
  }

  window.history.replaceState({}, '', url);
}

function syncUrlWithProfile(profile) {
  if (!profile?.birthDate) {
    return;
  }

  const currentUrl = new URL(getShareBaseUrl() || 'http://localhost/');
  currentUrl.searchParams.set('birthdate', formatBirthdateValue(profile.birthDate));
  replaceHistoryUrl(currentUrl.toString());
}

function clearShareUrl() {
  replaceHistoryUrl(getShareBaseUrl());
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
  const wingNumber = getWingCard(birthReduction.birthNumber);
  const wingCard = getCardContent(wingNumber);
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
    wingNumber,
    wingCard,
    years
  };
}

function createPersonaFallbackCard() {
  return {
    displayNumber: '-',
    name: APP_COPY.personaEmpty?.title || '단일 카드 타입',
    keywords: APP_COPY.personaEmpty?.keywords || ['탄생카드의 결을 크게 공유합니다.'],
    symbolismDescription:
      APP_COPY.personaEmpty?.symbolismDescription ||
      '이번 계산에서는 별도 페르소나 카드가 나오지 않았어요.',
    profileDescription:
      APP_COPY.personaEmpty?.profileDescription ||
      '겉으로 드러나는 모습도 탄생카드의 결을 크게 공유합니다.'
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

function updateDots(index) {
  if (typeof document === 'undefined') {
    return;
  }

  document.querySelectorAll('.dot').forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === index);
  });
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
    `${prefix}-profile`,
    options.profileDescription || cardContent.profileDescription
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
    trace: formatBirthTrace(
      profile.birthDate.year,
      profile.birthDate.month,
      profile.birthDate.day,
      profile.birthReduction
    )
  });
}

function renderPersonaCardSection(profile) {
  if (profile.personaNumber === null) {
    const fallbackCard = createPersonaFallbackCard();
    renderCardSection('res-persona', APP_COPY.persona, fallbackCard, {
      displayNumber: fallbackCard.displayNumber,
      name: fallbackCard.name,
      keywords: fallbackCard.keywords,
      symbolismDescription: fallbackCard.symbolismDescription,
      profileDescription: fallbackCard.profileDescription,
      trace: '중간 축약 과정에서 10부터 22 사이의 값이 직접 나타나지 않았어요.',
      imagePath: '',
      hideImage: true
    });

    const item = document.getElementById('item-persona');
    if (item) {
      item.classList.add('is-empty');
    }

    return;
  }

  const item = document.getElementById('item-persona');
  if (item) {
    item.classList.remove('is-empty');
  }

  const personaCard = getCardContent(profile.personaNumber);
  renderCardSection('res-persona', APP_COPY.persona, personaCard, {
    trace: `탄생카드 축약 과정에서 ${formatReducedValue(profile.birthReduction.personaRaw)}이 나타나 페르소나 카드로 읽습니다.`
  });
}

function renderWingCardSection(profile) {
  renderCardSection('res-wing', APP_COPY.wing, profile.wingCard, {
    trace: `날개 카드 = 탄생카드 ${profile.birthReduction.birthNumber} - 1 -> ${profile.wingCard.displayNumber}`
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

function startProfileFlow(parsedDate, options = {}) {
  const delay = options.skipLoading ? 0 : 350;

  showScreen(options.skipLoading ? 'result' : 'loading');

  window.setTimeout(() => {
    const profile = buildTarotProfile(parsedDate);
    renderProfile(profile);
    syncUrlWithProfile(profile);
  }, delay);
}

function getShareText() {
  if (!currentProfile) {
    return '';
  }

  return SHARE_SERVICE.buildFallbackShareText({
    baseUrl: getShareBaseUrl(),
    cardId: currentProfile.birthCard.canonicalNumber,
    birthDate: currentProfile.birthDate
  });
}

function getShareDescription() {
  if (!currentProfile) {
    return '';
  }

  return SHARE_SERVICE.getShareMetadata(currentProfile.birthCard.canonicalNumber).description;
}

function getKakaoSharePayload() {
  if (!currentProfile) {
    return null;
  }

  return SHARE_SERVICE.buildKakaoSharePayload({
    baseUrl: getShareBaseUrl(),
    cardId: currentProfile.birthCard.canonicalNumber,
    birthDate: currentProfile.birthDate
  });
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
  const kakaoPayload = getKakaoSharePayload();

  try {
    if (!SHARE_UTILS.hasPublicShareBaseUrl(getShareBaseUrl())) {
      console.warn('[share] non-public shareBaseUrl detected; attempting Kakao Share anyway for local testing', {
        shareBaseUrl: getShareBaseUrl()
      });
    }

    const kakao = await ensureKakaoShareReady();
    if (kakao?.Share?.sendDefault && kakaoPayload) {
      console.log('[share] Kakao payload debug', {
        resultUrl: kakaoPayload.content.link.webUrl,
        imageUrl: kakaoPayload.content.imageUrl,
        metadata: SHARE_SERVICE.getShareMetadata(currentProfile.birthCard.canonicalNumber)
      });
      kakao.Share.sendDefault(kakaoPayload);
      setShareFeedback('카카오톡 공유창을 열었어요.');
      return;
    }
  } catch (error) {
    // Kakao SDK 실패 시에도 Web Share / 클립보드 fallback을 유지한다.
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const shareMetadata = SHARE_SERVICE.getShareMetadata(currentProfile.birthCard.canonicalNumber);
      await navigator.share({
        title: shareMetadata.title,
        text: shareText,
        url: getShareLink()
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

  const errorBox = document.getElementById('input-error');
  const swiper = document.getElementById('card-swiper');

  clearBirthdateInputs();

  if (errorBox) {
    errorBox.textContent = '';
  }

  setShareFeedback('');
  clearShareUrl();
  showScreen('landing');

  if (swiper) {
    swiper.scrollLeft = 0;
  }

  updateDots(0);
}

function handleBirthDateInput(event) {
  const maxLength = Number(event.target.getAttribute('maxlength') || '4');
  event.target.value = normalizeBirthInputValue(event.target.value, maxLength);

  const inputs = [getBirthInputs().year, getBirthInputs().month, getBirthInputs().day];
  const currentIndex = inputs.indexOf(event.target);
  const nextInput = inputs[currentIndex + 1];

  if (event.target.value.length === maxLength && nextInput) {
    nextInput.focus();
  }
}

function handleStart() {
  const errorBox = document.getElementById('input-error');
  const inputValue = getBirthdateInputValue();

  if (errorBox) {
    errorBox.textContent = '';
  }

  let parsedDate;
  try {
    validateBirthdateInputs();
    parsedDate = parseBirthDate(inputValue);
  } catch (error) {
    if (errorBox) {
      errorBox.textContent = error.message;
    }
    return;
  }

  startProfileFlow(parsedDate);
}

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
}

function bindEvents() {
  const startButton = document.getElementById('cta-start');
  const restartButton = document.getElementById('restart');
  const shareButton = document.getElementById('share-kakao');
  const birthInputs = getBirthInputs();

  startButton?.addEventListener('click', handleStart);
  restartButton?.addEventListener('click', resetView);
  shareButton?.addEventListener('click', handleShare);
  birthInputs.year?.addEventListener('input', handleBirthDateInput);
  birthInputs.month?.addEventListener('input', handleBirthDateInput);
  birthInputs.day?.addEventListener('input', handleBirthDateInput);

  bindSwiperDots();
}

function initApp() {
  if (typeof document === 'undefined') {
    return;
  }

  bindEvents();
  showScreen('landing');
  updateDots(0);

  const sharedBirthdate = getBirthdateFromUrl();
  const sharedCardSlug = getCardSlugFromUrl();
  if (!sharedBirthdate) {
    return;
  }

  try {
    const parsedDate = parseBirthDate(sharedBirthdate);
    setBirthdateInputs(parsedDate);
    startProfileFlow(parsedDate, { skipLoading: true });
    if (sharedCardSlug) {
      const resolvedProfile = buildTarotProfile(parsedDate);
      const resolvedCardSlug = SHARE_SERVICE.getCardSlug(resolvedProfile.birthCard.canonicalNumber);
      if (resolvedCardSlug !== sharedCardSlug) {
        console.warn('[share] shared card slug does not match restored profile card', {
          sharedCardSlug,
          resolvedCardSlug
        });
      }
    }
  } catch (error) {
    clearShareUrl();
  }
}

const exported = {
  parseBirthDate,
  normalizeBirthInputValue,
  sumDigits,
  reduceToBirthCard,
  getPersonaCard,
  getWingCard,
  getYearCard,
  getYearFlow,
  getCardContent,
  getCardImagePath,
  formatBirthTrace,
  formatBirthdateValue,
  getBirthdateInputValue,
  validateBirthdateInputs,
  formatYearTrace,
  buildTarotProfile,
  getBirthdateFromUrl,
  getCardSlugFromUrl,
  getShareLink,
  getShareDescription,
  getKakaoSharePayload,
  handleShare,
  resetView,
  renderBirthCardSection,
  renderPersonaCardSection,
  renderWingCardSection,
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
