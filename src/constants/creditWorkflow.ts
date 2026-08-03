import type { Href } from 'expo-router';

import { formatPaymentCurrency, getPaymentMethodById } from '@/constants/payment';
import { ROUTES } from '@/navigation/routes';
import type { CreditCountdownParts, CreditState, CreditWorkflowPhase } from '@/types/credit';
import type { Order } from '@/types/order';
import type { OrderStatus } from '@/types/orderStatus';
import type { PaymentMethodId } from '@/types/payment';
import type { VerificationTimelineItem } from '@/types/paymentVerification';

export const CREDIT_DEMO_COUNTDOWN_DAYS = 14;
export const CREDIT_REMINDER_THRESHOLD_DAYS = 3;

export const CREDIT_WORKFLOW_COPY = {
  approval: {
    headerTitle: 'Credit Facility',
    title: 'Credit Facility Approved',
    subtitle: 'Your credit line is active with our insurance partner.',
    creditTypeLabel: 'Credit Type',
    approvedLimitLabel: 'Approved Limit',
    availableLimitLabel: 'Available Limit',
    interestLabel: 'Interest',
    dueAfterLabel: 'Due After Delivery',
    continueLabel: 'Continue Order',
  },
  invoiceDelivery: {
    headerTitle: 'Delivery Successful',
    paymentDueTitle: 'Payment Due',
    paymentDueSubtitle: 'After Delivery',
    dueDateLabel: 'Due Date',
    invoiceNumberLabel: 'Invoice Number',
    invoiceDateLabel: 'Invoice Date',
    paymentMethodLabel: 'Payment Method',
    documentsHeading: 'Documents',
    invoicePdf: 'Invoice PDF',
    deliveryChallan: 'Delivery Challan',
    taxInvoice: 'Tax Invoice',
    continueLabel: 'Continue',
  },
  countdown: {
    headerTitle: 'Credit Countdown',
    creditUsedLabel: 'Credit Used',
    remainingCreditLabel: 'Remaining Credit',
    interestLabel: 'Interest',
    payLabel: 'Pay Outstanding Amount',
    timelineHeading: 'Timeline',
  },
  reminder: {
    headerTitle: 'Payment Reminder',
    paymentDueTitle: 'Payment Due',
    daysRemaining: (days: number) => `${days} Days Remaining`,
    dueToday: 'Due Today',
    invoiceAmountLabel: 'Invoice Amount',
    dueDateLabel: 'Due Date',
    creditTypeLabel: 'Credit Type',
    payNowLabel: 'Pay Now',
    contactSupportLabel: 'Contact Support',
  },
  upload: {
    headerTitle: 'Credit Settlement',
    sectionTitle: 'Credit Settlement',
    invoiceNumberLabel: 'Invoice Number',
    dueAmountLabel: 'Due Amount',
    submitLabel: 'Submit Payment',
  },
  verification: {
    headerTitle: 'Invoice Settlement Verification',
    title: 'Invoice Settlement Verification',
    description:
      'Your payment proof has been received.\nOur finance team is verifying the settlement.',
    timelineHeading: 'Verification Progress',
  },
  restored: {
    headerTitle: 'Credit Restored',
    title: 'Payment Received Successfully',
    creditRestoredLabel: 'Credit Restored',
    previousUsedLabel: 'Previous Used',
    currentAvailableLabel: 'Current Available',
    statusLabel: 'Status',
    statusActive: 'Active',
    goToOrdersLabel: 'Go To Orders',
    timelineHeading: 'Timeline',
  },
} as const;

/** Credit flow: procurement & delivery before payment — no pre-dispatch payment gate. */
export const CREDIT_STATUS_SEQUENCE: OrderStatus[] = [
  'ORDER_CREATED',
  'PROCUREMENT_STARTED',
  'SUPPLIER_MATCHING',
  'LOADING_SCHEDULED',
  'LOADING_COMPLETED',
  'DISPATCH_STARTED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'PAYMENT_PENDING',
  'PAYMENT_VERIFIED',
];

export const isCreditPaymentFlow = (order: Order | null | undefined): boolean =>
  order?.paymentMethodId === 'credit_15' || order?.paymentMethodId === 'credit_30';

export const getCreditDays = (methodId: PaymentMethodId): number =>
  methodId === 'credit_30' ? 30 : 15;

export const getCreditInterestRate = (methodId: PaymentMethodId): number => {
  const method = getPaymentMethodById(methodId);
  return method.interestRate;
};

export const createInitialCreditState = (
  methodId: PaymentMethodId,
  orderAmount: number,
): CreditState => {
  const method = getPaymentMethodById(methodId);
  const creditLimit = method.creditLimit ?? 5_000_000;
  const availableLimit = method.availableCredit ?? 3_750_000;

  return {
    creditApproved: true,
    creditLimit,
    availableLimit,
    creditDays: getCreditDays(methodId),
    interestRate: method.interestRate,
    creditUsed: orderAmount,
    remainingCredit: Math.max(0, availableLimit - orderAmount),
    invoiceNumber: null,
    invoiceDate: null,
    dueDate: null,
    workflowPhase: 'approved',
    countdownStartedAt: null,
  };
};

