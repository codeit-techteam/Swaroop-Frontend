import { apiClient } from '@/api/client';
import {
  MOCK_FAQS,
  MOCK_SUPPORT_CONTACTS,
  TICKET_CATEGORY_OPTIONS,
} from '@/seller/mock/support';
import type {
  RaiseTicketInput,
  SupportSnapshot,
  SupportTicket,
  TicketCategory,
  TicketFilterTab,
  TicketPriority,
  TicketStatus,
} from '@/seller/types/support';

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

const CATEGORY_TO_API: Record<TicketCategory, string> = {
  order_issue: 'ORDERS',
  payment: 'PAYMENT',
  dispatch: 'DISPATCH',
  inventory: 'INVENTORY',
  compliance: 'COMPLIANCE',
  account: 'ACCOUNT',
  other: 'OTHERS',
};

const PRIORITY_TO_API: Record<TicketPriority, string> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  urgent: 'CRITICAL',
};

const STATUS_FROM_API: Record<string, TicketStatus> = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_CUSTOMER: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const CATEGORY_FROM_API: Record<string, TicketCategory> = {
  ORDERS: 'order_issue',
  PAYMENT: 'payment',
  DISPATCH: 'dispatch',
  INVENTORY: 'inventory',
  COMPLIANCE: 'compliance',
  ACCOUNT: 'account',
  TECHNICAL: 'other',
  OTHERS: 'other',
  SHIPMENT: 'dispatch',
};

const PRIORITY_FROM_API: Record<string, TicketPriority> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'urgent',
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

function mapTicket(row: BackendTicket): SupportTicket {
  const category = CATEGORY_FROM_API[row.category] ?? 'other';
  const categoryLabel =
    row.categoryLabel ??
    TICKET_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ??
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

let ticketsCache: SupportTicket[] = [];

export function getSupportSnapshot(): SupportSnapshot {
  return {
    tickets: ticketsCache,
    faqs: MOCK_FAQS,
    contacts: MOCK_SUPPORT_CONTACTS,
  };
}

export function filterTicketsByTab(
  tickets: SupportTicket[],
  tab: TicketFilterTab,
): SupportTicket[] {
  if (tab === 'open') {
    return tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  }
  if (tab === 'resolved') {
    return tickets.filter((t) => t.status === 'resolved');
  }
  return tickets.filter((t) => t.status === 'closed');
}

export async function refreshSupportTickets(): Promise<SupportSnapshot> {
  const payload = await apiClient.get<Envelope<BackendTicket[]>>(
    '/seller/support/tickets?limit=100',
  );
  ticketsCache = (payload.data.data ?? []).map(mapTicket);
  return getSupportSnapshot();
}

export async function createSupportTicket(
  input: RaiseTicketInput,
): Promise<SupportTicket> {
  const payload = await apiClient.post<Envelope<BackendTicket>>(
    '/seller/support/tickets',
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

export function getTicketById(ticketId: string): SupportTicket | undefined {
  return ticketsCache.find((t) => t.id === ticketId || t.ticketId === ticketId);
}
