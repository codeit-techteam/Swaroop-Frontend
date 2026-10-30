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
  grade: partial.grade ?? 'G',
  price: 100_000,
  origin: 'Western India Region',
  stock: 10,
  moq: 1,
  eta: '3 days',
  category: 'hdpe',
  badge: 'Best Value',
  ...partial,
});

describe('buildMarketSearchRows', () => {
  it('keeps catalogue grades with no live offers visible', () => {
    const f4811 = grade({
      id: 'g-f4811',
      gradeNo: 'F4811',
      displayName: 'HDPE HM F4811 - LUBAN',
      manufacturer: 'LUBAN',
      liveOfferCount: 0,
    });

    const rows = buildMarketSearchRows([f4811], []);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.kind, 'grade');
    if (rows[0]?.kind === 'grade') {
      assert.equal(rows[0].grade.id, 'g-f4811');
      assert.equal(rows[0].grade.liveOfferCount, 0);
    }
  });

  it('prefers live product cards when a listing exists for the grade', () => {
    const g = grade({ id: 'g1', gradeNo: 'TIO2', liveOfferCount: 2 });
    const live = product({ id: 'p1', gradeId: 'g1', name: 'White Masterbatch TiO2 50%' });

    const rows = buildMarketSearchRows([g], [live]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.kind, 'product');
    if (rows[0]?.kind === 'product') {
      assert.equal(rows[0].product.id, 'p1');
    }
  });

  it('does not duplicate products shared across grade rows', () => {
    const g = grade({ id: 'g1', liveOfferCount: 1 });
    const live = product({ id: 'p1', gradeId: 'g1' });
    const rows = buildMarketSearchRows([g, g], [live, live]);
    assert.equal(rows.length, 1);
  });

  it('appends live listings matched by query that are outside the catalogue page', () => {
    const catalogueOnly = grade({
      id: 'g-f4811',
      gradeNo: 'F4811',
      displayName: 'HDPE HM F4811 - LUBAN',
    });
    const tioLive = product({
      id: 'mb-wh-50',
      gradeId: 'g-other',
      name: 'White Masterbatch TiO2 50%',
      grade: 'White Masterbatch',
      gradeCode: 'MB-WH-50',
      description: 'Titanium dioxide white masterbatch',
    });

    const rows = buildMarketSearchRows([catalogueOnly], [tioLive], 'tio');
    // F4811 does not match "tio"; only the TiO2 live listing remains after ranking.
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.kind, 'product');
    if (rows[0]?.kind === 'product') {
      assert.equal(rows[0].product.id, 'mb-wh-50');
    }
  });

  it('ranks TIO catalogue grades above STYROLUTION false positives for "tio"', () => {
    const tio = grade({
      id: 'g-tio',
      gradeNo: 'TIO2',
      displayName: 'TIO Grade - Titanium Dioxide',
      manufacturer: 'PRIVATE',
    });
    const abs = grade({
      id: 'g-abs',
      gradeNo: 'M204',
      displayName: 'ABS MOULD M204 - INEOS STYROLUTION',
      manufacturer: 'INEOS STYROLUTION',
    });

    const rows = buildMarketSearchRows([abs, tio], [], 'tio');
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.kind, 'grade');
    if (rows[0]?.kind === 'grade') {
      assert.equal(rows[0].grade.id, 'g-tio');
    }
  });
});
