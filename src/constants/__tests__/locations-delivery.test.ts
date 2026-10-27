import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FALLBACK_DELIVERY_LOCATION,
  isDeliveryLocationChosen,
  resolveDeliveryLocation,
} from '../locations';

describe('isDeliveryLocationChosen (N-06)', () => {
  it('rejects null, unset fallback, and legacy sample city presets', () => {
    assert.equal(isDeliveryLocationChosen(null), false);
    assert.equal(isDeliveryLocationChosen(FALLBACK_DELIVERY_LOCATION), false);
    assert.equal(
      isDeliveryLocationChosen({
        id: 'loc-chennai',
        city: 'Chennai',
        state: 'TN',
        pincode: '600012',
        label: 'Chennai, TN 600012',
        source: 'preset',
      }),
      false,
    );
    assert.equal(
      isDeliveryLocationChosen({
        id: 'loc-mumbai',
        city: 'Mumbai',
        state: 'MH',
        pincode: '400001',
        label: 'Mumbai, MH 400001',
      }),
      false,
    );
  });

  it('accepts a real GPS / pincode / saved choice', () => {
    assert.equal(
      isDeliveryLocationChosen({
        id: 'gps-current',
        city: 'Chennai',
        state: 'TN',
        pincode: '600012',
        label: 'Chennai, TN 600012',
        source: 'gps',
      }),
      true,
    );
  });
});

describe('resolveDeliveryLocation', () => {
  it('returns the Set delivery location prompt when unset', () => {
    assert.equal(resolveDeliveryLocation(null).label, 'Set delivery location');
    assert.equal(
      resolveDeliveryLocation({
        id: 'loc-chennai',
        city: 'Chennai',
        state: 'TN',
        pincode: '600001',
        label: 'Chennai, TN 600001',
      }).label,
      'Set delivery location',
    );
  });
});
