(function initShareService(root, factory) {
  const payload = factory(root);

  root.SHARE_SERVICE = payload;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = payload;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildShareService(root) {
  const utilsSource = (() => {
    if (root && root.SHARE_UTILS) {
      return root;
    }

    try {
      return require('./share-utils.js');
    } catch (error) {
      return {};
    }
  })();
  const metadataSource = (() => {
    if (root && root.SHARE_METADATA) {
      return root;
    }

    try {
      return require('./data/share-metadata.js');
    } catch (error) {
      return {};
    }
  })();

  const SHARE_METADATA = metadataSource.SHARE_METADATA || {};
  const SHARE_UTILS = utilsSource.SHARE_UTILS || utilsSource;
  const CARD_SLUGS = {
    0: 'fool',
    1: 'magician',
    2: 'high_priestess',
    3: 'empress',
    4: 'emperor',
    5: 'hierophant',
    6: 'lovers',
    7: 'chariot',
    8: 'strength',
    9: 'hermit',
    10: 'wheel_of_fortune',
    11: 'justice',
    12: 'hanged_man',
    13: 'death',
    14: 'temperance',
    15: 'devil',
    16: 'tower',
    17: 'star',
    18: 'moon',
    19: 'sun',
    20: 'judgement',
    21: 'world'
  };

  function normalizeCardNumber(cardId) {
    const numericValue = Number(cardId);

    if (numericValue === 22) {
      return 0;
    }

    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  function formatBirthdateValue(parsedDate) {
    if (!parsedDate) {
      return '';
    }

    const year = String(parsedDate.year).padStart(4, '0');
    const month = String(parsedDate.month).padStart(2, '0');
    const day = String(parsedDate.day).padStart(2, '0');

    return `${year}.${month}.${day}`;
  }

  function getCardSlug(cardId) {
    return CARD_SLUGS[normalizeCardNumber(cardId)] || 'default';
  }

  function getShareMetadata(cardId) {
    const slug = getCardSlug(cardId);
    const defaultMetadata = SHARE_METADATA.default || {
      title: '당신의 타로 결과를 확인해보세요',
      description: '지금의 결을 읽어주는 타로 프로필입니다. 자세한 해석을 눌러 확인해보세요.',
      imageUrl: 'bg.png',
      buttonTitle: '결과 보기',
      keywords: ['타로', '자기이해', '흐름']
    };

    return {
      slug,
      ...defaultMetadata,
      ...(SHARE_METADATA[slug] || {})
    };
  }

  function buildShareResultUrl(options = {}) {
    const cardSlug = getCardSlug(options.cardId);
    const birthdate = options.birthdate || formatBirthdateValue(options.birthDate);
    return SHARE_UTILS.buildResultUrl(options.baseUrl, cardSlug, birthdate);
  }

  function getDefaultImageUrl(baseUrl) {
    const defaultMetadata = SHARE_METADATA.default || {};
    return SHARE_UTILS.buildAbsoluteImageUrl(baseUrl, defaultMetadata.imageUrl || 'images/share/default.png');
  }

  function getShareImageUrl(baseUrl, metadata) {
    const metadataImageUrl = metadata?.imageUrl || '';
    const absoluteImageUrl = SHARE_UTILS.buildAbsoluteImageUrl(baseUrl, metadataImageUrl);

    if (!absoluteImageUrl) {
      return getDefaultImageUrl(baseUrl);
    }

    if (!SHARE_UTILS.isAbsoluteUrl(absoluteImageUrl)) {
      return getDefaultImageUrl(baseUrl);
    }

    return absoluteImageUrl;
  }

  function buildKakaoSharePayload(options = {}) {
    const metadata = getShareMetadata(options.cardId);
    const resultUrl = buildShareResultUrl(options);
    const imageUrl = getShareImageUrl(options.baseUrl, metadata);

    return {
      objectType: 'feed',
      content: {
        title: metadata.title,
        description: metadata.description,
        imageUrl,
        link: {
          mobileWebUrl: resultUrl,
          webUrl: resultUrl
        }
      },
      buttons: [
        {
          title: metadata.buttonTitle,
          link: {
            mobileWebUrl: resultUrl,
            webUrl: resultUrl
          }
        }
      ]
    };
  }

  function buildFallbackShareText(options = {}) {
    const metadata = getShareMetadata(options.cardId);
    const resultUrl = buildShareResultUrl(options);
    const keywords = Array.isArray(metadata.keywords) && metadata.keywords.length
      ? `키워드: ${metadata.keywords.join(', ')}`
      : '';

    return [
      metadata.title,
      '',
      metadata.description,
      keywords,
      '',
      resultUrl
    ]
      .filter(Boolean)
      .join('\n');
  }

  return {
    CARD_SLUGS,
    getCardSlug,
    getShareMetadata,
    buildShareResultUrl,
    buildKakaoSharePayload,
    buildFallbackShareText,
    getShareImageUrl
  };
});
