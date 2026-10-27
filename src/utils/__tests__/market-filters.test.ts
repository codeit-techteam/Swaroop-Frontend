import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { MarketProduct } from '../../types/market';
import {
  EMPTY_MARKET_FILTERS,
  applyMarketFilters,
  buildMarketFacets,
  countActiveMarketFilters,
  normalizeMarketFilters,
  parseFilterNumber,
} from '../market-filters';

const product = (overrides: Partial<MarketProduct> & { id: string }): MarketProduct => ({
  name: 'Grade',
  grade: 'G',
  price: 100000,
  origin: 'Western India Region',
  stock: 10,
  moq: 5,
  eta: '3 days',
  category: 'polymers',
  badge: 'Best Value',
  manufacturer: 'Reliance',
  creditEligible: false,
  ...overrides,
});

const catalog: MarketProduct[] = [
  product({
    id: 'a',
    price: 148000,
    moq: 8,
    manufacturer: 'Reliance',
    origin: 'Northern India Region',
  }),
  product({ id: 'b', price: 128000, moq: 5, manufacturer: 'PRIVATE', stock: 0 }),
  product({ id: 'c', price: 82000, moq: 2, manufacturer: 'PRIVATE', creditEligible: true }),
  product({ id: 'd', price: 0, moq: 1, manufacturer: 'IOCL', origin: 'Saudi Arabia' }),
];

describe('applyMarketFilters', () => {
  it('returns the input untouched when no filter is active', () => {
    assert.equal(applyMarketFilters(catalog, EMPTY_MARKET_FILTERS), catalog);
  });

  it('filters by stock, credit, manufacturer and origin', () => {
    assert.deepEqual(
      applyMarketFilters(catalog, { ...EMPTY_MARKET_FILTERS, inStockOnly: true }).map((p) => p.id),
      ['a', 'c', 'd'],
    );
    assert.deepEqual(
      applyMarketFilters(catalog, { ...EMPTY_MARKET_FILTERS, creditEligibleOnly: true }).map(
        (p) => p.id,
      ),
      ['c'],
    );
    assert.deepEqual(
      applyMarketFilters(catalog, { ...EMPTY_MARKET_FILTERS, manufacturers: ['PRIVATE'] }).map(
        (p) => p.id,
      ),
      ['b', 'c'],
    );
    assert.deepEqual(
      applyMarketFilters(catalog, {
        ...EMPTY_MARKET_FILTERS,
        origins: ['Saudi Arabia', 'Northern India Region'],
      }).map((p) => p.id),
      ['a', 'd'],
    );
  });

  it('applies inclusive price bounds and excludes price-less rows', () => {
    assert.deepEqual(
      applyMarketFilters(catalog, {
        ...EMPTY_MARKET_FILTERS,
        priceMin: 82000,
        priceMax: 128000,
      }).map((p) => p.id),
      ['b', 'c'],
    );
    // swapped bounds are normalised, not treated as an empty range
    assert.deepEqual(
      applyMarketFilters(catalog, {
        ...EMPTY_MARKET_FILTERS,
        priceMin: 128000,
        priceMax: 82000,
      }).map((p) => p.id),
      ['b', 'c'],
    );
  });

  it('filters by maximum MOQ', () => {
    assert.deepEqual(
      applyMarketFilters(catalog, { ...EMPTY_MARKET_FILTERS, maxMoq: 5 }).map((p) => p.id),
      ['b', 'c', 'd'],
    );
  });

  it('sorts by price with price-less rows last, and by MOQ', () => {
    assert.deepEqual(
      applyMarketFilters(catalog, { ...EMPTY_MARKET_FILTERS, sort: 'price-asc' }).map((p) => p.id),
      ['c', 'b', 'a', 'd'],
    );
    assert.deepEqual(
      applyMarketFilters(catalog, { ...EMPTY_MARKET_FILTERS, sort: 'price-desc' }).map((p) => p.id),
      ['a', 'b', 'c', 'd'],
    );
    assert.deepEqual(
      applyMarketFilters(catalog, { ...EMPTY_MARKET_FILTERS, sort: 'moq-asc' }).map((p) => p.id),
      ['d', 'c', 'b', 'a'],
    );
  });
});

describe('facets and helpers', () => {
  it('builds manufacturer/origin buckets and the observed price range', () => {
    const facets = buildMarketFacets(catalog);
    assert.deepEqual(facets.manufacturers, [
      { name: 'PRIVATE', count: 2 },
      { name: 'IOCL', count: 1 },
      { name: 'Reliance', count: 1 },
    ]);
    assert.deepEqual(facets.origins[0], { name: 'Western India Region', count: 2 });
    assert.deepEqual(facets.priceRange, { min: 82000, max: 148000 });
  });

  it('counts active filters for the Filter button badge', () => {
    assert.equal(countActiveMarketFilters(EMPTY_MARKET_FILTERS), 0);
    assert.equal(
      countActiveMarketFilters({
        ...EMPTY_MARKET_FILTERS,
        inStockOnly: true,
        priceMax: 1,
        sort: 'price-asc',
      }),
      3,
    );
  });

  it('parses free-text numbers defensively', () => {
    assert.equal(parseFilterNumber('1,20,000'), 120000);
    assert.equal(parseFilterNumber(''), null);
    assert.equal(parseFilterNumber('abc'), null);
    assert.equal(parseFilterNumber('-5'), 5);
  });

  it('normalises blank manufacturers and non-positive MOQ', () => {
    const normalised = normalizeMarketFilters({
      ...EMPTY_MARKET_FILTERS,
      manufacturers: [' PRIVATE ', '', 'PRIVATE'],
      maxMoq: 0,
    });
    assert.deepEqual(normalised.manufacturers, ['PRIVATE']);
    assert.equal(normalised.maxMoq, null);
  });
});
