/**
 * N-03 regression: "TIO2" / "tio" must find the White Masterbatch TiO2 listing
 * and must NOT match mid-word false positives like INEOS STYROLUTION.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CustomerGrade } from '../../types/grade-master';
import type { MarketProduct } from '../../types/market';
import {
  matchesCustomerGradeQuery,
  matchesGradeQuery,
  rankCustomerGrades,
  searchProductsByGrade,
} from '../grade-search';

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

/** Real production false-positive: "tio" is a substring of STYROLUTION. */
const styrolutionAbs: MarketProduct = {
  id: 'abs-m204',
  name: 'ABS MOULD >30 MFI M204-HONDA-BLACK - INEOS STYROLUTION',
  grade: 'M204-HONDA-BLACK',
  gradeCode: 'M204-HONDA-BLACK',
  price: 110000,
  origin: 'Western India Region',
  stock: 80,
  moq: 5,
  eta: '3 days',
  category: 'abs',
  badge: 'Best Value',
  manufacturer: 'INEOS STYROLUTION',
};

const catalog = [absCompound, whiteMasterbatch, styrolutionAbs];

const tioGrade: CustomerGrade = {
  id: 'g-tio',
  code: 'TIO-GRADE',
  name: 'TIO Grade',
  displayName: 'TIO Grade - Titanium Dioxide',
  description: 'Titanium dioxide pigment grade',
  gradeGroup: 'TIO',
  gradeNo: 'TIO2',
  manufacturer: 'PRIVATE',
  fullGradeName: 'TIO Grade Titanium Dioxide',
  category: {
    id: 'cat-mb',
    code: 'MB',
    name: 'Masterbatch',
    displayName: 'Masterbatch',
  },
  liveOfferCount: 1,
};

const styrolutionGrade: CustomerGrade = {
  id: 'g-abs',
  code: 'ABS-M204',
  name: 'ABS MOULD M204',
  displayName: 'ABS MOULD >30 MFI M204-HONDA-BLACK - INEOS STYROLUTION',
  description: null,
  gradeGroup: 'ABS',
  gradeNo: 'M204-HONDA-BLACK',
  manufacturer: 'INEOS STYROLUTION',
  fullGradeName: 'ABS MOULD M204-HONDA-BLACK INEOS STYROLUTION',
  category: {
    id: 'cat-abs',
    code: 'ABS',
    name: 'ABS',
    displayName: 'ABS',
  },
  liveOfferCount: 0,
};

describe('TiO2 search aliases (N-03)', () => {
  for (const query of ['TIO2', 'tio2', 'TiO2', 'TiO₂', 'titanium dioxide', 'Titanium Dioxide', 'tio']) {
    it(`"${query}" matches the white masterbatch and not ABS / STYROLUTION`, () => {
      assert.equal(matchesGradeQuery(whiteMasterbatch, query), true);
      assert.equal(matchesGradeQuery(absCompound, query), false);
      assert.equal(matchesGradeQuery(styrolutionAbs, query), false);
    });
  }

  it('ranks the white masterbatch first for TIO2 and tio', () => {
    for (const query of ['TIO2', 'tio']) {
      const results = searchProductsByGrade(catalog, query);
      assert.equal(results.length, 1);
      assert.equal(results[0]?.id, 'mb-wh-50');
    }
  });

  it('still finds the grade by its code and by "white masterbatch"', () => {
    assert.equal(searchProductsByGrade(catalog, 'MB-WH-50')[0]?.id, 'mb-wh-50');
    assert.equal(searchProductsByGrade(catalog, 'white masterbatch')[0]?.id, 'mb-wh-50');
  });
});

describe('catalogue grade ranking for tio', () => {
  it('matches TIO Grade and rejects STYROLUTION for "tio"', () => {
    assert.equal(matchesCustomerGradeQuery(tioGrade, 'tio'), true);
    assert.equal(matchesCustomerGradeQuery(styrolutionGrade, 'tio'), false);
  });

  it('ranks TIO Grade first when mixed with false substring hits', () => {
    const ranked = rankCustomerGrades([styrolutionGrade, tioGrade], 'tio');
    assert.equal(ranked.length, 1);
    assert.equal(ranked[0]?.id, 'g-tio');
  });
});
