import { create } from 'zustand';

import {
  advanceSettlementStatus as applyAdvanceSettlementStatus,
  filterHistorySettlements,
  getSettlementSnapshot,
  persistSettlementSnapshot,
  resolveDocumentDownload,
  searchSettlements as applySearchSettlements,
} from '@/seller/modules/settlement-payout/services/settlementService';
import type {
  Settlement,
  SettlementHistoryFilter,
  SettlementStore,
  SettlementTabFilter,
} from '@/seller/modules/settlement-payout/types/settlement';

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const useSettlementStore = create<SettlementStore>((set, get) => ({
  ...getSettlementSnapshot(),
  isHydrated: false,
  isRefreshing: false,

  hydrateSettlementState: () => {
    const snapshot = getSettlementSnapshot();
    set({
      ...snapshot,
      isHydrated: true,
    });
  },

  refreshSettlementState: async () => {
    set({ isRefreshing: true });
    await delay(800);
    const snapshot = getSettlementSnapshot();
    set({
      ...snapshot,
      isRefreshing: false,
    });
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
