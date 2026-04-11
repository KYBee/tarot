const test = require('node:test');
const assert = require('node:assert/strict');

const shareService = require('../share-service.js');

test('getShareMetadata returns card-specific metadata for canonical id', () => {
  const metadata = shareService.getShareMetadata(8);

  assert.equal(metadata.slug, 'strength');
  assert.equal(metadata.title, '당신의 타로 카드는 힘');
  assert.equal(metadata.buttonTitle, '결과 보기');
});

test('buildShareResultUrl includes result path, card slug, and birthdate', () => {
  const url = shareService.buildShareResultUrl({
    baseUrl: 'http://127.0.0.1:4173/',
    cardId: 8,
    birthDate: {
      year: 1997,
      month: 10,
      day: 17
    }
  });

  assert.equal(url, 'http://127.0.0.1:4173/result?card=strength&birthdate=1997.10.17');
});

test('buildKakaoSharePayload uses metadata and result url', () => {
  const payload = shareService.buildKakaoSharePayload({
    baseUrl: 'http://127.0.0.1:4173/',
    cardId: 0,
    birthDate: {
      year: 2004,
      month: 2,
      day: 29
    }
  });

  assert.equal(payload.objectType, 'feed');
  assert.equal(payload.content.title, '당신의 타로 카드는 바보');
  assert.equal(payload.content.link.webUrl, 'http://127.0.0.1:4173/result?card=fool&birthdate=2004.02.29');
  assert.equal(payload.buttons[0].title, '결과 보기');
});
