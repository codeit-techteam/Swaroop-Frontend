import { apiClient } from '@/api/client';
import {
  CUSTOMER_SUPPORT_CONTACTS,
  CUSTOMER_SUPPORT_FAQS,
  CUSTOMER_TICKET_CATEGORY_OPTIONS,
  type CustomerRaiseTicketInput,
  type CustomerSupportTicket,
  type CustomerTicketCategory,
  type CustomerTicketFilterTab,
  type CustomerTicketPriority,
  type CustomerTicketStatus,
} from '@/types/customer-support';

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type BackendTicket = {
  id: string;
  ticketNumber: string;
  category: string;
  categoryLabel?: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  attachmentName?: string | null;
  createdAt: string;
};

const CATEGORY_TO_API: Record<CustomerTicketCategory, string> = {
  orders: 'ORDERS',
  payment: 'PAYMENT',
  shipment: 'SHIPMENT',
  invoice: 'INVOICE',
  marketplace: 'MARKETPLACE',
  credit: 'CREDIT',
  others: 'OTHERS',
};

const PRIORITY_TO_API: Record<CustomerTicketPriority, string> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  critical: 'CRITICAL',
};

const STATUS_FROM_API: Record<string, CustomerTicketStatus> = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_CUSTOMER: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const CATEGORY_FROM_API: Record<string, CustomerTicketCategory> = {
  ORDERS: 'orders',
  PAYMENT: 'payment',
  SHIPMENT: 'shipment',
  INVOICE: 'invoice',
  MARKETPLACE: 'marketplace',
  CREDIT: 'credit',
  OTHERS: 'others',
  GST: 'invoice',
  TECHNICAL: 'others',
};

const PRIORITY_FROM_API: Record<string, CustomerTicketPriority> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

function formatCreatedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function mapTicket(row: BackendTicket): CustomerSupportTicket {
  const category = CATEGORY_FROM_API[row.category] ?? 'others';
  const categoryLabel =
    row.categoryLabel ??
    CUSTOMER_TICKET_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ??
    'Other';

  return {
    id: row.id,
    ticketId: row.ticketNumber,
    category,
    categoryLabel,
    priority: PRIORITY_FROM_API[row.priority] ?? 'medium',
    status: STATUS_FROM_API[row.status] ?? 'open',
    subject: row.subject,
    description: row.description,
    createdDate: formatCreatedDate(row.createdAt),
    attachmentName: row.attachmentName ?? undefined,
  };
}

let ticketsCache: CustomerSupportTicket[] = [];

export function getCustomerSupportSnapshot() {
  return {
    tickets: ticketsCache,
    faqs: CUSTOMER_SUPPORT_FAQS,
    contacts: CUSTOMER_SUPPORT_CONTACTS,
  };
}

export function filterCustomerTicketsByTab(
  tickets: CustomerSupportTicket[],
  tab: CustomerTicketFilterTab,
): CustomerSupportTicket[] {
  if (tab === 'open') {
    return tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  }
  if (tab === 'resolved') {
    return tickets.filter((t) => t.status === 'resolved');
  }
  return tickets.filter((t) => t.status === 'closed');
}

export async function refreshCustomerSupportTickets() {
  const payload = await apiClient.get<Envelope<BackendTicket[]>>(
    '/customer/support/tickets?limit=100',
  );
  ticketsCache = (payload.data.data ?? []).map(mapTicket);
  return getCustomerSupportSnapshot();
}

export async function createCustomerSupportTicket(
  input: CustomerRaiseTicketInput,
): Promise<CustomerSupportTicket> {
  const payload = await apiClient.post<Envelope<BackendTicket>>(
    '/customer/support/tickets',
    {
      category: CATEGORY_TO_API[input.category],
      priority: PRIORITY_TO_API[input.priority],
      subject: input.subject.trim(),
      description: input.description.trim(),
      attachmentName: input.attachmentName,
    },
  );
  if (!payload.data.data) {
    throw new Error(payload.data.message || 'Failed to create support ticket');
  }
  const ticket = mapTicket(payload.data.data);
  ticketsCache = [ticket, ...ticketsCache.filter((t) => t.id !== ticket.id)];
  return ticket;
}
