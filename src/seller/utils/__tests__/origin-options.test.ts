/**
 * Seller origin options (S-13).
 * Run: npx tsx --test src/seller/utils/__tests__/origin-options.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  normalizeSellerOrigin,
  SELLER_ORIGIN_OPTIONS,
} from '../../constants/grade-options.ts';

describe('SELLER_ORIGIN_OPTIONS (S-13)', () => {
  it('lists each country once without KSA alias', () => {
    assert.ok(SELLER_ORIGIN_OPTIONS.includes('Saudi Arabia'));
    assert.equal((SELLER_ORIGIN_OPTIONS as readonly string[]).includes('KSA'), false);
    assert.equal(new Set(SELLER_ORIGIN_OPTIONS).size, SELLER_ORIGIN_OPTIONS.length);
  });

  it('maps KSA and related aliases to Saudi Arabia', () => {
    assert.equal(normalizeSellerOrigin('KSA'), 'Saudi Arabia');
    assert.equal(normalizeSellerOrigin('ksa'), 'Saudi Arabia');
    assert.equal(normalizeSellerOrigin('Saudi Arabia'), 'Saudi Arabia');
    assert.equal(normalizeSellerOrigin('Kingdom of Saudi Arabia'), 'Saudi Arabia');
  });
});
