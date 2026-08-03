export type SellerOrderStatus =
  | 'pending'
  | 'accepted'
  | 'dispatch_pending'
  | 'delivered'
  | 'rejected';

export type SellerOrderTabFilter =
  | 'all'
  | 'pending'
  | 'accepted'
  | 'dispatch_pending'
  | 'delivered';

export type SellerOrderPaymentMethod =
  | 'advance_payment'
  | 'on_loading'
  | 'on_delivery'
  | 'credit_15_days'
  | 'credit_30_days';

export type SellerOrderPaymentStatus =
  | 'completed'
  | 'pending_after_loading'
  | 'pending_on_delivery'
  | 'eligible'
  | 'pending';

export type SellerRejectReason =
  | 'Insufficient Inventory'
  | 'Price Mismatch'
  | 'Quality Issue'
  | 'Cannot Deliver'
  | 'Other';

export type TradeBehaviour = {
  orderFrequency: string;
  returnRate: string;
  averageOrderSize: string;
  disputeStatus: string;
};

export type SellerOrder = {
  id: string;
  orderId: string;
  material: string;
  grade: string;
  quantity: number;
  destination: string;
  warehouse: string;
  port: string;
  city: string;
  value: number;
  unitPrice: number;
  paymentMethod: SellerOrderPaymentMethod;
  paymentStatus: SellerOrderPaymentStatus;
  orderStatus: SellerOrderStatus;
  buyerCreditEligible: boolean;
  buyerId: string;
  buyerName: string;
  buyerScore: number;
  insuranceStatus: 'active' | 'inactive';
  creditLimit: number;
  tradeBehaviour: TradeBehaviour;
  createdAt: string;
  updatedAt: string;
  dispatchLinkId: string | null;
  inventoryProductId: string | null;
  inventoryReserved: boolean;
  rejectionReason: SellerRejectReason | null;
  rejectionRemarks: string | null;
  rejectedAt: string | null;
  acceptedAt: string | null;
};

export type SellerOrdersSummary = {
  total: number;
  pending: number;
  accepted: number;
  dispatchPending: number;
  delivered: number;
  rejected: number;
};

export type SellerOrdersSnapshot = {
  orders: SellerOrder[];
  pendingOrders: SellerOrder[];
  acceptedOrders: SellerOrder[];
  dispatchPendingOrders: SellerOrder[];
  completedOrders: SellerOrder[];
  rejectedOrders: SellerOrder[];
  selectedOrderId: string | null;
  summary: SellerOrdersSummary;
};

export type SellerOrdersStoreState = SellerOrdersSnapshot & {
  isHydrated: boolean;
};

export type SellerOrdersStoreActions = {
  hydrateSellerOrdersState: () => void;
  refreshSellerOrdersState: () => void;
  selectOrder: (orderId: string | null) => void;
  acceptOrder: (orderId: string) => SellerOrder | null;
  rejectOrder: (
    orderId: string,
    reason: SellerRejectReason,
    remarks: string,
  ) => SellerOrder | null;
  syncFromDispatch: () => void;
  getOrder: (orderId: string) => SellerOrder | undefined;
  filterOrders: (tab: SellerOrderTabFilter) => SellerOrder[];
  searchOrders: (query: string, tab?: SellerOrderTabFilter) => SellerOrder[];
};

export type SellerOrdersStore = SellerOrdersStoreState & SellerOrdersStoreActions;
