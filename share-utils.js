(function initShareUtils(root, factory) {
  const payload = factory();

  root.SHARE_UTILS = payload;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = payload;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildShareUtils() {
  function sanitizeBaseUrl(baseUrl) {
    const normalizedBaseUrl = String(baseUrl || '').trim();

    try {
      const parsed = new URL(normalizedBaseUrl || 'http://localhost/');
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString().replace(/\/$/, '');
    } catch (error) {
      return (normalizedBaseUrl || 'http://localhost').replace(/\/$/, '');
    }
  }

  function isAbsoluteUrl(value) {
    return /^https?:\/\//i.test(String(value || '').trim());
  }

  function isLocalhostUrl(value) {
    try {
      const parsed = new URL(String(value || '').trim());
      return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
    } catch (error) {
      return false;
    }
  }

  function hasPublicShareBaseUrl(baseUrl) {
    return isAbsoluteUrl(baseUrl) && !isLocalhostUrl(baseUrl);
  }

  function buildResultUrl(baseUrl, cardId, birthdate) {
    const sanitizedBaseUrl = sanitizeBaseUrl(baseUrl);
    const encodedCardId = encodeURIComponent(String(cardId || 'default'));
    const encodedBirthdate = birthdate ? encodeURIComponent(String(birthdate)) : '';
    return `${sanitizedBaseUrl}/result?card=${encodedCardId}${encodedBirthdate ? `&birthdate=${encodedBirthdate}` : ''}`;
  }

  function buildAbsoluteImageUrl(baseUrl, imagePathOrUrl) {
    const rawValue = String(imagePathOrUrl || '').trim();
    if (!rawValue) {
      return '';
    }

    if (isAbsoluteUrl(rawValue)) {
      if (isLocalhostUrl(rawValue)) {
        console.warn('[share] imageUrl points to localhost and will not work in Kakao:', rawValue);
      }
      return rawValue;
    }

    const absoluteUrl = new URL(rawValue.replace(/^\//, ''), `${sanitizeBaseUrl(baseUrl)}/`).toString();
    if (isLocalhostUrl(absoluteUrl)) {
      console.warn('[share] imageUrl resolved to localhost and will not work in Kakao:', absoluteUrl);
    }
    return absoluteUrl;
  }

  return {
    sanitizeBaseUrl,
    isAbsoluteUrl,
    isLocalhostUrl,
    hasPublicShareBaseUrl,
    buildResultUrl,
    buildAbsoluteImageUrl
  };
});
