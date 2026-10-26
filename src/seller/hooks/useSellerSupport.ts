import { useCallback, useMemo, useState } from 'react';

import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import {
  createSupportTicket,
  filterTicketsByTab,
  getPreferredChatTicket,
  getSupportSnapshot,
  getSupportTicket,
  refreshSupportTickets,
  replySupportTicket,
} from '@/seller/services/supportService';
import type { RaiseTicketInput, TicketFilterTab } from '@/seller/types/support';

export function useSellerSupport() {
  const [snapshot, setSnapshot] = useState(() => getSupportSnapshot());
  const [activeTab, setActiveTab] = useState<TicketFilterTab>('open');
  const [isLoading, setIsLoading] = useState(true);

  const filteredTickets = useMemo(
    () => filterTicketsByTab(snapshot.tickets, activeTab),
    [snapshot.tickets, activeTab],
  );

  const preferredChatTicket = useMemo(
    () => getPreferredChatTicket(snapshot.tickets),
    [snapshot.tickets],
  );

  const load = useCallback(async () => {
    const next = await refreshSupportTickets();
    setSnapshot(next);
    setIsLoading(false);
  }, []);

  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    await load();
  });

  const submitTicket = useCallback(async (input: RaiseTicketInput) => {
    const ticket = await createSupportTicket(input);
    setSnapshot(getSupportSnapshot());
    return ticket;
  }, []);

  const loadTicket = useCallback(async (ticketId: string) => {
    const ticket = await getSupportTicket(ticketId);
    setSnapshot(getSupportSnapshot());
    return ticket;
  }, []);

  const sendReply = useCallback(async (ticketId: string, body: string) => {
    const ticket = await replySupportTicket(ticketId, body);
    setSnapshot(getSupportSnapshot());
    return ticket;
  }, []);

  const initialLoad = useCallback(async () => {
    setIsLoading(true);
    try {
      await load();
    } catch {
      setIsLoading(false);
    }
  }, [load]);

  return {
    snapshot,
    filteredTickets,
    preferredChatTicket,
    activeTab,
    setActiveTab,
    isLoading,
    isRefreshing,
    refresh: initialLoad,
    reload: load,
    pullRefresh: refresh,
    submitTicket,
    loadTicket,
    sendReply,
  };
}