export const generateInvoiceNumber = (orderId: string): string => {
  const suffix = orderId.replace(/^PT-ORD-/, '').slice(-6).toUpperCase();
  return `PT-INV-${suffix}`;
};

export const calculateDueDate = (deliveredAt: string, creditDays: number): string => {
  const due = new Date(deliveredAt);
  due.setDate(due.getDate() + creditDays);
  return due.toISOString();
};

export const formatCreditDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const getCreditCountdownParts = (dueDate: string | null): CreditCountdownParts => {
  if (!dueDate) {
    return {
      days: CREDIT_DEMO_COUNTDOWN_DAYS,
      hours: 23,
      minutes: 12,
      totalMs: 0,
      isOverdue: false,
      isDueToday: false,
      daysRemaining: CREDIT_DEMO_COUNTDOWN_DAYS,
    };
  }

  const now = Date.now();
  const due = new Date(dueDate).getTime();
  const diffMs = due - now;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalMs: diffMs,
      isOverdue: true,
      isDueToday: true,
      daysRemaining: 0,
    };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDue = new Date(dueDate);
  startOfDue.setHours(0, 0, 0, 0);
  const daysRemaining = Math.ceil((startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    totalMs: diffMs,
    isOverdue: false,
    isDueToday: daysRemaining <= 0,
    daysRemaining: Math.max(0, daysRemaining),
  };
};

export const createInvoicePatch = (order: Order): Partial<Order> => {
  const deliveredAt = order.deliveredAt ?? new Date().toISOString();
  const credit = order.credit;
  if (!credit) {
    return {};
  }

  const invoiceNumber = generateInvoiceNumber(order.id);
  const invoiceDate = new Date().toISOString();
  const dueDate = calculateDueDate(deliveredAt, credit.creditDays);

  return {
    credit: {
      ...credit,
      invoiceNumber,
      invoiceDate,
      dueDate,
      workflowPhase: 'invoice',
    },
  };
};

export const createCreditDeliveryPatch = (order: Order): Partial<Order> => {
  const deliveredAt = order.deliveredAt ?? new Date().toISOString();
  const credit = order.credit;

  return {
    deliveredAt,
    deliveryStatus: 'delivered',
    shipmentStatus: 'delivered',
    dispatchStatus: 'delivered',
    trackingAvailable: true,
    dispatchProgress: 100,
    progress: 100,
    eta: 'Delivered',
    credit: credit
      ? {
          ...credit,
          workflowPhase: 'delivered',
        }
      : credit,
  };
};

export const createCreditCountdownPatch = (order: Order): Partial<Order> => {
  const credit = order.credit;
  if (!credit) {
    return {};
  }

  return {
    credit: {
      ...credit,
      workflowPhase: 'payment_due',
      countdownStartedAt: new Date().toISOString(),
    },
  };
};

export const createCreditRestoredPatch = (order: Order): Partial<Order> => {
  const credit = order.credit;
  if (!credit) {
    return {};
  }

  return {
    paymentStatus: 'verified',
    verificationStatus: 'verified',
    credit: {
      ...credit,
      creditUsed: 0,
      remainingCredit: credit.creditLimit,
      availableLimit: credit.creditLimit,
      workflowPhase: 'completed',
    },
  };
};

export const formatCreditLimit = (amount: number): string => formatPaymentCurrency(amount);

export const getCreditPaymentMethodLabel = (order: Order): string => order.paymentMethod;

export const CREDIT_VERIFICATION_STEP_IDS = {
  RECEIPT_UPLOADED: 'receipt_uploaded',
  UTR_SUBMITTED: 'utr_submitted',
  FINANCE_VERIFICATION: 'finance_verification',
  CREDIT_RESTORATION: 'credit_restoration',
  COMPLETED: 'completed',
} as const;

export const buildCreditVerificationTimeline = (
  order: Order,
  hasProof: boolean,
): VerificationTimelineItem[] => {
  const isVerified = order.verificationStatus === 'verified';
  const isPending = order.verificationStatus === 'pending';
  const phase = order.credit?.workflowPhase;

  return [
    {
      id: CREDIT_VERIFICATION_STEP_IDS.RECEIPT_UPLOADED,
      title: 'Receipt Uploaded',
      subtitle: hasProof ? 'Payment receipt received' : undefined,
      status: hasProof ? 'completed' : 'pending',
    },
    {
      id: CREDIT_VERIFICATION_STEP_IDS.UTR_SUBMITTED,
      title: 'UTR Submitted',
      subtitle: hasProof ? 'Transaction reference recorded' : undefined,
      status: hasProof ? 'completed' : 'pending',
    },
    {
      id: CREDIT_VERIFICATION_STEP_IDS.FINANCE_VERIFICATION,
      title: isPending ? 'Finance Team Verification' : 'Finance Team Verification',
      subtitle: isVerified ? 'Verified successfully' : 'Verification in progress...',
      status: isVerified ? 'completed' : isPending ? 'current' : 'pending',
    },
    {
      id: CREDIT_VERIFICATION_STEP_IDS.CREDIT_RESTORATION,
      title: 'Credit Restoration',
      subtitle: phase === 'completed' ? 'Credit limit restored' : 'Pending verification',
      status: phase === 'completed' || phase === 'payment_verified' ? 'completed' : isVerified ? 'current' : 'pending',
    },
    {
      id: CREDIT_VERIFICATION_STEP_IDS.COMPLETED,
      title: 'Completed',
      subtitle: phase === 'completed' ? 'Order closed' : undefined,
      status: phase === 'completed' ? 'completed' : 'pending',
    },
  ];
};

