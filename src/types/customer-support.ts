export type CustomerTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type CustomerTicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type CustomerTicketCategory =
  | 'orders'
  | 'payment'
  | 'shipment'
  | 'invoice'
  | 'marketplace'
  | 'credit'
  | 'others';

export type CustomerTicketFilterTab = 'open' | 'resolved' | 'closed';

export type CustomerSupportTicket = {
  id: string;
  ticketId: string;
  category: CustomerTicketCategory;
  categoryLabel: string;
  priority: CustomerTicketPriority;
  status: CustomerTicketStatus;
  subject: string;
  description: string;
  createdDate: string;
  attachmentName?: string;
  /** Support asked the customer for more information. */
  awaitingReply?: boolean;
  supportReply?: { body: string; senderName: string };
  resolutionNote?: string;
};

export type CustomerRaiseTicketInput = {
  category: CustomerTicketCategory;
  priority: CustomerTicketPriority;
  subject: string;
  description: string;
  attachmentName?: string;
};

export const CUSTOMER_TICKET_CATEGORY_OPTIONS = [
  { label: 'Order', value: 'orders' },
  { label: 'Payment', value: 'payment' },
  { label: 'Shipment', value: 'shipment' },
  { label: 'Documents', value: 'invoice' },
  { label: 'Marketplace', value: 'marketplace' },
  { label: 'Account', value: 'credit' },
  { label: 'Other', value: 'others' },
] as const;

export const CUSTOMER_TICKET_PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
] as const;

/** Built at runtime from GET /public/legal-links — never invent a mailbox or phone. */
export type CustomerSupportContact = {
  id: string;
  label: string;
  value: string;
  type: 'phone' | 'email' | 'link';
};

export const CUSTOMER_SUPPORT_CONTACTS: CustomerSupportContact[] = [];

export const CUSTOMER_SUPPORT_FAQS = [
  {
    id: 'faq-1',
    question: 'How long does ticket resolution take?',
    answer: 'Our support team typically responds within 24 business hours.',
  },
  {
    id: 'faq-2',
    question: 'Can I track shipment issues here?',
    answer: 'Yes. Raise a Shipment ticket and include your order or PR reference.',
  },
];
