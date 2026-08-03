export type SettlementStatus = 'pending' | 'processing' | 'released' | 'failed';

export type SettlementTabFilter = 'all' | SettlementStatus;

export type SettlementHistoryFilter = 'today' | 'this_week' | 'this_month' | 'custom';

export type SettlementTimelineStep =
  | 'order_completed'
  | 'delivery_confirmed'
  | 'payment_secured'
  | 'settlement_initiated'
  | 'finance_processing'
  | 'settlement_released';

export type SettlementDocumentType =
  | 'invoice'
  | 'credit_note'
  | 'settlement_advice'
  | 'gst_report'
  | 'tds_certificate';

export type SettlementDocument = {
  id: string;
  type: SettlementDocumentType;
  name: string;
  size: string;
  settlementId?: string;
};

export type Settlement = {
  id: string;
  settlementId: string;
  orderId: string;
  poNo: string;
  invoiceNo: string;
  material: string;
  quantity: string;
  warehouse: string;
  destination: string;
  grossAmount: number;
  gst: number;
  platformFee: number;
  tds: number;
  netAmount: number;
  status: SettlementStatus;
  expectedDate: string;
  releasedDate?: string;
  transactionReference?: string;
  bankAccount?: string;
  currentTimelineStep: SettlementTimelineStep;
  documents: SettlementDocument[];
};

export type SettlementSummary = {
  pendingSettlement: number;
  releasedToday: number;
  thisMonth: number;
  totalEarnings: number;
  nextReleaseLabel: string;
};

export type SettlementNotificationType =
  | 'settlement_initiated'
  | 'settlement_released'
  | 'settlement_delayed'
  | 'settlement_failed'
  | 'invoice_generated'
  | 'tds_certificate_available';

export type SettlementNotification = {
  id: string;
  type: SettlementNotificationType;
  title: string;
  message: string;
  settlementId?: string;
  createdAt: string;
  read: boolean;
};

export type SettlementSnapshot = {
  settlements: Settlement[];
  documents: SettlementDocument[];
  notifications: SettlementNotification[];
  defaultBankAccount: string;
  summary: SettlementSummary;
  selectedSettlementId: string | null;
};

export type SettlementStoreState = SettlementSnapshot & {
  isHydrated: boolean;
  isRefreshing: boolean;
};

export type SettlementStoreActions = {
  hydrateSettlementState: () => void;
  refreshSettlementState: () => Promise<void>;
  selectSettlement: (settlementId: string | null) => void;
  searchSettlements: (query: string, tab: SettlementTabFilter) => Settlement[];
  filterHistory: (filter: SettlementHistoryFilter) => Settlement[];
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  downloadDocument: (documentId: string) => string | null;
  advanceSettlementStatus: (settlementId: string) => Settlement | null;
};

export type SettlementStore = SettlementStoreState & SettlementStoreActions;
