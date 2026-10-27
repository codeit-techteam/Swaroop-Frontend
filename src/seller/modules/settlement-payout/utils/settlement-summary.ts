import type {
  Settlement,
  SettlementSummary,
} from '@/seller/modules/settlement-payout/types/settlement';

/** Subset of `GET /seller/settlements/summary` the KPI cards depend on. */
export type SettlementSummaryApi = {
  /** Lifetime gross (pre-fee) sales — NOT what the seller has been paid. */
  totalSales: number;
  /** Lifetime net amount actually RELEASED to the seller. */
  settledAmount: number;
  /** Net amount still outstanding (pending / ready / processing). */
  pendingSettlementAmount: number;
  nextSettlementNumber: string | null;
  nextSettlementAmount?: number | null;
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

const parseDate = (value: string | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sameLocalDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const sameLocalMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const sumNet = (items: Settlement[]): number =>
  round2(items.reduce((sum, item) => sum + (Number(item.netAmount) || 0), 0));

const isOpen = (item: Settlement): boolean =>
  item.status === 'pending' || item.status === 'processing';

/**
 * S-07 / N-11: build the seller KPI summary from the real settlement rows.
 *
 * The backend summary only exposes lifetime figures (`settledAmount`,
 * `totalSales`). Previously "Released today" and "This month" were both bound
 * to the lifetime `settledAmount`, and "Total earnings" to gross `totalSales`,
 * so the dashboard disagreed with the Payouts list for any seller with history.
 *
 * - pendingSettlement: server's outstanding net (falls back to open rows).
 * - releasedToday / thisMonth: net of RELEASED rows whose release date falls in
 *   the current local day / calendar month.
 * - totalEarnings: lifetime net released (server `settledAmount`), never gross.
 */
export const buildSettlementSummary = (
  api: SettlementSummaryApi | null,
  settlements: Settlement[],
  now: Date = new Date(),
): SettlementSummary => {
  const released = settlements.filter((item) => item.status === 'released');
  const releasedWithDate = released
    .map((item) => ({ item, date: parseDate(item.releasedDate) }))
    .filter((entry): entry is { item: Settlement; date: Date } => entry.date !== null);

  const releasedToday = sumNet(
    releasedWithDate.filter(({ date }) => sameLocalDay(date, now)).map(({ item }) => item),
  );
  const thisMonth = sumNet(
    releasedWithDate.filter(({ date }) => sameLocalMonth(date, now)).map(({ item }) => item),
  );

  const openRows = settlements.filter(isOpen);
  const pendingSettlement =
    api && Number.isFinite(api.pendingSettlementAmount)
      ? round2(api.pendingSettlementAmount)
      : sumNet(openRows);

  const totalEarnings =
    api && Number.isFinite(api.settledAmount) ? round2(api.settledAmount) : sumNet(released);

  const nextFromRows = [...openRows].sort((a, b) =>
    (a.expectedDate || '').localeCompare(b.expectedDate || ''),
  )[0];
  const nextRef = api?.nextSettlementNumber || nextFromRows?.settlementId || null;

  return {
    pendingSettlement,
    releasedToday,
    thisMonth,
    totalEarnings,
    nextReleaseLabel: nextRef ? `Next: ${nextRef}` : 'No pending releases',
  };
};
