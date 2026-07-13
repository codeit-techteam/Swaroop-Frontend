export const PAYMENT_WORKFLOW_COPY = {
  orderSubmitted: {
    headerTitle: 'Order Submitted',
    continueLabel: 'Track Procurement Status',
  },
  creditApproval: {
    headerTitle: 'Credit Eligibility',
    title: 'Credit Eligibility Check',
    subtitle: 'PetroTrade is verifying your credit facility against this order value.',
    approvedTitle: 'Credit Approved',
    approvedSubtitle: 'Your credit line is active. Proceed to submit your order.',
    continueLabel: 'Continue to Order',
    checkingLabel: 'Checking eligibility...',
  },
  loadingCompleted: {
    headerTitle: 'Loading Completed',
    title: 'Loading Verification Successful',
    subtitle:
      'All operational checks passed at terminal gates. Your consignment is ready for the next step.',
    continueLabel: 'Continue',
  },
  paymentReminder: {
    headerTitle: 'Payment Reminder',
    title: 'Action Required: Complete Payment',
    subtitle:
      'Your shipment has been loaded and verified. Complete payment to release dispatch.',
    payNowLabel: 'Upload Payment Proof',
    amountLabel: 'Total Payable Amount',
    methodLabel: 'Payment Method',
    methodValue: 'On Loading Payment',
  },
  paymentSuccess: {
    headerTitle: 'Payment Success',
    title: 'Payment Verified Successfully',
    subtitle: 'Your payment has been confirmed. This transaction is now complete.',
    continueLabel: 'Go To Orders',
  },
} as const;
