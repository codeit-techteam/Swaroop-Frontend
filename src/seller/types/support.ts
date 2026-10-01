export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketCategory =
  | 'order_issue'
  | 'payment'
  | 'dispatch'
  | 'inventory'
  | 'compliance'
  | 'account'
  | 'other';

export type TicketFilterTab = 'open' | 'resolved' | 'closed';

export type SupportTicket = {
  id: string;
  ticketId: string;
  category: TicketCategory;
  categoryLabel: string;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  createdDate: string;
  attachmentName?: string;
  /** Support asked the seller for more information. */
  awaitingReply?: boolean;
  supportReply?: { body: string; senderName: string };
  resolutionNote?: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SupportContact = {
  id: string;
  label: string;
  value: string;
  type: 'phone' | 'email' | 'chat';
};

export type SupportSnapshot = {
  tickets: SupportTicket[];
  faqs: FaqItem[];
  contacts: SupportContact[];
};

export type RaiseTicketInput = {
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  attachmentName?: string;
};
