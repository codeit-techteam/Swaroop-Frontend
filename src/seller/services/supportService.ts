import { STORAGE_KEYS } from '@/constants';
import {
  MOCK_FAQS,
  MOCK_SUPPORT_CONTACTS,
  MOCK_SUPPORT_TICKETS,
  TICKET_CATEGORY_OPTIONS,
} from '@/seller/mock/support';
import type {
  RaiseTicketInput,
  SupportSnapshot,
  SupportTicket,
  TicketFilterTab,
} from '@/seller/types/support';
import { getStorageItem, setStorageItem } from '@/utils/storage';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadTickets(): SupportTicket[] {
  const raw = getStorageItem(STORAGE_KEYS.SELLER_SUPPORT_TICKETS);
  if (!raw) return [...MOCK_SUPPORT_TICKETS];
  try {
    return JSON.parse(raw) as SupportTicket[];
  } catch {
    return [...MOCK_SUPPORT_TICKETS];
  }
}

function persistTickets(tickets: SupportTicket[]): void {
  setStorageItem(STORAGE_KEYS.SELLER_SUPPORT_TICKETS, JSON.stringify(tickets));
}

let ticketsCache = loadTickets();

export function getSupportSnapshot(): SupportSnapshot {
  return {
    tickets: ticketsCache,
    faqs: MOCK_FAQS,
    contacts: MOCK_SUPPORT_CONTACTS,
  };
}

export function filterTicketsByTab(tickets: SupportTicket[], tab: TicketFilterTab): SupportTicket[] {
  if (tab === 'open') {
    return tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  }
  if (tab === 'resolved') {
    return tickets.filter((t) => t.status === 'resolved');
  }
  return tickets.filter((t) => t.status === 'closed');
}

export async function refreshSupportTickets(): Promise<SupportSnapshot> {
  await delay(1500);
  ticketsCache = loadTickets();
  return getSupportSnapshot();
}

export async function createSupportTicket(input: RaiseTicketInput): Promise<SupportTicket> {
  await delay(1200);
  const categoryLabel =
    TICKET_CATEGORY_OPTIONS.find((opt) => opt.value === input.category)?.label ?? 'Other';

  const ticket: SupportTicket = {
    id: `tkt-${Date.now()}`,
    ticketId: `PT-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    category: input.category,
    categoryLabel,
    priority: input.priority,
    status: 'open',
    subject: input.subject,
    description: input.description,
    createdDate: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    attachmentName: input.attachmentName,
  };

  ticketsCache = [ticket, ...ticketsCache];
  persistTickets(ticketsCache);
  return ticket;
}

export function getTicketById(ticketId: string): SupportTicket | undefined {
  return ticketsCache.find((t) => t.id === ticketId || t.ticketId === ticketId);
}
