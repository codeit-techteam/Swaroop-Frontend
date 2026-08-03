import type { FaqItem, SupportContact, SupportTicket } from '@/seller/types/support';

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-1',
    ticketId: 'PT-2026-1042',
    category: 'payment',
    categoryLabel: 'Payment & Settlement',
    priority: 'high',
    status: 'open',
    subject: 'Settlement delay for January batch',
    description: 'Settlement for order batch SB-2026-01 has not been released after 7 days.',
    createdDate: '28 Jan 2026',
  },
  {
    id: 'tkt-2',
    ticketId: 'PT-2026-1038',
    category: 'dispatch',
    categoryLabel: 'Dispatch & Logistics',
    priority: 'medium',
    status: 'in_progress',
    subject: 'Vehicle assignment issue for ORD-8829',
    description: 'Unable to assign vehicle to shipment SHP-4421.',
    createdDate: '26 Jan 2026',
  },
  {
    id: 'tkt-3',
    ticketId: 'PT-2026-1025',
    category: 'inventory',
    categoryLabel: 'Inventory',
    priority: 'low',
    status: 'resolved',
    subject: 'Stock mismatch in Hazira warehouse',
    description: 'Available stock showing incorrect quantity for HDPE H110MA.',
    createdDate: '20 Jan 2026',
  },
  {
    id: 'tkt-4',
    ticketId: 'PT-2026-1012',
    category: 'compliance',
    categoryLabel: 'Compliance',
    priority: 'urgent',
    status: 'closed',
    subject: 'GST certificate renewal',
    description: 'Need assistance uploading renewed GST certificate.',
    createdDate: '15 Jan 2026',
    attachmentName: 'gst-renewal.pdf',
  },
  {
    id: 'tkt-5',
    ticketId: 'PT-2026-1008',
    category: 'order_issue',
    categoryLabel: 'Order Issue',
    priority: 'medium',
    status: 'open',
    subject: 'Buyer credit assessment pending',
    description: 'Order ORD-8810 stuck in credit assessment for 48 hours.',
    createdDate: '14 Jan 2026',
  },
  {
    id: 'tkt-6',
    ticketId: 'PT-2026-0995',
    category: 'account',
    categoryLabel: 'Account',
    priority: 'low',
    status: 'resolved',
    subject: 'Update bank account details',
    description: 'Request to update primary settlement bank account.',
    createdDate: '10 Jan 2026',
  },
];

export const MOCK_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How do I create a bulk offer?',
    answer:
      'Navigate to My Offers from your profile or dashboard, tap Create Offer, fill in material details, pricing tiers, and submit for review.',
  },
  {
    id: 'faq-2',
    question: 'When are settlements released?',
    answer:
      'Settlements are typically released within 3-5 business days after delivery confirmation and invoice verification.',
  },
  {
    id: 'faq-3',
    question: 'How do I upload KYC documents?',
    answer:
      'Go to Profile > KYC Documents or Documents Center to upload GST, PAN, Trade License, and other compliance files.',
  },
  {
    id: 'faq-4',
    question: 'What happens when inventory is low?',
    answer:
      'You will receive a notification alert. Active offers may be paused automatically if stock falls below MOQ.',
  },
  {
    id: 'faq-5',
    question: 'How do I track shipments?',
    answer:
      'Open My Shipments from your profile or the dashboard dispatch section to view real-time shipment status and ETA.',
  },
];

export const MOCK_SUPPORT_CONTACTS: SupportContact[] = [
  { id: 'c-1', label: 'Trade Manager', value: '+91 98765 43210', type: 'phone' },
  { id: 'c-2', label: 'Emergency Support', value: '+91 1800 123 4567', type: 'phone' },
  { id: 'c-3', label: 'Email Support', value: 'seller-support@petrotrade.in', type: 'email' },
  { id: 'c-4', label: 'Live Chat', value: 'Coming Soon', type: 'chat' },
];

export const TICKET_CATEGORY_OPTIONS = [
  { label: 'Order Issue', value: 'order_issue' },
  { label: 'Payment & Settlement', value: 'payment' },
  { label: 'Dispatch & Logistics', value: 'dispatch' },
  { label: 'Inventory', value: 'inventory' },
  { label: 'Compliance', value: 'compliance' },
  { label: 'Account', value: 'account' },
  { label: 'Other', value: 'other' },
] as const;

export const TICKET_PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
] as const;

export const TICKET_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};
