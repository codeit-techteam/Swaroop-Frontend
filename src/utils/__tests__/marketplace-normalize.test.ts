/**
 * Run: npx tsx --test src/utils/__tests__/marketplace-normalize.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CustomerGrade } from '../../types/grade-master';
import type { MarketProduct } from '../../types/market';
import {
  deduplicateCatalogueGrades,
  deduplicateLiveListings,
  inspectMarketplaceDuplicates,
} from '../marketplace-normalize';
import { buildMarketSearchRows } from '../market-search-rows';
import { getGradeSearchSuggestions } from '../grade-search';

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
  origin: 'Northern India Region',
  stock: 10,
  moq: 12,
  eta: '4–6 Days',
  category: 'abs',
  badge: 'Best Value',
  ...partial,
});

describe('marketplace normalize — catalogue grades', () => {
  it('collapses duplicate grade ids', () => {
    const rows = deduplicateCatalogueGrades([
      grade({ id: 'grade-1', name: 'ABS Injection Grade' }),
      grade({ id: 'grade-1', name: 'ABS Injection Grade' }),
    ]);
    assert.equal(rows.length, 1);
  });

  it('keeps different grade ids even when names match', () => {
    const rows = deduplicateCatalogueGrades([
      grade({ id: 'grade-1', name: 'ABS Injection Grade' }),
      grade({ id: 'grade-2', name: 'ABS Injection Grade' }),
    ]);
    assert.equal(rows.length, 2);
  });
});

describe('marketplace normalize — live listings', () => {
  it('collapses duplicate product ids', () => {
    const a = product({ id: 'p1', offerId: 'o1' });
    const rows = deduplicateLiveListings([a, { ...a }]);
    assert.equal(rows.length, 1);
  });

  it('collapses duplicate offer ids across different product ids', () => {
    const rows = deduplicateLiveListings([
      product({ id: 'p1', offerId: 'offer-1', stock: 10 }),
      product({ id: 'p2', offerId: 'offer-1', stock: 40 }),
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.id, 'p2');
  });

  it('collapses commercially identical ABS Injection twins', () => {
    const rows = deduplicateLiveListings([
      product({
        id: 'p1',
        offerId: 'o1',
        gradeId: 'g-abs-inj',
        name: 'ABS Injection Grade',
        gradeCode: 'ABS-IM-150',
        stock: 100,
      }),
      product({
        id: 'p2',
        offerId: 'o2',
        gradeId: 'g-abs-inj',
        name: 'ABS Injection Grade',
        gradeCode: 'ABS-IM-150',
        stock: 260,
      }),
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.id, 'p2');
  });

  it('keeps commercially distinct offers for the same grade', () => {
    const rows = deduplicateLiveListings([
      product({ id: 'p1', offerId: 'o1', gradeId: 'g1', price: 100_000 }),
      product({ id: 'p2', offerId: 'o2', gradeId: 'g1', price: 150_000 }),
    ]);
    assert.equal(rows.length, 2);
  });

  it('collapses twins that only differ by warehouseLabel', () => {
    const rows = deduplicateLiveListings([
      product({
        id: 'p1',
        offerId: 'o1',
        gradeId: 'g-fr',
        name: 'ABS Flame Retardant Compound',
        warehouseLabel: 'Panipat Hub',
        stock: 40,
      }),
      product({
        id: 'p2',
        offerId: 'o2',
        gradeId: 'g-fr',
        name: 'ABS Flame Retardant Compound',
        warehouseLabel: 'Delhi Hub',
        stock: 90,
      }),
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.id, 'p2');
  });

  it('dedupes when pagination accidentally repeats a listing id', () => {
    const page1 = product({ id: 'offer-page', offerId: 'o1', gradeId: 'g1', stock: 10 });
    const page2Extra = product({ id: 'other', offerId: 'o2', gradeId: 'g2', price: 200_000 });
    const rows = deduplicateLiveListings([page1, page2Extra, { ...page1, stock: 5 }]);
    assert.equal(rows.length, 2);
    assert.deepEqual(
      rows.map((row) => row.id).sort(),
      ['offer-page', 'other'],
    );
  });
});

describe('marketplace normalize — search + typeahead surfaces', () => {
  it('search rows collapse ABS Injection commercial twins', () => {
    const g = grade({
      id: 'g-abs-inj',
      displayName: 'ABS Injection',
      liveOfferCount: 2,
    });
    const rows = buildMarketSearchRows(
      [g],
      [
        product({ id: 'p1', gradeId: 'g-abs-inj', name: 'ABS Injection Grade' }),
        product({ id: 'p2', gradeId: 'g-abs-inj', name: 'ABS Injection Grade' }),
      ],
      'ABS Injection',
    );
    assert.equal(rows.filter((row) => row.kind === 'product').length, 1);
  });

  it('typeahead Live Listings collapse ABS Flame Retardant twins', () => {
    const suggestions = getGradeSearchSuggestions(
      [
        product({
          id: 'p1',
          gradeId: 'g-fr',
          name: 'ABS Flame Retardant Compound',
          gradeCode: 'CMP-ABS-FR',
          price: 148_000,
          moq: 8,
        }),
        product({
          id: 'p2',
          gradeId: 'g-fr',
          name: 'ABS Flame Retardant Compound',
          gradeCode: 'CMP-ABS-FR',
          price: 148_000,
          moq: 8,
          stock: 90,
        }),
      ],
      [],
      'ABS FL',
      {
        grades: [
          grade({
            id: 'g-fr',
            code: 'COMPOUND_ABS_FR',
            displayName: 'ABS FR Compound',
            liveOfferCount: 2,
          }),
        ],
      },
    );
    assert.equal(suggestions.products.length, 1);
    assert.equal(suggestions.products[0]?.id, 'p2');
  });

  it('inspect report flags commercial collapses without mutating input', () => {
    const products = [
      product({ id: 'p1', gradeId: 'g1', offerId: 'o1' }),
      product({ id: 'p2', gradeId: 'g1', offerId: 'o2', stock: 50 }),
    ];
    const report = inspectMarketplaceDuplicates(
      [grade({ id: 'g1' }), grade({ id: 'g1' })],
      products,
    );
    assert.equal(report.catalogueInput, 2);
    assert.equal(report.catalogueUnique, 1);
    assert.equal(report.liveInput, 2);
    assert.equal(report.liveUniqueCommercial, 1);
    assert.equal(report.duplicateGradeIds.length, 1);
    assert.equal(products.length, 2);
  });
});
