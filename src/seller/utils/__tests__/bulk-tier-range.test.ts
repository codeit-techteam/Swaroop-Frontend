import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  defaultBulkTierMaxQty,
  formatBulkTierRangeLabel,
  normalizeBulkTierMaxQty,
} from '@/seller/utils/bulk-tier-range';

describe('bulk tier range (S-05)', () => {
  it('never formats a default band as 1-0 MT', () => {
    assert.equal(formatBulkTierRangeLabel('1', '0'), '1+ MT');
    assert.equal(formatBulkTierRangeLabel('1', ''), '1+ MT');
    assert.equal(formatBulkTierRangeLabel('1', null), '1+ MT');
    assert.equal(formatBulkTierRangeLabel(1, 0), '1+ MT');
  });

  it('formats a closed sensible range', () => {
    assert.equal(formatBulkTierRangeLabel('1', '10'), '1-10 MT');
    assert.equal(formatBulkTierRangeLabel(1, 25), '1-25 MT');
  });

  it('falls back when max is below min', () => {
    assert.equal(formatBulkTierRangeLabel('10', '5'), '10+ MT');
  });

  it('normalizes non-positive maxQty to null for persistence', () => {
    assert.equal(normalizeBulkTierMaxQty('0'), null);
    assert.equal(normalizeBulkTierMaxQty(''), null);
    assert.equal(normalizeBulkTierMaxQty(null), null);
    assert.equal(normalizeBulkTierMaxQty('10'), 10);
  });

  it('seeds catalog tiers with max 10 when MOQ is missing or not an upper bound', () => {
    assert.equal(defaultBulkTierMaxQty(''), '10');
    assert.equal(defaultBulkTierMaxQty(0), '10');
    assert.equal(defaultBulkTierMaxQty(1), '10');
    assert.equal(defaultBulkTierMaxQty(25), '25');
  });
});
