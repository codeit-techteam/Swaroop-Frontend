export type CreditWorkflowPhase =
  | 'approved'
  | 'submitted'
  | 'procurement'
  | 'po_generated'
  | 'loading'
  | 'dispatch'
  | 'delivered'
  | 'invoice'
  | 'payment_due'
  | 'payment_uploaded'
  | 'payment_verified'
  | 'completed';

export type CreditState = {
  creditApproved: boolean;
  creditLimit: number;
  availableLimit: number;
  creditDays: number;
  interestRate: number;
  creditUsed: number;
  remainingCredit: number;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  workflowPhase: CreditWorkflowPhase;
  countdownStartedAt: string | null;
};

export type CreditCountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
  isOverdue: boolean;
  isDueToday: boolean;
  daysRemaining: number;
};
