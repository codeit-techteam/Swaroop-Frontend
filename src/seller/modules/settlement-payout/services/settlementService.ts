import { STORAGE_KEYS } from '@/constants';
import { getStorageItem, setStorageItem } from '@/utils/storage';

import type {
  Settlement,
  SettlementDocument,
  SettlementHistoryFilter,
  SettlementNotification,
  SettlementSnapshot,
  SettlementStatus,
  SettlementSummary,
  SettlementTabFilter,
  SettlementTimelineStep,
} from '@/seller/modules/settlement-payout/types/settlement';

type SettlementSeed = {
  settlements: Settlement[];
  documents: SettlementDocument[];
  notifications: SettlementNotification[];
  defaultBankAccount: string;
  summary: SettlementSummary;
};

const settlementSeed = require('@/seller/modules/settlement-payout/mock/settlements.json') as SettlementSeed;

const safeParse = <T>(value: string | undefined, fallback: T): T => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const formatSettlementAmount = (value: number, compact = false): string => {
  if (!Number.isFinite(value) || value === 0) {
    return compact ? '₹0' : '₹0';
  }

  if (compact) {
    const trim = (amount: number): string =>
      amount.toFixed(2).replace(/\.?0+$/, '');

    if (value >= 10000000) {
      return `₹${trim(value / 10000000)}Cr`;
    }
    if (value >= 100000) {
      return `₹${trim(value / 100000)}L`;
    }
    if (value >= 1000) {
      return `₹${trim(value / 1000)}K`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatSettlementDate = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const formatSettlementDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const sortSettlements = (settlements: Settlement[]): Settlement[] =>
  [...settlements].sort((a, b) => b.expectedDate.localeCompare(a.expectedDate));

const computeSummary = (settlements: Settlement[]): SettlementSummary => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const pendingSettlement = settlements
    .filter((item) => item.status === 'pending' || item.status === 'processing')
    .reduce((sum, item) => sum + item.netAmount, 0);

  const releasedToday = settlements
    .filter(
      (item) =>
        item.status === 'released' &&
        item.releasedDate &&
        new Date(item.releasedDate) >= today &&
        new Date(item.releasedDate) <= todayEnd,
    )
    .reduce((sum, item) => sum + item.netAmount, 0);

  const thisMonth = settlements
    .filter(
      (item) =>
        item.status === 'released' &&
        item.releasedDate &&
        new Date(item.releasedDate) >= monthStart,
    )
    .reduce((sum, item) => sum + item.netAmount, 0);

  const totalEarnings = settlements
    .filter((item) => item.status === 'released')
    .reduce((sum, item) => sum + item.netAmount, 0);

  const nextPending = settlements
    .filter((item) => item.status === 'pending' || item.status === 'processing')
    .sort((a, b) => a.expectedDate.localeCompare(b.expectedDate))[0];

  const nextReleaseLabel = nextPending
    ? formatSettlementDate(nextPending.expectedDate)
    : 'No pending releases';

  return {
    pendingSettlement,
    releasedToday,
    thisMonth,
    totalEarnings,
    nextReleaseLabel,
  };
};

export const buildDefaultSettlementSnapshot = (): SettlementSnapshot => ({
  settlements: sortSettlements(settlementSeed.settlements),
  documents: settlementSeed.documents,
  notifications: settlementSeed.notifications,
  defaultBankAccount: settlementSeed.defaultBankAccount,
  summary: computeSummary(settlementSeed.settlements),
  selectedSettlementId: null,
});

const loadPersistedSnapshot = (): SettlementSnapshot => {
  const fallback = buildDefaultSettlementSnapshot();
  const persisted = safeParse<Partial<SettlementSnapshot>>(
    getStorageItem(STORAGE_KEYS.SELLER_SETTLEMENT_STATE),
    {},
  );

  const settlements = persisted.settlements?.length
    ? sortSettlements(persisted.settlements)
    : fallback.settlements;

  return {
    settlements,
    documents: persisted.documents?.length ? persisted.documents : fallback.documents,
    notifications: persisted.notifications?.length ? persisted.notifications : fallback.notifications,
    defaultBankAccount: persisted.defaultBankAccount ?? fallback.defaultBankAccount,
    summary: computeSummary(settlements),
    selectedSettlementId: persisted.selectedSettlementId ?? null,
  };
};

export const persistSettlementSnapshot = (snapshot: SettlementSnapshot): void => {
  setStorageItem(STORAGE_KEYS.SELLER_SETTLEMENT_STATE, JSON.stringify(snapshot));
};

export const getSettlementSnapshot = (): SettlementSnapshot => loadPersistedSnapshot();

export const filterSettlementsByTab = (
  settlements: Settlement[],
  tab: SettlementTabFilter,
): Settlement[] => {
  if (tab === 'all') {
    return settlements;
  }
  return settlements.filter((item) => item.status === tab);
};

export const searchSettlements = (
  settlements: Settlement[],
  query: string,
  tab: SettlementTabFilter,
): Settlement[] => {
  const normalized = query.trim().toLowerCase();
  const tabFiltered = filterSettlementsByTab(settlements, tab);

  if (!normalized) {
    return tabFiltered;
  }

  return tabFiltered.filter(
    (item) =>
      item.orderId.toLowerCase().includes(normalized) ||
      item.invoiceNo.toLowerCase().includes(normalized) ||
      item.poNo.toLowerCase().includes(normalized) ||
      item.settlementId.toLowerCase().includes(normalized) ||
      item.material.toLowerCase().includes(normalized),
  );
};

export const filterHistorySettlements = (
  settlements: Settlement[],
  filter: SettlementHistoryFilter,
): Settlement[] => {
  const released = settlements.filter((item) => item.status === 'released' && item.releasedDate);
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  if (filter === 'custom') {
    return released;
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (filter === 'this_week') {
    start.setDate(start.getDate() - 7);
  } else if (filter === 'this_month') {
    start.setDate(1);
  }

  return released.filter((item) => {
    const releasedDate = new Date(item.releasedDate as string);
    return releasedDate >= start && releasedDate <= now;
  });
};

const timelineOrder: SettlementTimelineStep[] = [
  'order_completed',
  'delivery_confirmed',
  'payment_secured',
  'settlement_initiated',
  'finance_processing',
  'settlement_released',
];

const nextStatusMap: Partial<Record<SettlementStatus, SettlementStatus>> = {
  pending: 'processing',
  processing: 'released',
};

const nextTimelineMap: Partial<Record<SettlementTimelineStep, SettlementTimelineStep>> = {
  payment_secured: 'settlement_initiated',
  settlement_initiated: 'finance_processing',
  finance_processing: 'settlement_released',
};

export const advanceSettlementStatus = (
  snapshot: SettlementSnapshot,
  settlementId: string,
): { snapshot: SettlementSnapshot; settlement: Settlement | null } => {
  const index = snapshot.settlements.findIndex((item) => item.settlementId === settlementId);
  if (index < 0) {
    return { snapshot, settlement: null };
  }

  const current = snapshot.settlements[index];
  const nextStatus = nextStatusMap[current.status];
  if (!nextStatus) {
    return { snapshot, settlement: current };
  }

  const nextTimeline =
    nextTimelineMap[current.currentTimelineStep] ?? current.currentTimelineStep;

  const updated: Settlement = {
    ...current,
    status: nextStatus,
    currentTimelineStep: nextTimeline,
    releasedDate:
      nextStatus === 'released' ? new Date().toISOString() : current.releasedDate,
    transactionReference:
      nextStatus === 'released'
        ? `PTR-SET-${Date.now()}`
        : current.transactionReference,
    bankAccount:
      nextStatus === 'released'
        ? snapshot.defaultBankAccount
        : current.bankAccount,
  };

  const settlements = [...snapshot.settlements];
  settlements[index] = updated;

  const nextSnapshot: SettlementSnapshot = {
    ...snapshot,
    settlements: sortSettlements(settlements),
    summary: computeSummary(settlements),
  };

  return { snapshot: nextSnapshot, settlement: updated };
};

export const resolveDocumentDownload = (
  snapshot: SettlementSnapshot,
  documentId: string,
): SettlementDocument | null => {
  const fromSettlement = snapshot.settlements
    .flatMap((item) => item.documents)
    .find((doc) => doc.id === documentId);
  if (fromSettlement) {
    return fromSettlement;
  }
  return snapshot.documents.find((doc) => doc.id === documentId) ?? null;
};

export const getTimelineSteps = (
  currentStep: SettlementTimelineStep,
): Array<{ id: SettlementTimelineStep; label: string; state: 'complete' | 'current' | 'upcoming' }> => {
  const labels: Record<SettlementTimelineStep, string> = {
    order_completed: 'Order Completed',
    delivery_confirmed: 'Delivery Confirmed',
    payment_secured: 'Payment Secured',
    settlement_initiated: 'Settlement Initiated',
    finance_processing: 'Finance Processing',
    settlement_released: 'Settlement Released',
  };

  const currentIndex = timelineOrder.indexOf(currentStep);

  return timelineOrder.map((step, index) => ({
    id: step,
    label: labels[step],
    state: index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming',
  }));
};

export const getUnreadNotificationCount = (notifications: SettlementNotification[]): number =>
  notifications.filter((item) => !item.read).length;
