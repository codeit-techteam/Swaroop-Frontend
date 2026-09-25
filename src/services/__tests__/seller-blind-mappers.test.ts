/**
 * Blind marketplace mapper guards for Seller Mobile.
 * Run: node --experimental-strip-types --test src/services/__tests__/seller-blind-mappers.test.ts
 * Or:  npx tsx --test src/services/__tests__/seller-blind-mappers.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  mapBlindSellerOrderBuyer,
  mapBlindSellerPurchaseRequest,
} from '../seller-blind-mappers.ts';

describe('seller purchase request blind mapping', () => {
  it('never surfaces customer identity fields', () => {
    const mapped = mapBlindSellerPurchaseRequest({
      id: 'pr-1',
      referenceNumber: 'PR-2026-000123',
      status: 'SOURCING',
      paymentMethod: 'ADVANCE',
      targetPrice: 104,
      destinationRegion: 'West India',
      notes: 'Urgent',
      createdAt: '2026-09-25T10:00:00.000Z',
      buyer: { displayName: 'Anonymous Buyer', reference: 'BUYER-ABCDEF12' },
      items: [
        {
          product: { id: 'prod-1', name: 'HDPE Film' },
          grade: { name: 'HD Film', code: 'HDF' },
          quantity: 500,
          unit: 'MT',
          targetUnitPrice: 104,
        },
      ],
    });

    const serialized = JSON.stringify(mapped);
    assert.equal(mapped.buyerLabel, 'Anonymous Buyer');
    assert.equal(mapped.buyerReference, 'BUYER-ABCDEF12');
    assert.equal(mapped.requestNumber, 'PR-2026-000123');
    assert.doesNotMatch(serialized, /ABC Packaging/i);
    assert.doesNotMatch(serialized, /leak@example\.com/i);
    assert.ok(!('customerName' in mapped));
    assert.ok(!('customerEmail' in mapped));
    assert.ok(!('customerPhone' in mapped));
    assert.ok(!('customerId' in mapped));
  });

  it('defaults buyer label when buyer payload is missing', () => {
    const mapped = mapBlindSellerPurchaseRequest({
      id: 'pr-2',
      referenceNumber: 'PR-2',
      status: 'SUBMITTED',
      items: [],
    });
    assert.equal(mapped.buyerLabel, 'Anonymous Buyer');
    assert.equal(mapped.buyerReference, 'BUYER-UNKNOWN');
  });

  it('ignores leaked customer fields if present on input object', () => {
    const leaked = {
      id: 'pr-3',
      referenceNumber: 'PR-3',
      status: 'SOURCING',
      buyer: { displayName: 'Anonymous Buyer', reference: 'BUYER-11111111' },
      items: [],
      customerName: 'ABC Packaging Pvt Ltd',
      customerEmail: 'leak@example.com',
      customerPhone: '9999999999',
    };
    const mapped = mapBlindSellerPurchaseRequest(leaked);
    const serialized = JSON.stringify(mapped);
    assert.doesNotMatch(serialized, /ABC Packaging/i);
    assert.doesNotMatch(serialized, /leak@example\.com/i);
    assert.doesNotMatch(serialized, /9999999999/);
  });
});

describe('seller order blind buyer mapping', () => {
  it('uses anonymous buyer display name only', () => {
    const mapped = mapBlindSellerOrderBuyer({
      displayName: 'Anonymous Buyer',
      reference: 'BUYER-ZZZZZZZZ',
    });
    assert.equal(mapped.buyerName, 'Anonymous Buyer');
    assert.equal(mapped.buyerId, 'BUYER-ZZZZZZZZ');
  });

  it('defaults when buyer is absent', () => {
    const mapped = mapBlindSellerOrderBuyer(undefined);
    assert.equal(mapped.buyerName, 'ANONYMOUS BUYER');
    assert.equal(mapped.buyerId, '');
  });
});
