import { useCallback, useMemo, useState } from 'react';

import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import {
  createSupportTicket,
  filterTicketsByTab,
  getSupportSnapshot,
  refreshSupportTickets,
} from '@/seller/services/supportService';
import type { RaiseTicketInput, TicketFilterTab } from '@/seller/types/support';

export function useSellerSupport() {
  const [snapshot, setSnapshot] = useState(() => getSupportSnapshot());
  const [activeTab, setActiveTab] = useState<TicketFilterTab>('open');
  // Local snapshot is available synchronously.
  const isLoading = false;

  const filteredTickets = useMemo(
    () => filterTicketsByTab(snapshot.tickets, activeTab),
    [snapshot.tickets, activeTab],
  );

  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    const next = await refreshSupportTickets();
    setSnapshot(next);
  });

  const submitTicket = useCallback(async (input: RaiseTicketInput) => {
    const ticket = await createSupportTicket(input);
    setSnapshot(getSupportSnapshot());
    return ticket;
  }, []);

  return {
    snapshot,
    filteredTickets,
    activeTab,
    setActiveTab,
    isLoading,
    isRefreshing,
    refresh,
    submitTicket,
  };
}
