const test = require('node:test');
const assert = require('node:assert/strict');

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

test('getWingCard wraps 1 to 0', () => {
  assert.equal(typeof tarot.getWingCard, 'function');
  assert.equal(tarot.getWingCard(1), 0);
  assert.equal(tarot.getWingCard(8), 7);
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
