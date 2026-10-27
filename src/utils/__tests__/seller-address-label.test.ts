/**
 * S-09 seller address / operating location labels.
 * Run: npx tsx --test src/utils/__tests__/seller-address-label.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatSellerBusinessAddressLabel } from '../seller-address-label.ts';
import { formatSellerOperatingLocationLabel } from '../seller-location-label.ts';

describe('formatSellerBusinessAddressLabel', () => {
  it('shows city once with state and pincode', () => {
    assert.equal(
      formatSellerBusinessAddressLabel({
        line1: '12 Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400069',
      }),
      'Mumbai, Maharashtra, 400069',
    );
  });

  it('does not duplicate city when state matches city', () => {
    assert.equal(
      formatSellerBusinessAddressLabel({
        line1: 'Somewhere',
        city: 'Kolkata',
        state: 'Kolkata',
        postalCode: '',
      }),
      'Kolkata',
    );
  });
});

describe('formatSellerOperatingLocationLabel', () => {
  it('never renders City · City', () => {
    assert.equal(
      formatSellerOperatingLocationLabel({
        city: 'Kolkata',
        name: 'Kolkata',
        warehouse: 'Kolkata',
        state: 'West Bengal',
      }),
      'Kolkata · West Bengal',
    );
  });
});
