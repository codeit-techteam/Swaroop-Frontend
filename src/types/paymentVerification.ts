export type VerificationTimelineStatus = 'completed' | 'current' | 'pending';

export type VerificationTimelineItem = {
  id: string;
  title: string;
  subtitle?: string;
  status: VerificationTimelineStatus;
};

export type VerificationBadgeStatus =
  'pending_verification' | 'verified' | 'rejected' | 'needs_review';

export type VerificationErrorCode =
  | 'verification_failed'
  | 'payment_rejected'
  | 'manual_review_required'
  | 'duplicate_transaction'
  | 'amount_mismatch'
  | 'wrong_utr';

export type VerificationErrorState = {
  code: VerificationErrorCode;
  title: string;
  message: string;
};
