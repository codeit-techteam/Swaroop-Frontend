/**
 * N-03 regression: "TIO2" must find the White Masterbatch TiO2 listing.
 * The product shape mirrors what the production API returns for MB-WH-50
 * (name "Masterbatch", description mentioning titanium dioxide).
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { MarketProduct } from '../../types/market';
import { matchesGradeQuery, searchProductsByGrade } from '../grade-search';

const whiteMasterbatch: MarketProduct = {
  id: 'mb-wh-50',
  name: 'Masterbatch',
  grade: 'White Masterbatch',
  gradeCode: 'MB-WH-50',
  price: 128000,
  origin: 'Western India Region',
  stock: 240,
  moq: 5,
  eta: '3 days',
  category: 'masterbatch',
  badge: 'Best Value',
  manufacturer: 'PRIVATE',
  description: 'Titanium dioxide white masterbatch for packaging films and injection parts.',
  technicalSpecs: { pigmentLoading: '50%', carrier: 'PE', form: 'Pellets' },
};

const absCompound: MarketProduct = {
  id: 'cmp-abs-fr',
  name: 'ABS FR Compound',
  grade: 'ABS FR',
  gradeCode: 'CMP-ABS-FR',
  price: 148000,
  origin: 'Northern India Region',
  stock: 120,
  moq: 8,
  eta: '3 days',
  category: 'compounds',
  badge: 'Best Value',
  manufacturer: 'PRIVATE',
  description: 'FR ABS compound V-0 for electrical enclosures and consumer electronics.',
};

const catalog = [absCompound, whiteMasterbatch];

describe('TiO2 search aliases (N-03)', () => {
  for (const query of ['TIO2', 'tio2', 'TiO2', 'TiO₂', 'titanium dioxide', 'Titanium Dioxide']) {
    it(`"${query}" matches the white masterbatch and not the ABS compound`, () => {
      assert.equal(matchesGradeQuery(whiteMasterbatch, query), true);
      assert.equal(matchesGradeQuery(absCompound, query), false);
    });
  }

  it('ranks the white masterbatch first for TIO2', () => {
    const results = searchProductsByGrade(catalog, 'TIO2');
    assert.equal(results.length, 1);
    assert.equal(results[0]?.id, 'mb-wh-50');
  });

  it('still finds the grade by its code and by "white masterbatch"', () => {
    assert.equal(searchProductsByGrade(catalog, 'MB-WH-50')[0]?.id, 'mb-wh-50');
    assert.equal(searchProductsByGrade(catalog, 'white masterbatch')[0]?.id, 'mb-wh-50');
  });
});
