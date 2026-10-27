/**
 * Seller numeric / selling-price sanitizers (N-07).
 * Run: npx tsx --test src/seller/utils/__tests__/numeric-input.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isPublishablePrice,
  positiveOrEmpty,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
  sanitizePriceInput,
} from '../numeric-input.ts';

describe('sanitizeIntegerInput', () => {
  it('strips leading zeros when typing over a default zero', () => {
    assert.equal(sanitizeIntegerInput('010'), '10');
    assert.equal(sanitizeIntegerInput('0'), '0');
    assert.equal(sanitizeIntegerInput(''), '');
    assert.equal(sanitizeIntegerInput('12a3'), '123');
  });
});

describe('sanitizeDecimalInput', () => {
  it('keeps a single decimal and strips leading zeros', () => {
    assert.equal(sanitizeDecimalInput('010.5'), '10.5');
    assert.equal(sanitizeDecimalInput('0.5'), '0.5');
    assert.equal(sanitizeDecimalInput('.5'), '0.5');
    assert.equal(sanitizeDecimalInput('.50'), '0.50');
  });
});

describe('sanitizePriceInput', () => {
  it('clears the field when a minus or plus is typed (N-07)', () => {
    assert.equal(sanitizePriceInput('-'), '');
    assert.equal(sanitizePriceInput('-5'), '');
    assert.equal(sanitizePriceInput('−5'), '');
    assert.equal(sanitizePriceInput('5-'), '');
    assert.equal(sanitizePriceInput('+5'), '');
  });

  it('normalizes leading-dot amounts and keeps valid positives', () => {
    assert.equal(sanitizePriceInput('.50'), '0.50');
    assert.equal(sanitizePriceInput('104250'), '104250');
    assert.equal(sanitizePriceInput('0.5'), '0.5');
  });
});

describe('isPublishablePrice', () => {
  it('requires a finite amount greater than zero', () => {
    assert.equal(isPublishablePrice(''), false);
    assert.equal(isPublishablePrice('0'), false);
    assert.equal(isPublishablePrice('0.00'), false);
    assert.equal(isPublishablePrice('.'), false);
    assert.equal(isPublishablePrice('0.'), false);
    assert.equal(isPublishablePrice('-5'), false);
    assert.equal(isPublishablePrice('0.50'), true);
    assert.equal(isPublishablePrice('104250'), true);
  });
});

describe('positiveOrEmpty', () => {
  it('returns empty for zero or invalid catalog defaults', () => {
    assert.equal(positiveOrEmpty(0), '');
    assert.equal(positiveOrEmpty('0'), '');
    assert.equal(positiveOrEmpty(25), '25');
  });
});
