/**
 * Pricing estimate helpers for market/PDP.
 * Run: npx tsx --test src/utils/__tests__/product-quote-estimate.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buyingSummaryFromEstimate,
  estimateProductQuote,
} from '../product-quote-estimate.ts';

describe('product quote estimate', () => {
  it('ABS EXTRUSION local fallback matches ₹14,862.10 for ₹10/MT × 10 MT ADVANCE', () => {
    const summary = estimateProductQuote({
      unitPrice: 10,
      quantity: 10,
      discountRate: 0.05,
      freightPerMt: 1250,
      gstRate: 0.18,
    });
    assert.ok(summary);
    assert.equal(summary.materialSubtotal, 100);
    assert.equal(summary.discount, 5);
    assert.equal(summary.freight, 12500);
    assert.equal(summary.gst, 2267.1);
    assert.equal(summary.grandTotal, 14862.1);
  });

  it('prefers backend estimate breakdown without inventing material price', () => {
    const summary = buyingSummaryFromEstimate({
      binding: false,
      currency: 'INR',
      unitPricePerMt: '10.0000',
      unitPricePerKg: '0.0100',
      quantity: '10',
      paymentMethod: 'ADVANCE',
      amounts: null,
      pricing: {
        materialPricePerMT: '10.0000',
        freightPerMT: '1250.00',
        advanceDiscountPercent: 5,
        gstPercent: 18,
        quantityMT: '10.000',
        materialSubtotal: '100.00',
        freightTotal: '12500.00',
        discountAmount: '5.00',
        taxableAmount: '12595.00',
        gstAmount: '2267.10',
        finalAmount: '14862.10',
        finalAmountPerMT: '1486.21',
        currency: 'INR',
        pricingUnit: 'MT',
        offerId: 'abs-3000d',
        priceVersion: 'abc',
        needsPriceReview: true,
      },
      exTax: {
        material: '100.00',
        discount: '5.00',
        freight: '12500.00',
        platformFee: '0.00',
        taxable: '12595.00',
      },
      tax: { bps: 1800, amount: '2267.10' },
      inclusiveTotal: '14862.10',
    });

    assert.ok(summary);
    assert.equal(summary.unitPrice, 10);
    assert.equal(summary.grandTotal, 14862.1);
    assert.equal(summary.freight, 12500);
  });
});
