import type { VerificationErrorCode } from '@/types/paymentVerification';

/** When true, simulates finance verification and auto-navigates to procurement confirmation. */
export const DEMO_MODE = __DEV__;

export const DEMO_VERIFICATION_DELAY_MS = 8000;

export const ESTIMATED_VERIFICATION_TIME = '15–30 Minutes';

export const VERIFICATION_TIMELINE_STEP_IDS = {
  SCREENSHOT_UPLOADED: 'screenshot_uploaded',
  UTR_SUBMITTED: 'utr_submitted',
  FINANCE_VERIFICATION: 'finance_verification',
  ORDER_SUBMISSION: 'order_submission',
} as const;

export const VERIFICATION_SCREEN_COPY = {
  title: 'Payment Verification Initiated',
  description:
    'Your payment proof has been received successfully.\nOur finance team is verifying the transaction.',
  estimatedTimePrefix: 'Estimated verification time:',
  progressHeading: 'Verification Progress',
  transactionHeading: 'Transaction Details',
  infoMessage:
    'After verification your order will automatically be forwarded to PetroTrade Procurement Team.',
  financeInProgress: 'Verification in progress...',
  orderSubmissionPending: 'Scheduled after verification',
  illustrationLabel: 'Secure B2B Payment Verification & Trust',
} as const;

export const VERIFICATION_BADGE_LABELS = {
  pending_verification: 'Pending Verification',
  verified: 'Verified',
  rejected: 'Rejected',
  needs_review: 'Needs Review',
} as const;

export const VERIFICATION_ERROR_COPY: Record<
  VerificationErrorCode,
  { title: string; message: string }
> = {
  verification_failed: {
    title: 'Verification Failed',
    message: 'We could not verify your payment. Please contact support or resubmit proof.',
  },
  payment_rejected: {
    title: 'Payment Rejected',
    message: 'Your payment was rejected by the finance team. Please review and resubmit.',
  },
  manual_review_required: {
    title: 'Manual Review Required',
    message: 'Your payment requires additional review. Our team will contact you shortly.',
  },
  duplicate_transaction: {
    title: 'Duplicate Transaction',
    message: 'This transaction reference has already been submitted for another order.',
  },
  amount_mismatch: {
    title: 'Amount Mismatch',
    message: 'The transferred amount does not match the order payable amount.',
  },
  wrong_utr: {
    title: 'Wrong UTR',
    message: 'The UTR provided does not match our bank records. Please verify and resubmit.',
  },
};
