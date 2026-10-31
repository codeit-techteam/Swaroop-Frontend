import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { sanitizeDecimal, validateTierInput } from '../tier-validation';

const ok = { minQty: '10', maxQty: '50', discount: '2', price: '141.5' };

describe('validateTierInput', () => {
  it('accepts a valid slab', () => {
    assert.deepEqual(validateTierInput(ok), {});
  });
  it('accepts an open-ended slab', () => {
    assert.deepEqual(validateTierInput({ ...ok, maxQty: '' }), {});
  });
  it('rejects a zero or empty minimum quantity', () => {
    assert.ok(validateTierInput({ ...ok, minQty: '0' }).minQty);
    assert.ok(validateTierInput({ ...ok, minQty: '' }).minQty);
  });
  it('rejects max below min', () => {
    assert.ok(validateTierInput({ ...ok, maxQty: '5' }).maxQty);
  });
  it('rejects a non-positive price', () => {
    assert.ok(validateTierInput({ ...ok, price: '0' }).price);
    assert.ok(validateTierInput({ ...ok, price: '' }).price);
  });
  it('rejects discounts outside 0-99.99', () => {
    assert.ok(validateTierInput({ ...ok, discount: '100' }).discount);
    assert.ok(validateTierInput({ ...ok, discount: '-1' }).discount);
  });
});

describe('sanitizeDecimal', () => {
  it('strips letters and extra dots, caps decimals', () => {
    assert.equal(sanitizeDecimal('12a.3.456'), '12.34');
    assert.equal(sanitizeDecimal('abc'), '');
    assert.equal(sanitizeDecimal('7'), '7');
  });
});