export const buildCreditRestoredTimeline = (): Array<{
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
}> => [
  { id: 'delivered', title: 'Delivered', status: 'completed' },
  { id: 'invoice', title: 'Invoice', status: 'completed' },
  { id: 'payment', title: 'Payment Received', status: 'completed' },
  { id: 'restored', title: 'Credit Restored', status: 'completed' },
  { id: 'completed', title: 'Completed', status: 'completed' },
];

export const buildCreditCountdownTimeline = (): Array<{
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
}> => [
  { id: 'delivered', title: 'Delivered', status: 'completed' },
  { id: 'invoice', title: 'Invoice Generated', status: 'completed' },
  { id: 'payment', title: 'Payment Pending', status: 'current' },
  { id: 'complete', title: 'Payment Complete', status: 'pending' },
];

export const isCreditPaymentPending = (order: Order): boolean =>
  isCreditPaymentFlow(order) &&
  !isCreditOrderCompleted(order) &&
  (order.credit?.workflowPhase === 'payment_due' ||
    order.credit?.workflowPhase === 'payment_uploaded' ||
    order.credit?.workflowPhase === 'invoice' ||
    order.status === 'PAYMENT_PENDING' ||
    (order.status === 'DELIVERED' && order.paymentStatus !== 'verified'));

export const isCreditOrderCompleted = (order: Order): boolean =>
  isCreditPaymentFlow(order) && order.credit?.workflowPhase === 'completed';

export const getCreditScreenRoute = (order: Order): Href | null => {
  if (!isCreditPaymentFlow(order)) {
    return null;
  }

  const phase = order.credit?.workflowPhase;

  switch (phase) {
    case 'invoice':
      return ROUTES.CUSTOMER.CREDIT_INVOICE_DELIVERY as Href;
    case 'payment_due':
      if (
        order.credit?.dueDate &&
        getCreditCountdownParts(order.credit.dueDate).daysRemaining <= CREDIT_REMINDER_THRESHOLD_DAYS
      ) {
        return ROUTES.CUSTOMER.CREDIT_PAYMENT_REMINDER as Href;
      }
      return ROUTES.CUSTOMER.CREDIT_COUNTDOWN as Href;
    case 'payment_uploaded':
    case 'payment_verified':
      return ROUTES.CUSTOMER.CREDIT_VERIFICATION as Href;
    case 'completed':
      return ROUTES.CUSTOMER.CREDIT_RESTORED as Href;
    default:
      if (
        order.status === 'DELIVERED' &&
        order.paymentStatus !== 'verified' &&
        phase !== 'approved' &&
        phase !== 'submitted'
      ) {
        return ROUTES.CUSTOMER.CREDIT_INVOICE_DELIVERY as Href;
      }
      return null;
  }
};

export const buildCreditOrderDetailTimeline = (
  order: Order,
): Array<{ id: string; title: string; status: 'completed' | 'current' | 'pending' }> => {
  const titles = [
    'Order Submitted',
    'Procurement',
    'Loading',
    'Dispatch',
    'Delivered',
    'Invoice Generated',
    'Payment Pending',
    'Payment Verified',
    'Completed',
  ];

  const phaseToIndex: Record<CreditWorkflowPhase, number> = {
    approved: 0,
    submitted: 0,
    procurement: 1,
    po_generated: 1,
    loading: 2,
    dispatch: 3,
    delivered: 4,
    invoice: 5,
    payment_due: 6,
    payment_uploaded: 6,
    payment_verified: 7,
    completed: 8,
  };

  const phase = order.credit?.workflowPhase ?? 'submitted';
  const currentIndex = phaseToIndex[phase] ?? 0;

  return titles.map((title, index) => ({
    id: `credit_step_${index}`,
    title,
    status:
      phase === 'completed' || index < currentIndex
        ? 'completed'
        : index === currentIndex
          ? 'current'
          : 'pending',
  }));
};

export const mapOrderStatusToCreditPhase = (status: OrderStatus): CreditWorkflowPhase | null => {
  switch (status) {
    case 'ORDER_CREATED':
      return 'approved';
    case 'PROCUREMENT_STARTED':
    case 'SUPPLIER_MATCHING':
      return 'procurement';
    case 'LOADING_SCHEDULED':
    case 'LOADING_COMPLETED':
      return 'loading';
    case 'DISPATCH_STARTED':
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
      return 'dispatch';
    case 'DELIVERED':
      return 'delivered';
    case 'PAYMENT_PENDING':
      return 'payment_due';
    case 'PAYMENT_VERIFIED':
      return 'payment_verified';
    default:
      return null;
  }
};
