import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { routeForPushData } from '../push-navigation.ts';

describe('routeForPushData', () => {
  it('opens order, purchase request, payment and dispatch screens', () => {
    assert.equal(
      routeForPushData({ entityType: 'ORDER' }, 'customer'),
      '/(customer)/(tabs)/orders',
    );
    assert.equal(
      routeForPushData({ entityType: 'PURCHASE_REQUEST', entityId: 'pr-1' }, 'seller'),
      '/(seller)/purchase-request-detail?id=pr-1',
    );
    assert.equal(
      routeForPushData({ entityType: 'PAYMENT' }, 'customer'),
      '/(customer)/payment-reminder',
    );
    assert.equal(
      routeForPushData({ entityType: 'SHIPMENT' }, 'seller'),
      '/(seller)/dispatch',
    );
    assert.equal(
      routeForPushData(
        { entityType: 'NEW_GRADE_REQUEST', entityId: 'gr-1' },
        'customer',
      ),
      '/(customer)/grade-requests/gr-1',
    );
    assert.equal(
      routeForPushData({ entityType: 'SHIPMENT' }, 'customer'),
      '/(customer)/shipment-tracking',
    );
    assert.equal(
      routeForPushData({ title: 'Truck dispatched' }, 'customer'),
      '/(customer)/shipment-tracking',
    );
  });

  it('rejects an external route and keeps the seller destination internal', () => {
    assert.equal(
      routeForPushData(
        { route: 'https://evil.example/phish', entityType: 'ORDER' },
        'customer',
      ),
      '/(customer)/(tabs)/orders',
    );
    assert.equal(
      routeForPushData({ route: '/(seller)/orders', entityType: 'ORDER' }, 'customer'),
      '/(customer)/(tabs)/orders',
    );
  });
});
