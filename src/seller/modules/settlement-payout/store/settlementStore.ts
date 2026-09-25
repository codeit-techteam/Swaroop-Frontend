import { create } from 'zustand';

import {
  advanceSettlementStatus as applyAdvanceSettlementStatus,
  filterHistorySettlements,
  getSettlementSnapshot,
  persistSettlementSnapshot,
  resolveDocumentDownload,
  searchSettlements as applySearchSettlements,
  buildDefaultSettlementSnapshot,
} from '@/seller/modules/settlement-payout/services/settlementService';
import type {
  Settlement,
  SettlementHistoryFilter,
  SettlementStore,
  SettlementTabFilter,
  SettlementStatus,
  SettlementTimelineStep,
} from '@/seller/modules/settlement-payout/types/settlement';
import {
  fetchSellerSettlementSummary,
  fetchSellerSettlementsPage,
  type SellerSettlement,
  type SellerSettlementStatus,
} from '@/services/seller-settlements';
import { logger } from '@/utils/logger';

const mapApiStatus = (status: SellerSettlementStatus): SettlementStatus => {
  switch (status) {
    case 'RELEASED':
      return 'released';
    case 'FAILED':
    case 'CANCELLED':
      return 'failed';
    case 'PROCESSING':
    case 'READY':
      return 'processing';
    default:
      return 'pending';
  }
};

const mapApiSettlement = (item: SellerSettlement): Settlement => ({
  id: item.id,
  settlementId: item.settlementNumber || item.referenceNumber,
  orderId: item.orderNumber || item.orderId || item.purchaseOrderId || item.id,
  poNo: item.orderNumber || item.purchaseOrderId || '—',
  invoiceNo: item.invoiceNumber || item.proformaInvoiceNumber || '—',
  material: 'Settlement',
  quantity: '—',
  warehouse: '—',
  destination: item.buyer.displayName || 'Anonymous Buyer',
  grossAmount: item.grossAmount,
  gst: item.taxAmount,
  platformFee: item.platformFee,
  tds: item.tdsAmount,
  netAmount: item.netAmount,
  status: mapApiStatus(item.status),
  expectedDate: item.expectedSettlementDate || item.settlementDate || item.createdAt,
  releasedDate: item.releasedAt ?? undefined,
  transactionReference: undefined,
  bankAccount: undefined,
  currentTimelineStep: (item.status === 'RELEASED'
    ? 'settlement_released'
    : item.status === 'PROCESSING' || item.status === 'READY'
      ? 'finance_processing'
      : 'settlement_initiated') as SettlementTimelineStep,
  documents: [],
});

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const useSettlementStore = create<SettlementStore>((set, get) => ({
  ...getSettlementSnapshot(),
  isHydrated: false,
  isRefreshing: false,

  hydrateSettlementState: () => {
    void (async () => {
      try {
        const [page, apiSummary] = await Promise.all([
          fetchSellerSettlementsPage({ page: 1, limit: 100 }),
          fetchSellerSettlementSummary().catch(() => null),
        ]);
        const settlements = page.items.map(mapApiSettlement);
        const fallback = buildDefaultSettlementSnapshot();
        const summary = apiSummary
          ? {
              pendingSettlement: apiSummary.pendingSettlementAmount,
              releasedToday: apiSummary.settledAmount,
              thisMonth: apiSummary.settledAmount,
              totalEarnings: apiSummary.totalSales,
              nextReleaseLabel: apiSummary.nextSettlementNumber
                ? `Next: ${apiSummary.nextSettlementNumber}`
                : 'No pending releases',
            }
          : {
              ...fallback.summary,
              pendingSettlement: settlements
                .filter((s) => s.status === 'pending' || s.status === 'processing')
                .reduce((sum, s) => sum + s.netAmount, 0),
            };
        const snapshot = {
          settlements,
          documents: fallback.documents,
          notifications: fallback.notifications,
          defaultBankAccount: fallback.defaultBankAccount,
          summary,
          selectedSettlementId: get().selectedSettlementId,
        };
        persistSettlementSnapshot(snapshot);
        set({ ...snapshot, isHydrated: true });
      } catch (error) {
        logger.warn('Seller settlements API hydrate failed; using local snapshot', {
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        const snapshot = getSettlementSnapshot();
        set({ ...snapshot, isHydrated: true });
      }
    })();
  },

  refreshSettlementState: async () => {
    set({ isRefreshing: true });
    try {
      const [page, apiSummary] = await Promise.all([
        fetchSellerSettlementsPage({ page: 1, limit: 100 }),
        fetchSellerSettlementSummary().catch(() => null),
      ]);
      const settlements = page.items.map(mapApiSettlement);
      const fallback = buildDefaultSettlementSnapshot();
      const summary = apiSummary
        ? {
            pendingSettlement: apiSummary.pendingSettlementAmount,
            releasedToday: apiSummary.settledAmount,
            thisMonth: apiSummary.settledAmount,
            totalEarnings: apiSummary.totalSales,
            nextReleaseLabel: apiSummary.nextSettlementNumber
              ? `Next: ${apiSummary.nextSettlementNumber}`
              : 'No pending releases',
          }
        : fallback.summary;
      const snapshot = {
        settlements,
        documents: fallback.documents,
        notifications: get().notifications,
        defaultBankAccount: get().defaultBankAccount || fallback.defaultBankAccount,
        summary,
        selectedSettlementId: get().selectedSettlementId,
      };
      persistSettlementSnapshot(snapshot);
      set({ ...snapshot, isRefreshing: false, isHydrated: true });
    } catch (error) {
      logger.warn('Seller settlements API refresh failed', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      await delay(300);
      set({ isRefreshing: false });
    }
  },

  selectSettlement: (settlementId) => {
    const snapshot = { ...get(), selectedSettlementId: settlementId };
    persistSettlementSnapshot(snapshot);
    set({ selectedSettlementId: settlementId });
  },

  searchSettlements: (query, tab) => applySearchSettlements(get().settlements, query, tab),

  filterHistory: (filter) => filterHistorySettlements(get().settlements, filter),

  markNotificationRead: (notificationId) => {
    const notifications = get().notifications.map((item) =>
      item.id === notificationId ? { ...item, read: true } : item,
    );
    const snapshot = { ...get(), notifications };
    persistSettlementSnapshot(snapshot);
    set({ notifications });
  },

  markAllNotificationsRead: () => {
    const notifications = get().notifications.map((item) => ({ ...item, read: true }));
    const snapshot = { ...get(), notifications };
    persistSettlementSnapshot(snapshot);
    set({ notifications });
  },

  downloadDocument: (documentId) => {
    const document = resolveDocumentDownload(get(), documentId);
    return document?.name ?? null;
  },

  advanceSettlementStatus: (settlementId) => {
    const result = applyAdvanceSettlementStatus(get(), settlementId);
    if (!result.settlement) {
      return null;
    }
    persistSettlementSnapshot(result.snapshot);
    set(result.snapshot);
    return result.settlement;
  },
}));

export const useSettlementSummary = (): SettlementStore['summary'] =>
  useSettlementStore((state) => state.summary);

export const useSettlementNotifications = () =>
  useSettlementStore((state) => ({
    notifications: state.notifications,
    unreadCount: state.notifications.filter((item) => !item.read).length,
    markRead: state.markNotificationRead,
    markAllRead: state.markAllNotificationsRead,
  }));

export type { Settlement, SettlementTabFilter, SettlementHistoryFilter };
