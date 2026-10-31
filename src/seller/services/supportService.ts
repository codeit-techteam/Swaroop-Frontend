import { apiClient } from '@/api/client';
import { MOCK_FAQS, TICKET_CATEGORY_OPTIONS } from '@/seller/mock/support';
import type {
  RaiseTicketInput,
  SupportApiStatus,
  SupportMessageSender,
  SupportContact,
  SupportSnapshot,
  SupportTicket,
  SupportTicketMessage,
  TicketCategory,
  TicketFilterTab,
  TicketPriority,
  TicketStatus,
} from '@/seller/types/support';
import { fetchLegalLinks } from '@/services/legal-links';

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
  resolutionNote?: string | null;
  createdAt: string;
  updatedAt?: string;
  messages?: {
    id?: string;
    sender: string;
    senderName: string;
    body: string;
    createdAt?: string;
  }[];
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

function mapApiStatus(status: string): SupportApiStatus {
  if (
    status === 'OPEN' ||
    status === 'IN_PROGRESS' ||
    status === 'WAITING_CUSTOMER' ||
    status === 'RESOLVED' ||
    status === 'CLOSED'
  ) {
    return status;
  }
  return 'OPEN';
}

function mapMessages(row: BackendTicket): SupportTicketMessage[] {
  return (row.messages ?? []).map((m, index) => {
    const sender: SupportMessageSender =
      m.sender === 'AGENT' || m.sender === 'SYSTEM' ? m.sender : 'REQUESTER';
    return {
      id: m.id ?? `${row.id}-msg-${index}`,
      sender,
      senderName: m.senderName || (sender === 'AGENT' ? 'Support' : 'You'),
      body: m.body,
      createdAt: m.createdAt ?? row.createdAt,
    };
  });
}

function supportReplyFields(row: BackendTicket, messages: SupportTicketMessage[]) {
  const lastAgent = [...messages].reverse().find((m) => m.sender === 'AGENT');
  const terminal = row.status === 'RESOLVED' || row.status === 'CLOSED';
  return {
    awaitingReply: row.status === 'WAITING_CUSTOMER',
    supportReply: lastAgent
      ? { body: lastAgent.body, senderName: lastAgent.senderName }
      : undefined,
    resolutionNote: terminal ? (row.resolutionNote ?? undefined) : undefined,
  };
}

function mapTicket(row: BackendTicket): SupportTicket {
  const category = CATEGORY_FROM_API[row.category] ?? 'other';
  const categoryLabel =
    row.categoryLabel ??
    TICKET_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ??
    'Other';
  const messages = mapMessages(row);
  const createdAt = row.createdAt;
  const updatedAt = row.updatedAt ?? row.createdAt;

  return {
    id: row.id,
    ticketId: row.ticketNumber,
    category,
    categoryLabel,
    priority: PRIORITY_FROM_API[row.priority] ?? 'medium',
    status: STATUS_FROM_API[row.status] ?? 'open',
    apiStatus: mapApiStatus(row.status),
    subject: row.subject,
    description: row.description,
    createdDate: formatCreatedDate(createdAt),
    createdAt,
    updatedAt,
    attachmentName: row.attachmentName ?? undefined,
    messages,
    ...supportReplyFields(row, messages),
  };
}

let ticketsCache: SupportTicket[] = [];

function upsertTicket(ticket: SupportTicket) {
  ticketsCache = [ticket, ...ticketsCache.filter((t) => t.id !== ticket.id)];
}

async function resolveSellerSupportContacts(): Promise<SupportContact[]> {
  try {
    const links = await fetchLegalLinks();
    const contacts: SupportContact[] = [];
    if (links.supportEmail) {
      contacts.push({
        id: 'email',
        label: 'Email Support',
        value: links.supportEmail,
        type: 'email',
      });
    }
    return contacts;
  } catch {
    return [];
  }
}

let contactsCache: SupportContact[] = [];

export function getSupportSnapshot(): SupportSnapshot {
  return {
    tickets: ticketsCache,
    faqs: MOCK_FAQS,
    contacts: contactsCache,
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

/** Prefer tickets that need a reply, then other open threads — used by Chat Support. */
export function getPreferredChatTicket(
  tickets: SupportTicket[] = ticketsCache,
): SupportTicket | undefined {
  const open = tickets.filter((t) => t.apiStatus !== 'CLOSED' && t.apiStatus !== 'RESOLVED');
  const awaiting = open.find((t) => t.awaitingReply);
  if (awaiting) return awaiting;
  return [...open].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];
}

export async function refreshSupportTickets(): Promise<SupportSnapshot> {
  try {
    const payload = await apiClient.get<Envelope<BackendTicket[]>>(
      '/seller/support/tickets?limit=100',
    );
    ticketsCache = (payload.data.data ?? []).map(mapTicket);
  } catch {
    // Keep last known tickets.
  }
  contactsCache = await resolveSellerSupportContacts();
  return getSupportSnapshot();
}

export async function getSupportTicket(ticketId: string): Promise<SupportTicket> {
  const payload = await apiClient.get<Envelope<BackendTicket>>(
    `/seller/support/tickets/${ticketId}`,
  );
  if (!payload.data.data) {
    throw new Error(payload.data.message || 'Support ticket not found');
  }
  const ticket = mapTicket(payload.data.data);
  upsertTicket(ticket);
  return ticket;
}

export async function createSupportTicket(input: RaiseTicketInput): Promise<SupportTicket> {
  const payload = await apiClient.post<Envelope<BackendTicket>>('/seller/support/tickets', {
    category: CATEGORY_TO_API[input.category],
    priority: PRIORITY_TO_API[input.priority],
    subject: input.subject.trim(),
    description: input.description.trim(),
    attachmentName: input.attachmentName,
    channel: 'APP',
  });
  if (!payload.data.data) {
    throw new Error(payload.data.message || 'Failed to create support ticket');
  }
  const ticket = mapTicket(payload.data.data);
  upsertTicket(ticket);
  return ticket;
}

export async function replySupportTicket(ticketId: string, body: string): Promise<SupportTicket> {
  const payload = await apiClient.post<Envelope<BackendTicket>>(
    `/seller/support/tickets/${ticketId}/reply`,
    { body: body.trim() },
  );
  if (!payload.data.data) {
    throw new Error(payload.data.message || 'Failed to send reply');
  }
  const ticket = mapTicket(payload.data.data);
  upsertTicket(ticket);
  return ticket;
}

export function getTicketById(ticketId: string): SupportTicket | undefined {
  return ticketsCache.find((t) => t.id === ticketId || t.ticketId === ticketId);
}
