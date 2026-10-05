/**
 * Seller Mobile listing payload sent to POST/PATCH /seller/products/listings.
 * Run: npx tsx --test src/seller/utils/__tests__/listing-input.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildListingInput, canSaveListingToBackend, isBackendId } from '../listing-input.ts';

const GRADE_ID = '3f2b7c1e-8a4d-4f6b-9c2e-1d5a7b9e0f12';

const snapshot = () => ({
  form: {
    name: 'PP MOULD H110MA - RIL',
    grade: 'SO-PP-H110MA-RIL-1A2B3C',
    category: 'PP',
    brand: ' RIL ',
    origin: 'India',
    description: 'Fresh stock',
    availableQty: '25',
    moq: '5',
    warehouseLocation: 'Bhiwandi',
    polymerType: 'PP',
    packagingType: '25 kg bags',
    unit: 'MT',
    currency: 'INR',
    gstPercent: '18',
    reservedQty: '0',
    catalogProductId: GRADE_ID,
  },
  pricing: { sellingPrice: '104250' },
  tiers: [
    { id: 't1', minQty: '1', maxQty: '10', price: '104250', discountLabel: 'Standard' },
    { id: 't2', minQty: '10', maxQty: '', price: '0', discountLabel: 'Tier 2' },
  ],
  technicalSpecs: {
    mfi: '11',
    density: '',
    primaryApplication: 'Injection moulding',
    technicalDatasheetName: '',
    qualityCertificateName: '',
  },
});

describe('seller listing payload', () => {
  it('sends the Grade Master id and numeric commercial fields', () => {
    const input = buildListingInput(snapshot(), true);
    assert.equal(input.gradeId, GRADE_ID);
    assert.equal(input.manufacturer, 'RIL');
    assert.equal(input.sellingPrice, 104250);
    assert.equal(input.availableStock, 25);
    assert.equal(input.moq, 5);
    assert.equal(input.warehouseName, 'Bhiwandi');
    assert.equal(input.publishToMarketplace, true);
    assert.equal(input.density, undefined);
  });

  it('drops price tiers without a price instead of sending ₹0 tiers', () => {
    const input = buildListingInput(snapshot(), true);
    assert.deepEqual(input.priceTiers, [
      { minQty: 1, maxQty: 10, price: 104250, label: 'Standard' },
    ]);
  });

  it('keeps drafts without a price or grade on the device', () => {
    assert.equal(canSaveListingToBackend(snapshot()), true);
    assert.equal(canSaveListingToBackend({ ...snapshot(), pricing: { sellingPrice: '' } }), false);
    assert.equal(
      canSaveListingToBackend({
        ...snapshot(),
        form: { ...snapshot().form, catalogProductId: 'mkt-pp-raffia' },
      }),
      false,
    );
  });

  it('only treats UUIDs as backend product ids', () => {
    assert.equal(isBackendId(GRADE_ID), true);
    assert.equal(isBackendId('seller-product-1759650000-ab12cd'), false);
    assert.equal(isBackendId(null), false);
  });
});
