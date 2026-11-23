/**
 * Run: npx tsx --test src/utils/__tests__/market-search-commercial-dedupe.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CustomerGrade } from '../../types/grade-master';
import type { MarketProduct } from '../../types/market';
import { buildMarketSearchRows } from '../market-search-rows';

const grade = (partial: Partial<CustomerGrade> & Pick<CustomerGrade, 'id'>): CustomerGrade => ({
  code: partial.code ?? partial.id,
  name: partial.name ?? partial.id,
  displayName: partial.displayName ?? partial.name ?? partial.id,
  description: null,
  gradeGroup: null,
  gradeNo: null,
  manufacturer: null,
  fullGradeName: null,
  category: null,
  liveOfferCount: 0,
  ...partial,
});

const product = (
  partial: Partial<MarketProduct> & Pick<MarketProduct, 'id'>,
): MarketProduct => ({
  name: partial.name ?? partial.id,
  grade: partial.grade ?? 'ABS',
  price: 124_800,
  origin: 'Western India Region',
  stock: 10,
  moq: 1,
  eta: '3 days',
  category: 'abs',
  badge: 'Best Value',
  ...partial,
});

describe('buildMarketSearchRows commercial dedupe', () => {
  it('collapses identical ABS live listings that only differ by product id', () => {
    const g = grade({
      id: 'g-abs-inj',
      gradeNo: 'ABS-IM-150',
      displayName: 'ABS Injection',
      liveOfferCount: 2,
    });
    const a = product({
      id: 'p1',
      gradeId: 'g-abs-inj',
      name: 'ABS Injection Grade',
      gradeCode: 'ABS-IM-150',
    });
    const b = product({
      id: 'p2',
      gradeId: 'g-abs-inj',
      name: 'ABS Injection Grade',
      gradeCode: 'ABS-IM-150',
    });

    const rows = buildMarketSearchRows([g], [a, b], 'ABS INJ');
    const products = rows.filter((row) => row.kind === 'product');
    assert.equal(products.length, 1);
  });

  it('keeps commercially distinct offers for the same grade', () => {
    const g = grade({ id: 'g1', liveOfferCount: 2 });
    const cheap = product({ id: 'p1', gradeId: 'g1', price: 100_000 });
    const dear = product({ id: 'p2', gradeId: 'g1', price: 150_000 });

    const rows = buildMarketSearchRows([g], [cheap, dear]);
    assert.equal(rows.filter((row) => row.kind === 'product').length, 2);
  });
});
