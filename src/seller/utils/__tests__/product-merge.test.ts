/**
 * Backend product refresh must not wipe drafts that only exist on the device.
 * Run: npx tsx --test src/seller/utils/__tests__/product-merge.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { SellerProduct } from '../../types/index.ts';
import { mergeApiProductsWithDeviceDrafts } from '../product-merge.ts';

const BACKEND_A = '3f2b7c1e-8a4d-4f6b-9c2e-1d5a7b9e0f12';
const BACKEND_B = '9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d';

const product = (id: string, status: SellerProduct['status'], name = id): SellerProduct => ({
  id,
  productId: `PT-${id.slice(0, 6)}`,
  status,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  imageUrl: '',
  form: {
    name,
    grade: '',
    category: '',
    brand: '',
    origin: 'India',
    description: '',
    availableQty: '',
    moq: '',
    warehouseLocation: '',
    polymerType: '',
    packagingType: '25 kg bags',
    unit: 'MT',
    currency: 'INR',
    gstPercent: '18',
    reservedQty: '0',
    catalogProductId: '',
  },
  pricing: { sellingPrice: '' },
  tiers: [],
  technicalSpecs: {
    mfi: '',
    density: '',
    primaryApplication: '',
    technicalDatasheetName: '',
    qualityCertificateName: '',
  },
});

describe('mergeApiProductsWithDeviceDrafts', () => {
  it('keeps device-only drafts when the backend list is applied', () => {
    const draft = product('seller-product-1759650000-ab12cd', 'draft');
    const merged = mergeApiProductsWithDeviceDrafts([draft], [product(BACKEND_A, 'published')]);
    assert.deepEqual(
      merged.map((item) => item.id),
      [BACKEND_A, draft.id],
    );
  });

  it('keeps device-only drafts when the backend returns nothing', () => {
    const draft = product('seller-product-1759650000-ab12cd', 'draft');
    assert.deepEqual(mergeApiProductsWithDeviceDrafts([draft], []), [draft]);
  });

  it('replaces local copies of backend rows with the backend version', () => {
    const local = product(BACKEND_A, 'draft', 'stale local copy');
    const remote = product(BACKEND_A, 'published', 'backend copy');
    const merged = mergeApiProductsWithDeviceDrafts([local], [remote]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].form.name, 'backend copy');
    assert.equal(merged[0].status, 'published');
  });

  it('drops backend rows that the backend no longer returns', () => {
    const merged = mergeApiProductsWithDeviceDrafts(
      [product(BACKEND_A, 'published'), product(BACKEND_B, 'draft')],
      [product(BACKEND_B, 'draft')],
    );
    assert.deepEqual(
      merged.map((item) => item.id),
      [BACKEND_B],
    );
  });

  it('shows never-synced "published" items as drafts', () => {
    const legacy = product('seller-product-1700000000-zz99yy', 'published');
    const inactive = product('seller-product-1700000001-xx88ww', 'inactive');
    const merged = mergeApiProductsWithDeviceDrafts([legacy, inactive], []);
    assert.equal(merged[0].status, 'draft');
    assert.equal(merged[1].status, 'inactive');
    assert.equal(legacy.status, 'published');
  });
});
