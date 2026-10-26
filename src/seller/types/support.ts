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

export type SupportMessageSender = 'REQUESTER' | 'AGENT' | 'SYSTEM';

export type SupportTicketMessage = {
  id: string;
  sender: SupportMessageSender;
  senderName: string;
  body: string;
  createdAt: string;
};

/** Raw backend status — needed for reply rules (CLOSED vs RESOLVED). */
export type SupportApiStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED';

export type SupportTicket = {
  id: string;
  ticketId: string;
  category: TicketCategory;
  categoryLabel: string;
  priority: TicketPriority;
  status: TicketStatus;
  apiStatus: SupportApiStatus;
  subject: string;
  description: string;
  createdDate: string;
  createdAt: string;
  updatedAt: string;
  attachmentName?: string;
  /** Support asked the seller for more information. */
  awaitingReply?: boolean;
  supportReply?: { body: string; senderName: string };
  resolutionNote?: string;
  messages: SupportTicketMessage[];
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
