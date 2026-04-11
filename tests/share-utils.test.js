const test = require('node:test');
const assert = require('node:assert/strict');

const shareUtils = require('../share-utils.js');

test('buildResultUrl creates public result url with encoded query params', () => {
  const resultUrl = shareUtils.buildResultUrl(
    'https://tarot.example.com/',
    'wheel_of_fortune',
    '1997.10.17'
  );

  assert.equal(
    resultUrl,
    'https://tarot.example.com/result?card=wheel_of_fortune&birthdate=1997.10.17'
  );
});

test('buildAbsoluteImageUrl resolves relative path against base url', () => {
  const imageUrl = shareUtils.buildAbsoluteImageUrl(
    'https://tarot.example.com/',
    'images/share/strength.png'
  );

  assert.equal(imageUrl, 'https://tarot.example.com/images/share/strength.png');
});

test('hasPublicShareBaseUrl rejects localhost and accepts public domain', () => {
  assert.equal(shareUtils.hasPublicShareBaseUrl('http://127.0.0.1:4173/'), false);
  assert.equal(shareUtils.hasPublicShareBaseUrl('https://tarot.example.com/'), true);
});
