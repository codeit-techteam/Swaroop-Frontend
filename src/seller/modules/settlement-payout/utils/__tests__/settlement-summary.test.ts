import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Settlement } from '@/seller/modules/settlement-payout/types/settlement';
import { buildSettlementSummary } from '@/seller/modules/settlement-payout/utils/settlement-summary';

const row = (overrides: Partial<Settlement>): Settlement => ({
  id: 'id',
  settlementId: 'STL-1',
  orderId: 'ORD-1',
  poNo: 'PO-1',
  invoiceNo: 'INV-1',
  material: 'HDPE',
  quantity: '10 MT',
  warehouse: 'Mumbai',
  destination: 'Pune',
  grossAmount: 100000,
  gst: 18000,
  platformFee: 1000,
  tds: 1000,
  netAmount: 116000,
  status: 'pending',
  expectedDate: '2026-10-30',
  currentTimelineStep: 'settlement_initiated',
  documents: [],
  ...overrides,
});

// Fixed "now": 27 Oct 2026, 10:00 local.
const now = new Date(2026, 9, 27, 10, 0, 0);

describe('buildSettlementSummary', () => {
  it('splits released net by today / this month and never uses gross sales as earnings', () => {
    const settlements = [
      row({
        id: 'a',
        status: 'released',
        releasedDate: new Date(2026, 9, 27, 8).toISOString(),
        netAmount: 50000,
      }),
      row({
        id: 'b',
        status: 'released',
        releasedDate: new Date(2026, 9, 3).toISOString(),
        netAmount: 20000,
      }),
      row({
        id: 'c',
        status: 'released',
        releasedDate: new Date(2026, 8, 30).toISOString(),
        netAmount: 7000,
      }),
      row({ id: 'd', status: 'pending', netAmount: 12000, settlementId: 'STL-9' }),
    ];
    const summary = buildSettlementSummary(
      {
        totalSales: 999999,
        settledAmount: 77000,
        pendingSettlementAmount: 12000,
        nextSettlementNumber: 'STL-9',
      },
      settlements,
      now,
    );
    assert.equal(summary.releasedToday, 50000);
    assert.equal(summary.thisMonth, 70000);
    assert.equal(summary.totalEarnings, 77000);
    assert.equal(summary.pendingSettlement, 12000);
    assert.equal(summary.nextReleaseLabel, 'Next: STL-9');
  });

  it('falls back to the rows when the summary endpoint is unavailable', () => {
    const settlements = [
      row({
        id: 'a',
        status: 'released',
        releasedDate: new Date(2026, 9, 1).toISOString(),
        netAmount: 1000.555,
      }),
      row({
        id: 'b',
        status: 'processing',
        netAmount: 500,
        expectedDate: '2026-11-02',
        settlementId: 'STL-B',
      }),
      row({
        id: 'c',
        status: 'pending',
        netAmount: 250,
        expectedDate: '2026-10-29',
        settlementId: 'STL-C',
      }),
    ];
    const summary = buildSettlementSummary(null, settlements, now);
    assert.equal(summary.totalEarnings, 1000.56);
    assert.equal(summary.pendingSettlement, 750);
    assert.equal(summary.releasedToday, 0);
    assert.equal(summary.thisMonth, 1000.56);
    assert.equal(summary.nextReleaseLabel, 'Next: STL-C');
  });

  it('reports zero KPIs and no pending releases for an empty ledger', () => {
    const summary = buildSettlementSummary(null, [], now);
    assert.deepEqual(summary, {
      pendingSettlement: 0,
      releasedToday: 0,
      thisMonth: 0,
      totalEarnings: 0,
      nextReleaseLabel: 'No pending releases',
    });
  });

  it('ignores released rows without a parseable release date for period buckets', () => {
    const settlements = [
      row({ id: 'a', status: 'released', releasedDate: 'not-a-date', netAmount: 999 }),
    ];
    const summary = buildSettlementSummary(null, settlements, now);
    assert.equal(summary.releasedToday, 0);
    assert.equal(summary.thisMonth, 0);
    assert.equal(summary.totalEarnings, 999);
  });
});
